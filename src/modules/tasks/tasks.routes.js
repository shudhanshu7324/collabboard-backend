import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { rbacMiddleware, ALL_ROLES } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createTaskSchema, updateTaskSchema, moveTaskSchema } from './tasks.schema.js';
import {
  handleCreateTask,
  handleListBoardTasks,
  handleGetTask,
  handleUpdateTask,
  handleMoveTask,
  handleDeleteTask,
} from './tasks.controller.js';

export const listTaskRoutes = Router({ mergeParams: true });
listTaskRoutes.post(
  '/',
  authMiddleware,
  rbacMiddleware(ALL_ROLES),
  validate(createTaskSchema),
  handleCreateTask
);

export const boardTaskRoutes = Router({ mergeParams: true });
boardTaskRoutes.get('/', authMiddleware, rbacMiddleware(ALL_ROLES), handleListBoardTasks);

export const taskRoutes = Router();
taskRoutes.get('/:id', authMiddleware, rbacMiddleware(ALL_ROLES), handleGetTask);
taskRoutes.patch(
  '/:id',
  authMiddleware,
  rbacMiddleware(ALL_ROLES),
  validate(updateTaskSchema),
  handleUpdateTask
);
taskRoutes.patch(
  '/:id/move',
  authMiddleware,
  rbacMiddleware(ALL_ROLES),
  validate(moveTaskSchema),
  handleMoveTask
);
taskRoutes.delete('/:id', authMiddleware, rbacMiddleware(ALL_ROLES), handleDeleteTask);
