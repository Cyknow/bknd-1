import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import AppError from '../utils/appError.js';

// --- HELPERS ---

// --- HELPER FUNCTIONS FOR CLEAN ERRORS ---

// 1. Handle Invalid IDs (e.g., someone typing a fake ID in the URL)
const handleCastErrorDB = (err: any) => {
  // Before: `Invalid _id: 12345`
  // After: Generic message
  return new AppError('The requested resource could not be found.', 404);
};

// 2. Handle Duplicate Fields (e.g., trying to sign up with an email that exists)
// const handleCastErrorDB = (err: any) => {
//   const message = `Invalid ${err.path}: ${err.value}.`;
//   return new AppError(message, 400);
// };

// 2. Handle Duplicate Fields (e.g., trying to sign up with an email that exists)
const handleDuplicateFieldsDB = (err: any) => {
  // We no longer extract or show the 'value'.
  // This prevents "Account Enumeration" attacks.
  const message = `An account with this information already exists. Please try logging in or use different details.`;
  return new AppError(message, 400);
};

//best practice: try to get the value from the object first, fall back to regex if needed
// const handleDuplicateFieldsDB = (err: any) => {
//   // Try to get the value from the object first, fall back to regex if needed
//   let value = 'unknown';
  
//   if (err.keyValue) {
//     value = Object.values(err.keyValue)[0] as string;
//   } else if (err.errmsg) {
//     const match = err.errmsg.match(/(["'])(\\?.)*?\1/);
//     if (match) value = match[0];
//   }

//   return new AppError(`Duplicate field value: ${value}. Please use another value!`, 400);
// };

// const handleDuplicateFieldsDB = (err: any) => {
//   // Extract the value between quotes using regex
//   const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
//   const message = `Duplicate field value: ${value}. Please use another value!`;
//   return new AppError(message, 400);
// };

// 3. Handle Mongoose Validation Errors (e.g., password too short)
const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// 4. Handle Invalid JWT (e.g., someone tampered with the token)
const handleJWTError = () => 
  new AppError('Invalid session. Please log in again.', 401);

// 5. Handle Expired JWT
const handleJWTExpiredError = () => 
  new AppError('Your session has expired. Please log in again.', 401);

// const handleDuplicateFieldsDB = (err: any) => {
//   // Use ?. to prevent crashing if keyValue is missing
//   const value = err.keyValue ? Object.values(err.keyValue)[0] : 'unknown';
//   return new AppError(`Duplicate field value: ${value}. Please use another value!`, 400);
// };

// const handleValidationErrorDB = (err: any) => {
//   const errors = Object.values(err.errors || {}).map((el: any) => el.message);
//   return new AppError(`Invalid input data: ${errors.join('. ')}`, 400);
// };

// --- MAIN EXPORT ---
// IMPORTANT: You MUST keep all 4 parameters (err, req, res, next) 
// for Express to recognize this as an error handler.
export default (err: any, req: Request, res: Response, next: NextFunction): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
    return;
  } 

  // PRODUCTION MODE
  let error = { ...err };
  error.message = err.message;

  if (err instanceof ZodError) {
    res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  // // Handle MongoDB/Mongoose specific errors
  // if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  // if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  // if (err.name === 'JsonWebTokenError') error = new AppError('Invalid token.', 401);
  // if (err.name === 'TokenExpiredError') error = new AppError('Token expired.', 401);

  // 1. Handle MongoDB specific errors (Optional but recommended)
  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  // 2. SEND THE CLEAN RESPONSE
  // Only send the message if it's an "operational" error we created (like the 404)
  if (error.isOperational) {
    res.status(error.statusCode || 400).json({
      status: error.status || 'fail',
      message: error.message,
    });
  } else {
    // This logs the actual crash reason in your terminal so you can find it!
    console.error('ERROR 💥:', err); // Log the real error for you to see in Render logs
    res.status(500).json({
      status: 'error',
      message: 'A system error occurred. Our engineers have been notified.',
    });
  }
};