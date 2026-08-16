import prisma from '../../config/prisma.js';
import { httpError } from '../../utils/httpError.js';
import { calculateNewPosition } from '../../utils/position.js';
import { logActivity } from '../activity/activity.service.js';

async function nextPosition(model, where) {
  const result = await prisma[model].aggregate({
    where: { ...where, deletedAt: null },
    _max: { position: true },
  });
  return result._max.position == null ? 1 : result._max.position + 1;
}

export async function createBoard(workspaceId, actorId, { name }) {
  const board = await prisma.board.create({
    data: { workspaceId, name },
  });

  await logActivity({
    workspaceId,
    actorId,
    action: 'board.created',
    entityType: 'board',
    entityId: board.id,
  });

  return board;
}

export async function listBoards(workspaceId) {
  return prisma.board.findMany({
    where: { workspaceId, deletedAt: null },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getBoard(id) {
  const board = await prisma.board.findFirst({
    where: { id, deletedAt: null },
    include: {
      lists: {
        where: { deletedAt: null },
        orderBy: { position: 'asc' },
        include: {
          tasks: {
            where: { deletedAt: null },
            orderBy: { position: 'asc' },
          },
        },
      },
    },
  });
  if (!board) throw httpError('Board not found', 404);
  return board;
}

export async function updateBoard(id, actorId, { name }) {
  const board = await prisma.board.findFirst({
    where: { id, deletedAt: null },
  });
  if (!board) throw httpError('Board not found', 404);

  const updated = await prisma.board.update({
    where: { id },
    data: { name },
  });

  await logActivity({
    workspaceId: board.workspaceId,
    actorId,
    action: 'board.updated',
    entityType: 'board',
    entityId: id,
  });

  return updated;
}

export async function deleteBoard(id, actorId) {
  const board = await prisma.board.findFirst({
    where: { id, deletedAt: null },
  });
  if (!board) throw httpError('Board not found', 404);

  const deleted = await prisma.board.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await logActivity({
    workspaceId: board.workspaceId,
    actorId,
    action: 'board.deleted',
    entityType: 'board',
    entityId: id,
  });

  return deleted;
}

export async function createList(boardId, actorId, { name }) {
  const board = await prisma.board.findFirst({
    where: { id: boardId, deletedAt: null },
  });
  if (!board) throw httpError('Board not found', 404);

  const position = await nextPosition('list', { boardId });
  const list = await prisma.list.create({
    data: { boardId, name, position },
  });

  await logActivity({
    workspaceId: board.workspaceId,
    actorId,
    action: 'list.created',
    entityType: 'list',
    entityId: list.id,
  });

  return list;
}

export async function updateList(id, actorId, { name, prevPosition, nextPosition }) {
  const list = await prisma.list.findFirst({
    where: { id, deletedAt: null },
    include: { board: true },
  });
  if (!list) throw httpError('List not found', 404);

  const data = {};
  if (name !== undefined) data.name = name;
  if (prevPosition !== undefined || nextPosition !== undefined) {
    data.position = calculateNewPosition(prevPosition, nextPosition);
  }

  const updated = await prisma.list.update({ where: { id }, data });

  await logActivity({
    workspaceId: list.board.workspaceId,
    actorId,
    action: 'list.updated',
    entityType: 'list',
    entityId: id,
  });

  return updated;
}

export async function deleteList(id, actorId) {
  const list = await prisma.list.findFirst({
    where: { id, deletedAt: null },
    include: { board: true },
  });
  if (!list) throw httpError('List not found', 404);

  const deleted = await prisma.list.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await logActivity({
    workspaceId: list.board.workspaceId,
    actorId,
    action: 'list.deleted',
    entityType: 'list',
    entityId: id,
  });

  return deleted;
}
