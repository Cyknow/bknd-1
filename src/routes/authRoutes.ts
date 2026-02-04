import express from 'express';
import * as authController from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
// import { restrictTo } from 'middleware/restrictTo';

const router = express.Router();

// Public Routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

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