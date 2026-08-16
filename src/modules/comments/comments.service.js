import prisma from '../../config/prisma.js';
import { httpError } from '../../utils/httpError.js';

const userPublic = { select: { id: true, name: true, email: true } };

export async function createComment(taskId, userId, { body }) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, deletedAt: null },
  });
  if (!task) throw httpError('Task not found', 404);

  return prisma.comment.create({
    data: { taskId, userId, body },
    include: { user: userPublic },
  });
}

export async function listComments(taskId) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, deletedAt: null },
  });
  if (!task) throw httpError('Task not found', 404);

  return prisma.comment.findMany({
    where: { taskId, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    include: { user: userPublic },
  });
}

export async function deleteComment(id, userId, membershipRole) {
  const comment = await prisma.comment.findFirst({
    where: { id, deletedAt: null },
  });
  if (!comment) throw httpError('Comment not found', 404);

  const isAuthor = comment.userId === userId;
  const isAdmin = membershipRole === 'owner' || membershipRole === 'admin';
  if (!isAuthor && !isAdmin) {
    throw httpError('Forbidden', 403);
  }

  return prisma.comment.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function createAttachment(taskId, uploadedBy, { url }) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, deletedAt: null },
  });
  if (!task) throw httpError('Task not found', 404);

  return prisma.attachment.create({
    data: { taskId, url, uploadedBy },
  });
}
