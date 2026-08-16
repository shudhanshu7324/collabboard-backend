import prisma from '../config/prisma.js';
import { httpError } from '../utils/httpError.js';

export const ALL_ROLES = ['owner', 'admin', 'member'];
export const ADMIN_ROLES = ['owner', 'admin'];
export const OWNER_ROLES = ['owner'];

async function workspaceIdFromBoard(boardId) {
  const board = await prisma.board.findFirst({
    where: { id: boardId, deletedAt: null },
    select: { workspaceId: true },
  });
  if (!board) throw httpError('Board not found', 404);
  return board.workspaceId;
}

async function workspaceIdFromList(listId) {
  const list = await prisma.list.findFirst({
    where: { id: listId, deletedAt: null },
    select: { board: { select: { workspaceId: true, deletedAt: true } } },
  });
  if (!list || list.board.deletedAt) throw httpError('List not found', 404);
  return list.board.workspaceId;
}

async function workspaceIdFromTask(taskId) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, deletedAt: null },
    select: {
      list: {
        select: {
          deletedAt: true,
          board: { select: { workspaceId: true, deletedAt: true } },
        },
      },
    },
  });
  if (!task || task.list.deletedAt || task.list.board.deletedAt) {
    throw httpError('Task not found', 404);
  }
  return task.list.board.workspaceId;
}

async function workspaceIdFromComment(commentId) {
  const comment = await prisma.comment.findFirst({
    where: { id: commentId, deletedAt: null },
    select: {
      task: {
        select: {
          deletedAt: true,
          list: {
            select: {
              deletedAt: true,
              board: { select: { workspaceId: true, deletedAt: true } },
            },
          },
        },
      },
    },
  });
  if (
    !comment ||
    comment.task.deletedAt ||
    comment.task.list.deletedAt ||
    comment.task.list.board.deletedAt
  ) {
    throw httpError('Comment not found', 404);
  }
  return comment.task.list.board.workspaceId;
}

async function resolveWorkspaceId(req) {
  if (req.params.workspaceId) return req.params.workspaceId;
  if (req.params.boardId) return workspaceIdFromBoard(req.params.boardId);
  if (req.params.listId) return workspaceIdFromList(req.params.listId);
  if (req.params.taskId) return workspaceIdFromTask(req.params.taskId);

  const id = req.params.id;
  if (!id) throw httpError('Workspace context not found', 400);

  const baseUrl = req.baseUrl || '';
  if (baseUrl.endsWith('/workspaces')) return id;
  if (baseUrl.endsWith('/boards')) return workspaceIdFromBoard(id);
  if (baseUrl.endsWith('/lists')) return workspaceIdFromList(id);
  if (baseUrl.endsWith('/tasks')) return workspaceIdFromTask(id);
  if (baseUrl.endsWith('/comments')) return workspaceIdFromComment(id);

  return id;
}

export function rbacMiddleware(requiredRoles) {
  return async (req, res, next) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const workspaceId = await resolveWorkspaceId(req);

      const workspace = await prisma.workspace.findFirst({
        where: { id: workspaceId, deletedAt: null },
        select: { id: true },
      });
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
      }

      const membership = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId,
          userId: req.user.userId,
          deletedAt: null,
        },
      });

      if (!membership || !requiredRoles.includes(membership.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      req.workspaceId = workspaceId;
      req.membership = { role: membership.role };
      next();
    } catch (err) {
      res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
    }
  };
}
