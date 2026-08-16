import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { rbacMiddleware, ALL_ROLES } from '../../middleware/rbac.middleware.js';
import { handleListActivity } from './activity.controller.js';

const router = Router();

router.get('/:id/activity', authMiddleware, rbacMiddleware(ALL_ROLES), handleListActivity);

export default router;
