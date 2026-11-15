import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import * as authController from '../controllers/authController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Synchronize authenticated Firebase account with MySQL profile
router.post('/sync', authenticate, asyncHandler(authController.syncAuth));

export default router;
