import { Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/User';

export const signToken = (id: string): string => {
  const secret = process.env.JWT_SECRET as string;
  
  const options: SignOptions = {
    // expiresIn from env is usually a string like '30d'
    expiresIn: (process.env.JWT_EXPIRES_IN as any) || '1d',
  };

  return jwt.sign({ id }, secret, options);
};

export const createSendToken = (user: IUser, statusCode: number, res: Response) => {
  const userId = (user._id as any).toString();
  const token = signToken(userId);

  const cookieExpiresInDays = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 7;
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + cookieExpiresInDays * 24 * 60 * 60 * 1000
    ),
    // 1. Only use Secure (HTTPS) in production
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // 'none' is required for cross-site cookies, but only works if 'secure' is true
    sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  };

  res.cookie('jwt', token, cookieOptions);

  // PRODUCTION REFINEMENT: Remove password and internal version keys securely
  const userObj = user instanceof Object && 'toObject' in user 
    ? (user as any).toObject() 
    : user;

  const { password, __v, passwordChangedAt, ...safeUser } = userObj;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: safeUser
    }
  });
 };






// import { Response } from 'express';
// import jwt, { SignOptions } from 'jsonwebtoken';
// import { IUser } from '../models/User';

// /**
//  * Signs a new JWT for a specific user ID
//  * Handles TypeScript overload issues by explicitly typing options
//  */
// export const signToken = (id: string): string => {
//   const secret = process.env.JWT_SECRET as string;
  
//   const options: SignOptions = {
//     // Casting to any to bridge the gap between process.env string and SignOptions types
//     expiresIn: (process.env.JWT_EXPIRES_IN as any) || '1d',
//   };

//   return jwt.sign({ id }, secret, options);
// };

// /**
//  * Standardized function to send tokens via Cookies + JSON Response
//  * Securely handles the "Double-Lock" (Token in Header + Token in Cookie)
//  */
// export const createSendToken = (user: IUser, statusCode: number, res: Response) => {
//   // 1. Generate Token (Converting ObjectId to string)
//   const userId = (user._id as any).toString();
//   const token = signToken(userId);

//   // 2. Setup Cookie Options
//   const cookieExpiresInDays = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 7;
  
//   const cookieOptions = {
//     expires: new Date(
//       Date.now() + cookieExpiresInDays * 24 * 60 * 60 * 1000
//     ),
//     httpOnly: true, // Prevents JavaScript from reading the cookie (anti-XSS)
//     secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in prod
//     sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
//   };

//   // 3. Attach Cookie to Response
//   res.cookie('jwt', token, cookieOptions);

//   // 4. Remove sensitive data from the user object before sending it
//   // Using a spread to avoid modifying the actual DB document if it's still attached to a session
//   const userData = {
//     id: user._id,
//     name: user.name,
//     email: user.email,
//     role: user.role,
//     phone: user.phone
//   };

//   // 5. Final Response
//   res.status(statusCode).json({
//     status: 'success',
//     token,
//     data: {
//       user: userData
//     }
//   });
// };













// import { Response } from 'express';
// import jwt from 'jsonwebtoken';
// import { IUser } from '../models/User';

// /**
//  * Signs a new JWT for a specific user ID
//  */
// export const signToken = (id: string): string => {
//   return jwt.sign({ id }, process.env.JWT_SECRET as string, {
//     expiresIn: process.env.JWT_EXPIRES_IN || '30d',
//   });
// };

// /**
//  * Standardized function to send tokens via Cookies + JSON Response
//  */
// export const createSendToken = (user: IUser, statusCode: number, res: Response) => {
//   // Use ._id.toString() to ensure TS doesn't complain about ObjectId vs string
//   const token = signToken((user._id as unknown as string).toString());

//   const cookieExpiresIn = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 7;

//   const cookieOptions: any = {
//     expires: new Date(
//       Date.now() + cookieExpiresIn * 24 * 60 * 60 * 1000
//     ),
//     httpOnly: true,
//     // In production, 'secure' ensures the cookie is sent only over HTTPS
//     secure: process.env.NODE_ENV === 'production',
//     // 'none' for cross-site if frontend/backend are on different domains
//     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
//   };

//   res.cookie('jwt', token, cookieOptions);

//   // Hide password from the response body
//   user.password = undefined as any;

//   res.status(statusCode).json({
//     status: 'success',
//     token,
//     data: {
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       }
//     },
//   });
// };








// import jwt from 'jsonwebtoken';

// /**
//  * Signs a new JWT for a specific user ID
//  */
// export const signToken = (id: string): string => {
//   return jwt.sign({ id }, process.env.JWT_SECRET as string, {
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   });
// };

// /**
//  * Standardized function to send tokens via Cookies + JSON Response
//  * (Best for production security against XSS)
//  */
// export const createSendToken = (user: any, statusCode: number, res: any) => {
//   const token = signToken(user._id);

//   const cookieOptions = {
//     expires: new Date(
//       Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
//     ),
//     httpOnly: true, // Prevents XSS attacks
//     secure: process.env.NODE_ENV === 'production', // Only sends over HTTPS
//   };

//   res.cookie('jwt', token, cookieOptions);

//   // Remove password from output
//   user.password = undefined;

//   res.status(statusCode).json({
//     status: 'success',
//     token,
//     data: { user },
//   });
// };