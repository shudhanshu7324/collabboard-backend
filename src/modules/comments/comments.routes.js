import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { rbacMiddleware, ALL_ROLES } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createCommentSchema, createAttachmentSchema } from './comments.schema.js';
import {
  handleCreateComment,
  handleListComments,
  handleDeleteComment,
  handleCreateAttachment,
} from './comments.controller.js';

export const taskCommentRoutes = Router({ mergeParams: true });
taskCommentRoutes.post(
  '/',
  authMiddleware,
  rbacMiddleware(ALL_ROLES),
  validate(createCommentSchema),
  handleCreateComment
);
taskCommentRoutes.get('/', authMiddleware, rbacMiddleware(ALL_ROLES), handleListComments);

export const taskAttachmentRoutes = Router({ mergeParams: true });
taskAttachmentRoutes.post(
  '/',
  authMiddleware,
  rbacMiddleware(ALL_ROLES),
  validate(createAttachmentSchema),
  handleCreateAttachment
);

export const commentRoutes = Router();
commentRoutes.delete('/:id', authMiddleware, rbacMiddleware(ALL_ROLES), handleDeleteComment);
