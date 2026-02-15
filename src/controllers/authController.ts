import { Request, Response, 
  NextFunction 
} from 'express';
import crypto from 'crypto';
import User, { IUser } from '../models/User.js';
import { createSendToken } from '../utils/authUtils.js';
import sendEmail from '../utils/email.js';
import catchAsync from '../utils/catchAsync.js'; // Ensure path is correct
import AppError from '../utils/appError.js';   // Ensure path is correct
import { getPasswordResetTemplate } from '../utils/emailTemplate.js';
import { LoginInput, SignupInput, UpdateMeInput } from '../models/zodUser.schema.js';
import sendMail from '../utils/email.js';
import { getWelcomeTemplate } from '../utils/welcomeEmail.js';


/**
 * @desc    1. SIGNUP
 */
export const signup = catchAsync(async (
  req: Request <{}, {}, SignupInput>, // Typed Body
  res: Response, 
  // next: NextFunction 
) => {
  // No need for "if (!req.body.name)" anymore. Zod guaranteed it exists.
  // Zod already stripped unwanted fields and validated requirements
  const newUser = await User.create(req.body);

  // 2. WIRING: Send the Welcome Email

  // 1. Generate Verification Token
  const verifyToken = newUser.createEmailVerificationToken();
  await newUser.save({ validateBeforeSave: false });

  // 2. Create the URL
  const verifyURL = `${req.protocol}://${req.get('host')}/auth/verify-email/${verifyToken}`;

  // 3. Send Email
  try {
    await sendMail({
      email: newUser.email,
      subject: 'Verify your WCC Account ✅',
      message: `Welcome! Please verify your email: ${verifyURL}`,
      html: getWelcomeTemplate(newUser.name, verifyURL),
    });
  } catch (err) {
    console.error('Email failed');
  }

  // // We wrap this in a separate try/catch so a SendGrid error doesn't 
  // // stop the user from logging in.
  // try {
  //   await sendMail({
  //     email: newUser.email,
  //     subject: 'Welcome to Weren-Care Charity! 🎉',
  //     message: `Hi ${newUser.name}, welcome to WCC Nigeria!`,
  //     html: getWelcomeTemplate(newUser.name),
  //   });
  // } catch (emailErr) {
  //   // We log the error but don't stop the process
  //   console.error('Email failed to send, but user was created successfully:', emailErr);
  // }

  createSendToken(newUser, 201, res);
});
// const newUser = await User.create({
//     name: req.body.name,
//     email: req.body.email,
//     password: req.body.password,
//     phone: req.body.phone,
//   });

/**
 * @desc    2. LOGIN
 */
export const login = catchAsync(async (
  req: Request<{}, {}, LoginInput>, //typed body!
  res: Response, 
  next: NextFunction
) => {
  const { email, password } = req.body; // TS knows these are strings

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 1) Check if user exists & password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // ✅ THE CHECK: Ensure email is verified
  if (!user.isVerified) {
    return next(new AppError('Please verify your email address before logging in.', 401));
  }

    // Inside your login function in authController.ts
  if (user.mustChangePassword) {
    return res.status(200).json({
      status: 'force-reset',
      message: `Dear ${user.name}, kindly change your password to login.`,
      resetToken: user.createPasswordResetToken() // Optionally generate a token immediately
    });
  }

  // 2) Send token
  createSendToken(user, 200, res);
});

export const verifyEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1. Get and hash the token from the URL
  const token = req.params.token as string;
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // 2. Grab the frontend base URL from .env
  const frontendURL = process.env.FRONTEND_URL;

  // 3. Find user with this token
  const user = await User.findOne({ emailVerificationToken: hashedToken });

  // 4. CASE: Invalid or Expired Token
  if (!user) {
    return res.redirect(`${frontendURL}/verify-issue`);
  }

  // 5. CASE: User is already verified (Prevents redundant DB writes)
  if (user.isVerified) {
    return res.redirect(`${frontendURL}/signinp?status=already_active`);
  }

  // 6. Success: Update user status
  user.isVerified = true;
  user.emailVerificationToken = undefined; 
  await user.save({ validateBeforeSave: false });

  // 7. Redirect to Success Page
  res.redirect(`${frontendURL}/verify-success`);
});


// export const verifyEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//   // 1. Hash the token from the URL
//   const token = req.params.token as string
//   const hashedToken = crypto
//     .createHash('sha256')
//     .update(token)
//     .digest('hex');

//   // 2. Find user with this token
//   const user = await User.findOne({ emailVerificationToken: hashedToken });

//   if (!user) {
//     return next(new AppError('Invalid OTP or has expired', 400));
//   }

//   // 3. Update user status
//   user.isVerified = true;
//   user.emailVerificationToken = undefined;
//   await user.save({ validateBeforeSave: false });

//   res.status(200).json({
//     status: 'success',
//     message: 'Email verified successfully! Kudos... you can now use all features.'
//   });
// });

/**
 * @desc    Resend Email Verification Link
 */
export const resendVerification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  // 1. Find the user
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('No user found with that email address.', 404));
  }

  // 2. Check if already verified
  if (user.isVerified) {
    return next(new AppError('This account is already verified. Please log in.', 400));
  }

  // 3. Generate new verification token
  const verifyToken = user.createEmailVerificationToken();
  
  // Save changes (disable validation to ignore password requirements)
  await user.save({ validateBeforeSave: false });

  // 4. Create URL and Send Email
  const verifyURL = `${req.protocol}://${req.get('host')}/auth/verify-email/${verifyToken}`;

  try {
    await sendMail({
      email: user.email,
      subject: 'New Verification Link - Weren-Care Charity ✅',
      message: `Your new verification link: ${verifyURL}`,
      html: getWelcomeTemplate(user.name, verifyURL),
    });

    res.status(200).json({
      status: 'success',
      message: 'A fresh verification link has been sent to your email.'
    });
  } catch (err) {
    // If email fails, clear the token so user can try again
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });
    
    return next(new AppError('There was an error sending the email. Try again later.', 500));
  }
});

/**
 * @desc    3. LOGOUT
 */
export const logout = (
  req: Request, 
  res: Response
) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),  // Expires in 10 seconds
    httpOnly: true,
  });
  res.status(200).json({ status: 'success! please come back, we will miss you' });
};

/**
 * @desc    4. FORGOT PASSWORD
 */
export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it via email
  // const resetURL = `${req.protocol}://${req.get('host')}/api/auth/resetPassword/${resetToken}`;
  // const message = `Forgot your password? Reset it here: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  // Inside forgotPassword in authController.ts
  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const html = getPasswordResetTemplate(user.name, resetURL);
  const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset (valid for 10 min)',
      message,
      html, // The HTML template
    });

    res.status(200).json({ status: 'success', message: 'Token sent to email!' });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});

/**
 * @desc    5. RESET PASSWORD
 */
export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Get user based on the token
  const hashedToken = crypto.createHash('sha256').update(req.params.token as string).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Log the user in, send JWT
  createSendToken(user, 200, res);
});

/**
 * @desc    6. UPDATE PROFILE
 */
export const updateMe = catchAsync(async (
  req: Request<{}, {}, UpdateMeInput>, 
  res: Response, 
  next: NextFunction
) => {
  // 1) Create error if user POSTs password data
  if ('password' in req.body) {
    return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400));
  }

  // 1) req.body is already filtered by Zod .strict(), so no need to manual filter!
  
  // // 2) Filtered out unwanted fields names that are not allowed to be updated
  // const filteredBody: any = {};
  // ['name', 'email', 'phone'].forEach((el) => {
  //   if (req.body[el]) filteredBody[el] = req.body[el];
  // });

// Only allow updating name and email
const filteredBody = {
  name: req.body.name,
  email: req.body.email,
  phone: req.body.phone
};

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate((req.user as IUser)._id, filteredBody, {
    new: true,
    runValidators: true,
  });

if (!updatedUser) {
  return res.status(404).json({
    status: 'fail',
    message: 'No user found with that ID'
  });
}

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
});


//Admin Controllers can be added here
/**
 * @desc    Get all users (Admin only)
 */
export const getAllUsers = catchAsync(async (
  // req: Request, 
  res: Response
) => {
  const users = await User.find();

  res.status(200).json({
    status: 'Successfully fetched all users',
    results: users.length,
    data: { users }
  });
});

/**
 * @desc    Update any user data (Admin only)
 */
export const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!updatedUser) return next(new AppError('No user found with that UserID', 404));

  res.status(200).json({
    status: 'User Updated Successfully',
    data: { user: updatedUser }
  });
});

/**
 * @desc    Delete user
 */
export const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) return next(new AppError('No user found with that ID', 404));

  res.status(204).json({ status: 'UserID deleted successfully', data: null });
});

/**
 * @desc    Dynamically enforce password reset
 */
export const enforcePasswordReset = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findByIdAndUpdate(req.params.id, { 
    mustChangePassword: true 
  }, { new: true });

  if (!user) return next(new AppError('No user found with that ID', 404));

  res.status(200).json({
    status: 'success',
    message: `User ${user.name} will be forced to reset password on next login.`
  });
});