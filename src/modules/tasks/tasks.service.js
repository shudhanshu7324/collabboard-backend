import prisma from '../../config/prisma.js';
import { httpError } from '../../utils/httpError.js';
import { calculateNewPosition } from '../../utils/position.js';
import { logActivity } from '../activity/activity.service.js';

const taskInclude = {
  list: { select: { id: true, name: true, boardId: true } },
  assignee: { select: { id: true, name: true, email: true } },
};

async function findTaskOrThrow(id) {
  const task = await prisma.task.findFirst({
    where: { id, deletedAt: null },
    include: {
      list: {
        include: { board: true },
      },
    },
  });
  if (!task) throw httpError('Task not found', 404);
  return task;
}

async function nextTaskPosition(listId) {
  const result = await prisma.task.aggregate({
    where: { listId, deletedAt: null },
    _max: { position: true },
  });
  return result._max.position == null ? 1 : result._max.position + 1;
}

async function assertAssignee(workspaceId, assigneeId) {
  if (!assigneeId) return;
  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId, userId: assigneeId, deletedAt: null },
  });
  if (!member) throw httpError('Assignee is not a member of this workspace', 400);
}

export async function createTask(listId, actorId, data) {
  const list = await prisma.list.findFirst({
    where: { id: listId, deletedAt: null },
    include: { board: true },
  });
  if (!list) throw httpError('List not found', 404);

  await assertAssignee(list.board.workspaceId, data.assigneeId);

  const position = await nextTaskPosition(listId);
  const task = await prisma.task.create({
    data: {
      listId,
      title: data.title,
      description: data.description,
      assigneeId: data.assigneeId,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      position,
    },
    include: taskInclude,
  });

  await logActivity({
    workspaceId: list.board.workspaceId,
    actorId,
    action: 'task.created',
    entityType: 'task',
    entityId: task.id,
  });

  return task;
}

export async function listBoardTasks(boardId) {
  const board = await prisma.board.findFirst({
    where: { id: boardId, deletedAt: null },
  });
  if (!board) throw httpError('Board not found', 404);

  return prisma.task.findMany({
    where: {
      deletedAt: null,
      list: { boardId, deletedAt: null },
    },
    orderBy: { position: 'asc' },
    include: taskInclude,
  });
}

export async function getTask(id) {
  const task = await prisma.task.findFirst({
    where: { id, deletedAt: null },
    include: {
      ...taskInclude,
      comments: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      attachments: { where: { deletedAt: null } },
    },
  });
  if (!task) throw httpError('Task not found', 404);
  return task;
}

export async function updateTask(id, actorId, data) {
  const task = await findTaskOrThrow(id);
  const workspaceId = task.list.board.workspaceId;

  if (data.assigneeId !== undefined) {
    await assertAssignee(workspaceId, data.assigneeId);
  }

  const updated = await prisma.task.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.assigneeId !== undefined ? { assigneeId: data.assigneeId } : {}),
      ...(data.dueDate !== undefined
        ? { dueDate: data.dueDate ? new Date(data.dueDate) : null }
        : {}),
    },
    include: taskInclude,
  });

  await logActivity({
    workspaceId,
    actorId,
    action: 'task.updated',
    entityType: 'task',
    entityId: id,
  });

  return updated;
}

export async function moveTask(id, actorId, { listId, prevPosition, nextPosition }) {
  const task = await findTaskOrThrow(id);
  const sourceBoardId = task.list.boardId;
  const workspaceId = task.list.board.workspaceId;

  const targetList = await prisma.list.findFirst({
    where: { id: listId, deletedAt: null },
    include: { board: true },
  });
  if (!targetList) throw httpError('List not found', 404);
  if (targetList.board.workspaceId !== workspaceId) {
    throw httpError('Cannot move task to a list in another workspace', 403);
  }

  const position = calculateNewPosition(prevPosition, nextPosition);
  const updated = await prisma.task.update({
    where: { id },
    data: { listId, position },
    include: taskInclude,
  });

  await logActivity({
    workspaceId,
    actorId,
    action: 'task.moved',
    entityType: 'task',
    entityId: id,
  });

  return { task: updated, sourceBoardId, targetBoardId: targetList.boardId };
}

export async function deleteTask(id, actorId) {
  const task = await findTaskOrThrow(id);
  const workspaceId = task.list.board.workspaceId;
  const boardId = task.list.boardId;

  const deleted = await prisma.task.update({
    where: { id },
    data: { deletedAt: new Date() },
    include: taskInclude,
  });

  await logActivity({
    workspaceId,
    actorId,
    action: 'task.deleted',
    entityType: 'task',
    entityId: id,
  });

  return { task: deleted, boardId };
}
