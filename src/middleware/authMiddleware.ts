import { 
  // Request, 
  Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User from '../models/User.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const protect = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  // 1) Getting token and check if it exists
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verification of token
  const decoded: any = await (promisify(jwt.verify) as any)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password! Please log in again.', 401));
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});







// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import User, { IUser } from '../models/User';

// // 1. Properly extend the Request type
// export interface AuthRequest extends Request {
//   user?: IUser;
// }

// interface JwtPayload {
//   id: string;
//   iat: number;
// }

// export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
//   try {
//     let token: string | undefined;

//     // 2. Check Authorization Header (Standard for Bearer Token)
//     if (req.headers.authorization?.startsWith('Bearer')) {
//       token = req.headers.authorization.split(' ')[1];
//     } 
//     // 3. Fallback to Cookie (Extra layer for web security)
//     else if (req.cookies?.jwt) {
//       token = req.cookies.jwt;
//     }

//     if (!token) {
//       return res.status(401).json({ message: 'Unauthorized. Please log in to access this route.' });
//     }

//     // 4. Verification
//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

//     // 5. User lookup
//     const currentUser = await User.findById(decoded.id);
//     if (!currentUser) {
//       return res.status(401).json({ message: 'The user belonging to this token no longer exists.' });
//     }

//     // 6. Final Grant
//     req.user = currentUser;
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: 'Invalid or expired token.' });
//   }
  
// };





// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import User, { IUser } from '../models/User';

// // Extend Express Request type to include user
// interface AuthRequest extends Request {
//   user?: IUser;
// }

// export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
//   let token: string | undefined;

//   if (req.headers.authorization?.startsWith('Bearer')) {
//     token = req.headers.authorization.split(' ')[1];
//   }

//   if (!token) {
//     return res.status(401).json({ message: 'Unauthorized. Please log in.' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
//     const user = await User.findById(decoded.id);

//     if (!user) return res.status(401).json({ message: 'User no longer exists' });

//     req.user = user;
//     next();
//   } catch (err) {
//     res.status(401).json({ message: 'Token invalid or expired' });
//   }
// };