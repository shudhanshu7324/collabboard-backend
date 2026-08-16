import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { rbacMiddleware, ALL_ROLES, ADMIN_ROLES } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createBoardSchema,
  updateBoardSchema,
  createListSchema,
  updateListSchema,
} from './boards.schema.js';
import {
  handleCreateBoard,
  handleListBoards,
  handleGetBoard,
  handleUpdateBoard,
  handleDeleteBoard,
  handleCreateList,
  handleUpdateList,
  handleDeleteList,
} from './boards.controller.js';

export const workspaceBoardRoutes = Router({ mergeParams: true });
workspaceBoardRoutes.post(
  '/',
  authMiddleware,
  rbacMiddleware(ALL_ROLES),
  validate(createBoardSchema),
  handleCreateBoard
);
workspaceBoardRoutes.get('/', authMiddleware, rbacMiddleware(ALL_ROLES), handleListBoards);

export const boardRoutes = Router();
boardRoutes.get('/:id', authMiddleware, rbacMiddleware(ALL_ROLES), handleGetBoard);
boardRoutes.patch(
  '/:id',
  authMiddleware,
  rbacMiddleware(ALL_ROLES),
  validate(updateBoardSchema),
  handleUpdateBoard
);
boardRoutes.delete('/:id', authMiddleware, rbacMiddleware(ADMIN_ROLES), handleDeleteBoard);
boardRoutes.post(
  '/:boardId/lists',
  authMiddleware,
  rbacMiddleware(ALL_ROLES),
  validate(createListSchema),
  handleCreateList
);

export const listRoutes = Router();
listRoutes.patch(
  '/:id',
  authMiddleware,
  rbacMiddleware(ALL_ROLES),
  validate(updateListSchema),
  handleUpdateList
);
listRoutes.delete('/:id', authMiddleware, rbacMiddleware(ADMIN_ROLES), handleDeleteList);
