import { Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/User.js';

export const signToken = (id: string): string => {
  const secret = process.env.JWT_SECRET as string;
  
  const options: SignOptions = {
    // expiresIn from env is usually a string like '30d'
    expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d',
  };

  return jwt.sign({ id }, secret, options);
};


export const createSendToken = (
  user: IUser,
  statusCode: number,
  res: Response
) => {
  const userId = user._id.toString();
  const token = signToken(userId);

  // const cookieExpiresInDays = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 7;
  const duration = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 7 * 24 * 60 * 60 * 1000;

  // 🔒 FORCE correct cross-domain behavior
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: true,      // ALWAYS true on Render + Vercel
    sameSite: 'none',  // REQUIRED for cross-domain cookies
    path: '/',        // Ensure cookie is sent on all routes
    maxAge: duration, // Set maxAge for better compatibility
    expires: new Date(Date.now() + duration) // Set expires for better compatibility
    
    // maxAge: cookieExpiresInDays * 24 * 60 * 60 * 1000, // Set maxAge for better compatibility
    // expires: new Date(
    //   Date.now() + cookieExpiresInDays * 24 * 60 * 60 * 1000
    // )
  });

  // Sanitize user safely
  const safeUser = user.toObject();
  delete safeUser.password;
  delete safeUser.__v;
  delete safeUser.passwordChangedAt;

  res.status(statusCode).json({
    status: 'success',
    data: {
      user: safeUser
    }
  });
};


// export const createSendToken = (user: IUser, statusCode: number, res: Response) => {
//   const userId = (user._id as any).toString();
//   const token = signToken(userId);

//   const cookieExpiresInDays = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 7;
  
//   const cookieOptions = {
//     expires: new Date(
//       Date.now() + cookieExpiresInDays * 24 * 60 * 60 * 1000
//     ),
//     // 1. Only use Secure (HTTPS) in production
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     // 'none' is required for cross-site cookies, but only works if 'secure' is true
//     sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
//   };

//   res.cookie('jwt', token, cookieOptions);

//   // PRODUCTION REFINEMENT: Remove password and internal version keys securely
//   const userObj = user instanceof Object && 'toObject' in user 
//     ? (user as any).toObject() 
//     : user;

//   const { password, __v, passwordChangedAt, ...safeUser } = userObj;

//   res.status(statusCode).json({
//     status: 'success',
//     token,
//     data: {
//       user: safeUser
//     }
//   });
//  };