import express from 'express';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { SignupSchema, LoginSchema } from '../models/zodUser.schema.js';
// import { restrictTo } from 'middleware/restrictTo';

const router = express.Router();

// Public Routes
router.post('/signup', validate(SignupSchema), authController.signup);
router.get('/verifyemail/:token', authController.verifyEmail);
// ✅ Add the resend route
router.post('/resendverification', authController.resendVerification);
router.post('/signinp', validate(LoginSchema), authController.login);
router.get('/logout', authController.logout);
//there should be a userupdate route here but we will put it in userMgtRoutes since only admins can update users for now. We can always add a /updateMe route here later for users to update their own profiles without admin permissions.

// Password Management (Unauthenticated)
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protected Routes (Must be logged in)
router.patch('/updateMe', protect, authController.updateMe);

export default router;