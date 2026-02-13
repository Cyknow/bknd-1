import express from 'express';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { SignupSchema, LoginSchema } from '../models/zodUser.schema.js';
// import { restrictTo } from 'middleware/restrictTo';

const router = express.Router();

// Public Routes
router.post('/signup', validate(SignupSchema), authController.signup);
router.get('/verify-email/:token', authController.verifyEmail);
// ✅ Add the resend route
router.post('/resend-verification', authController.resendVerification);
router.post('/login', validate(LoginSchema), authController.login);
router.get('/logout', authController.logout);
//there should be a userupdate route here but we will put it in userMgtRoutes since only admins can update users for now. We can always add a /updateMe route here later for users to update their own profiles without admin permissions.

// Password Management (Unauthenticated)
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protected Routes (Must be logged in)
router.patch('/updateMe', protect, authController.updateMe);

export default router;







// import { Router } from 'express';
// import * as authController from '../controllers/authController';
// import { protect } from '../middleware/authMiddleware';
// import { restrictTo } from '../middleware/authMiddleware';

// const router = Router();

// // Public Routes
// router.post('/signup', authController.signup);
// router.post('/signin', authController.login);
// router.post('/forgotPassword', authController.forgotPassword);
// router.patch('/resetPassword/:token', authController.resetPassword);

// // Protected Routes (User must be logged in)
// router.patch('/updateMe', protect, authController.updateMe);

// // Only a Senior Admin can delete users
// router.delete('/deleteUser/:id', 
//   protect, 
//   restrictTo('senior-admin'), 
//   authController.deleteUser
// );

// // Admins AND Senior Admins can view all users
// router.get('/allUsers', 
//   protect, 
//   restrictTo('admin', 'senior-admin'), 
//   userController.getAllUsers
// );

// export default router;





// import { Router } from 'express';
// import { protect } from '../middleware/authMiddleware';
// // import { getAdminStats } from '../controllers/adminController';
// import { getProfile } from 'controllers/userController';

// const router = Router();

// // PROTECTED: Any logged in user
// router.get('/me', protect, getProfile);

// // RESTRICTED: Only Senior Admins can see "The Command Center"
// // router.get('/command-stats', 
// //   protect, 
// //   getAdminStats                                                                                                                                                                                                                                                                                                                                                    
// // );
// export default router;






// // import { Router } from 'express';
// // import { signup, signin } from '../controllers/authController';
// // import { protect } from 'middleware/protect';
// // import { getProfile } from 'controllers/userController';

// // const router = Router();

// // router.post('/signup', signup);
// // router.post('/signin', signin);

// // // This route is now restricted to logged-in users only
// // router.get('/me', protect, getProfile);

// // export default router;