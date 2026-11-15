import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import * as sessionController from '../controllers/sessionController.js';
import {
  validate,
  createSessionSchema,
  addMessageSchema,
  updateSessionSchema
} from '../validators/sessionValidator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// All session routes are ownership-protected and require an authenticated user
router.post('/', authenticate, validate(createSessionSchema), asyncHandler(sessionController.createSession));
router.get('/', authenticate, asyncHandler(sessionController.listSessions));
router.get('/:id', authenticate, asyncHandler(sessionController.getSession));
router.patch('/:id', authenticate, validate(updateSessionSchema), asyncHandler(sessionController.updateSession));
router.post('/:id/messages', authenticate, validate(addMessageSchema), asyncHandler(sessionController.addMessage));

export default router;
