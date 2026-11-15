import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import * as adminController from '../controllers/adminController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Strictly restricted to users with role 'admin'
router.use(authenticate, authorize('admin'));

router.get('/stats', asyncHandler(adminController.getStats));
router.get('/users', asyncHandler(adminController.listUsers));

export default router;
