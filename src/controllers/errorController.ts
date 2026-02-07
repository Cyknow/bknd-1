import { 
  // Request, 
  Response, 
  // NextFunction 
} from 'express';
import { ZodError } from 'zod';
import AppError from '../utils/appError.js';

// --- HELPERS (For Production Cleanup) ---

const handleDuplicateFieldsDB = (err: any) => {
  const value = Object.values(err.keyValue)[0];
  return new AppError(`Duplicate field value: ${value}. Please use another value!`, 400);
};

// Helper to handle Mongoose Validation Errors
const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  return new AppError(`Invalid input data: ${errors.join('. ')}`, 400);
};

// Helper to handle JWT Errors
const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

// --- MAIN EXPORT ---

export default (
  err: any, 
  // req: Request, 
  res: Response, 
  // next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    // 1. DEV MODE: Maximum info for debugging
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
    return;
  } 
    // 2. PRODUCTION MODE: Clean & Secure
    let error = { ...err };
    error.message = err.message;

    // A. Handle Zod Errors (The Gatekeeper)
    if (err instanceof ZodError) {
        res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: err.flatten().fieldErrors,
      });
      return;
    }

    // B. Handle Mongoose/JWT Errors (The Safety Nets)
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    // C. Send Operational vs Generic Error
    if (error.isOperational) {
      res.status(error.statusCode || 400).json({
        status: error.status || `fail`,
        message: error.message,
      });
    } else {
      // Programming or unknown error: don't leak details
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  };



















// import { Request, Response, NextFunction } from 'express';
// import AppError from '../utils/appError';
// import { ZodError } from 'zod';
// import { z } from 'zod';

// // Helper to handle Mongoose Duplicate Fields (Error Code 11000)
// const handleDuplicateFieldsDB = (err: any) => {
//   const value = Object.values(err.keyValue)[0];
//   return new AppError(`Duplicate field value: ${value}. Please use another value!`, 400);
// };

// // Helper to handle Mongoose Validation Errors
// const handleValidationErrorDB = (err: any) => {
//   const errors = Object.values(err.errors).map((el: any) => el.message);
//   return new AppError(`Invalid input data: ${errors.join('. ')}`, 400);
// };

// // Helper to handle JWT Errors
// const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);
// const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

// export default (err: any, req: Request, res: Response, next: NextFunction) => {
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';

//   // 1. Handle Zod Validation Errors
//   if (err instanceof ZodError) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Validation failed',
//       errors: err.flatten().fieldErrors, // Returns: { email: ["Invalid email"], password: ["Too short"] }
//     });
//   }

//   // 2. Handle Mongoose Duplicate Key (e.g., Email already exists)
//   if (err.code === 11000) {
//     const value = Object.values(err.keyValue)[0];
//     return res.status(400).json({
//       status: 'fail',
//       message: `Duplicate field value: "${value}". Please use another value!`,
//     });
//   }

//   // 3. Handle JWT Errors
//   if (err.name === 'JsonWebTokenError') {
//     return res.status(401).json({ status: 'fail', message: 'Invalid token. Please log in again.' });
//   }


//   if (process.env.NODE_ENV === 'development') {
//     // 1. DEV: Give me the stack trace so I can fix the bug
//     res.status(err.statusCode).json({
//       status: err.status,
//       error: err,
//       message: err.message,
//       stack: err.stack,
//     });
//   } else {
//     // 2. PROD: Catch specific known library errors first
//     let error = { ...err, message: err.message };

//     // Zod integration (The new part of your stack)
//     if (err instanceof z.ZodError) {
//        return res.status(400).json({
//          status: 'fail',
//          message: 'Validation failed',
//          errors: err.flatten().fieldErrors 
//        });
//     }

//     // Standard Operational Check
//     res.status(err.statusCode).json({
//       status: err.status,
//       message: err.isOperational ? err.message : 'Something went very wrong!',
//     });
//   }
// };




// //   if (process.env.NODE_ENV === 'development') {
// //     // Send everything to help you debug
// //     res.status(err.statusCode).json({
// //       status: err.status,
// //       error: err,
// //       message: err.message,
// //       stack: err.stack
// //     });
// //   } else {
// //     // PRODUCTION: Send friendly messages
// //     let error = { ...err, message: err.message };

// //     if (err.code === 11000) error = handleDuplicateFieldsDB(error);
// //     if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
// //     if (err.name === 'JsonWebTokenError') error = handleJWTError();
// //     if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

// //     res.status(error.statusCode).json({
// //       status: error.status,
// //       message: error.message || 'Something went very wrong!'
// //     });
// //   }
// // };