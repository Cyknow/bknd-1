import express from 'express';
import * as authController from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { restrictTo } from '../middleware/restrictTo';

const router = express.Router();

/**
 * ALL ROUTES BELOW ARE PROTECTED
 */
router.use(protect);

// 1. Administrative User Management
// Only 'admin' and 'senior-admin' can access these
router.use(restrictTo('admin', 'senior-admin'));

router.route('/')
  .get(authController.getAllUsers);

router.route('/:id')
  .patch(authController.updateUser)
  .delete(authController.deleteUser);

// Dynamic Password Enforcement
router.patch('/force-reset/:id', authController.enforcePasswordReset);

export default router;