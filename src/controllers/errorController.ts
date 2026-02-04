import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';

// Helper to handle Mongoose Duplicate Fields (Error Code 11000)
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

export default (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    // Send everything to help you debug
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // PRODUCTION: Send friendly messages
    let error = { ...err, message: err.message };

    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    res.status(error.statusCode).json({
      status: error.status,
      message: error.message || 'Something went very wrong!'
    });
  }
};