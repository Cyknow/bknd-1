import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import { createSendToken } from '../utils/authUtils';
import sendEmail from '../utils/email';
import catchAsync from '../utils/catchAsync'; // Ensure path is correct
import AppError from '../utils/appError';   // Ensure path is correct
import { getPasswordResetTemplate } from '../utils/emailTemplate';

/**
 * @desc    1. SIGNUP
 */
export const signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
  });

  createSendToken(newUser, 201, res);
});

/**
 * @desc    2. LOGIN
 */
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 1) Check if user exists & password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
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

/**
 * @desc    3. LOGOUT
 */
export const logout = (req: Request, res: Response) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
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
export const updateMe = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  // 1) Create error if user POSTs password data
  if (req.body.password) {
    return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400));
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody: any = {};
  ['name', 'email', 'phone'].forEach((el) => {
    if (req.body[el]) filteredBody[el] = req.body[el];
  });

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
});


//Admin Controllers can be added here
/**
 * @desc    Get all users (Admin only)
 */
export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
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






// import { Request, Response, NextFunction } from 'express';
// import crypto from 'crypto';
// import User from '../models/User';
// import { createSendToken } from '../utils/authUtils';
// import sendEmail from '../utils/email';
// import catchAsync from 'utils/catchAsync';
// import AppError from 'utils/appError';

// /**
//  * @desc    1. SIGNUP
//  */
// export const signup = async (req: Request, res: Response) => {
//   try {
//     const newUser = await User.create({
//       name: req.body.name,
//       email: req.body.email,
//       password: req.body.password,
//       phone: req.body.phone,
//     });
//     createSendToken(newUser, 201, res);
//   } catch (err: any) {
//     res.status(400).json({ status: 'fail', message: err.message });
//   }
// };

// /**
//  * @desc    2. LOGIN
//  */
// export const login = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ message: 'Please provide email and password' });
//     }

//     const user = await User.findOne({ email }).select('+password');
//     if (!user || !(await user.correctPassword(password, user.password))) {
//       return res.status(401).json({ message: 'Incorrect email or password' });
//     }
//     createSendToken(user, 200, res);
//   } catch (err) {
//     res.status(500).json({ status: 'error', message: 'Internal server error' });
//   }
// };

// /**
//  * @desc    3. LOGOUT
//  */
// export const logout = (req: Request, res: Response) => {
//   res.cookie('jwt', 'loggedout', {
//     expires: new Date(Date.now() + 10 * 1000),
//     httpOnly: true,
//   });
//   res.status(200).json({ status: 'success' });
// };

// /**
//  * @desc    4. FORGOT PASSWORD
//  */
// export const forgotPassword = async (req: Request, res: Response) => {
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) return res.status(404).json({ message: 'User not found.' });

//   const resetToken = user.createPasswordResetToken();
//   await user.save({ validateBeforeSave: false });

//   const resetURL = `${req.protocol}://${req.get('host')}/api/auth/resetPassword/${resetToken}`;
  
//   try {
//     await sendEmail({
//       email: user.email,
//       subject: 'Password Reset (valid for 10 min)',
//       message: `Reset your password here: ${resetURL}`,
//     });
//     res.status(200).json({ status: 'success', message: 'Token sent to email!' });
//   } catch (err) {
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save({ validateBeforeSave: false });
//     res.status(500).json({ message: 'Email could not be sent.' });
//   }
// };

// /**
//  * @desc    5. RESET PASSWORD
//  */
// export const resetPassword = async (req: Request, res: Response) => {
//   const hashedToken = crypto.createHash('sha256').update(req.params.token as string).digest('hex');
// //   const hashedToken = crypto.createHash('sha256').update(req.params.token as string).digest('hex');
//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: new Date() },
//   });

//   if (!user) return res.status(400).json({ message: 'Token invalid/expired' });

//   user.password = req.body.password;
//   user.passwordResetToken = undefined;
//   user.passwordResetExpires = undefined;
//   await user.save();
//   createSendToken(user, 200, res);
// };

// /**
//  * @desc    6. UPDATE PROFILE
//  */
// export const updateMe = async (req: any, res: Response) => {
//   if (req.body.password) return res.status(400).json({ message: 'Not for password updates.' });

//   const filteredBody: any = {};
//   ['name', 'email', 'phone'].forEach(el => { if (req.body[el]) filteredBody[el] = req.body[el] });

//   const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
//     new: true,
//     runValidators: true,
//   });

//   res.status(200).json({ status: 'success', data: { user: updatedUser } });
// };























// import { Request, Response, NextFunction } from '


// import sendEmail from '../utils/email';
// import User from '../models/User';
// import { createSendToken } from '../utils/authUtils';
// import crypto from 'crypto';

// /**
//  * @desc    Register new user
//  * @route   POST /api/auth/signup
//  */
// export const signup = async (req: Request, res: Response) => {
//   const { name, email, password, phone } = req.body;
  
//   const newUser = await User.create({
//     name,
//     email,
//     password,
//     phone
//   });

//   createSendToken(newUser, 201, res);
// };

// /**
//  * @desc    Authenticate user & get token
//  * @route   POST /api/auth/signin
//  */
// export const login = async (req: Request, res: Response) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: 'Please provide email and password' });
//   }

//   // 1) Check if user exists && password is correct
//   const user = await User.findOne({ email }).select('+password');

//   if (!user || !(await user.correctPassword(password, user.password))) {
//     return res.status(401).json({ message: 'Incorrect email or password' });
//   }

//   // 2) If everything ok, send token
//   createSendToken(user, 200, res);
// };



// export const forgotPassword = async (req: any, res: any) => {
//   // 1) Get user based on POSTed email
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) {
//     return res.status(404).json({ message: 'There is no user with that email address.' });
//   }

//   // 2) Generate the random reset token (via the method we added to the Model)
//   const resetToken = user.createPasswordResetToken();
//   await user.save({ validateBeforeSave: false });

//   // 3) Send it via email
//   const resetURL = `${req.protocol}://${req.get('host')}/api/auth/resetPassword/${resetToken}`;
//   const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

//   try {
//     await sendEmail({
//       email: user.email,
//       subject: 'Your password reset token (valid for 10 min)',
//       message,
//     });

//     res.status(200).json({
//       status: 'success',
//       message: 'Token sent to email!',
//     });
//   } catch (err) {
//     // If sending fails, clean up the DB fields
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save({ validateBeforeSave: false });

//     return res.status(500).json({ message: 'There was an error sending the email. Try again later!' });
//   }
// };




// Add these to your userSchema
// passwordResetToken: String,
// passwordResetExpires: Date

// userSchema.methods.createPasswordResetToken = function() {
//   const resetToken = crypto.randomBytes(32).toString('hex');

//   this.passwordResetToken = crypto
//     .createHash('sha256')
//     .update(resetToken)
//     .digest('hex');

//   this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

//   return resetToken;
// };







// import { Response } from 'express';
// import { IUser } from '../models/User';

// // We extend the Request type locally to include the user attached by 'protect'
// interface AuthRequest extends Request {
//   user?: IUser;
// }

// /**
//  * @desc    Get current logged in user profile
//  * @route   GET /api/users/me
//  * @access  Private
//  */
// export const getProfile = async (req: any, res: Response) => {
//   try {
//     // req.user was populated by our 'protect' middleware
//     const user = req.user;

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.status(200).json({
//       status: 'success',
//       data: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         phone: user.phone,
//         createdAt: user.createdAt
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ message: 'Error retrieving profile data' });
//   }
// };