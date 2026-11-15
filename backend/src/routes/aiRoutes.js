import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as aiController from '../controllers/aiController.js';

const router = Router();

// All AI routes require Firebase authentication
router.use(authenticate);

// POST /api/ai/explain — Generate structured code explanation + create session
router.post('/explain', asyncHandler(aiController.explainCode));

// POST /api/ai/chat/:sessionId — Follow-up chat on a specific session
router.post('/chat/:sessionId', asyncHandler(aiController.chatFollowUp));

export default router;
