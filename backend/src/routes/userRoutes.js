import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import * as userController from '../controllers/userController.js';
import { validateUser, updateUserSchema } from '../validators/userValidator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/me', authenticate, asyncHandler(userController.getProfile));
router.patch('/me', authenticate, validateUser(updateUserSchema), asyncHandler(userController.updateProfile));

export default router;
