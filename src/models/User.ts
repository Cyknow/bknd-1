import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// 1. Define the User Interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'regularUser' | 'admin' | 'senior-admin';
  mustChangePassword: boolean;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordChangedAt?: Date;
  correctPassword(candidate: string, actual: string): Promise<boolean>;
  createPasswordResetToken(): string;
  changedPasswordAfter(JWTTimestamp: number): boolean; // Add this line
}

const userSchema = new Schema<IUser>({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'], 
    select: false, // Prevents password from leaking in queries
    minlength: 8
  },
  phone: { type: String },
  role: { 
    type: String, 
    enum: ['regularUser', 'admin', 'senior-admin'], 
    default: 'regularUser' 
  },
  // Add this to your userSchema
  mustChangePassword: {
    type: Boolean,
    default: false
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 2. MIDDLEWARE: Password Hashing
userSchema.pre<IUser>('save', async function() {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return;

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Set passwordChangedAt if the password was modified (and not a new document)
  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000); // subtract 1s to ensure token is valid
  }
});

// 3. INSTANCE METHOD: Verify Password
userSchema.methods.correctPassword = async function(
  candidate: string, 
  actual: string
): Promise<boolean> {
  return await bcrypt.compare(candidate, actual);
};

// 4. INSTANCE METHOD: Create Password Reset Token
userSchema.methods.createPasswordResetToken = function(): string {
  // Create a plain text token (the one we send to user email)
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash the token and save to database (to compare later)
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expiration (e.g., 10 minutes)
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

// 5. INSTANCE METHOD: Check if password was changed after token issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp: number): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      (this.passwordChangedAt.getTime() / 1000).toString(),
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

export default model<IUser>('User', userSchema);