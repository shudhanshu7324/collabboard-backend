import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { rbacMiddleware, ALL_ROLES, ADMIN_ROLES, OWNER_ROLES } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createWorkspaceSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from './workspaces.schema.js';
import {
  handleCreateWorkspace,
  handleListWorkspaces,
  handleGetWorkspace,
  handleInviteMember,
  handleUpdateMemberRole,
  handleRemoveMember,
  handleDeleteWorkspace,
} from './workspaces.controller.js';

const router = Router();

router.post('/', authMiddleware, validate(createWorkspaceSchema), handleCreateWorkspace);
router.get('/', authMiddleware, handleListWorkspaces);
router.get('/:id', authMiddleware, rbacMiddleware(ALL_ROLES), handleGetWorkspace);
router.post(
  '/:id/invite',
  authMiddleware,
  rbacMiddleware(ADMIN_ROLES),
  validate(inviteMemberSchema),
  handleInviteMember
);
router.patch(
  '/:id/members/:userId',
  authMiddleware,
  rbacMiddleware(OWNER_ROLES),
  validate(updateMemberRoleSchema),
  handleUpdateMemberRole
);
router.delete(
  '/:id/members/:userId',
  authMiddleware,
  rbacMiddleware(ADMIN_ROLES),
  handleRemoveMember
);
router.delete('/:id', authMiddleware, rbacMiddleware(OWNER_ROLES), handleDeleteWorkspace);

export default router;
