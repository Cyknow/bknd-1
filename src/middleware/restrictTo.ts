import AppError from '../utils/appError.js';

// This is a "factory function" that returns the actual middleware
export const restrictTo = (...roles: string[]) => {
  return (req: any, res: any, next: any) => {
    // req.user was set by the 'protect' middleware previously
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('Permission denied.! You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};