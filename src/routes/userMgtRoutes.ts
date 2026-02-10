import express from 'express';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/restrictTo.js';

const router = express.Router();

/**
 * ALL ROUTES BELOW ARE PROTECTED
 */
router.use(protect);

// 1. Administrative User Management
// Only 'admin' and 'senior-admin' can access these
router.use(restrictTo('admin', 'senior-admin'));

router.route('/allUsers')
  .get(authController.getAllUsers);

router.route('/:id')
  .patch(authController.updateUser)
  .delete(authController.deleteUser);

// Dynamic Password Enforcement
router.patch('/force-reset/:id', authController.enforcePasswordReset);

export default router;