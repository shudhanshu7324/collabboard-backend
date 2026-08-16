import prisma from '../../config/prisma.js';

export async function logActivity({ workspaceId, actorId, action, entityType, entityId }) {
  return prisma.activityLog.create({
    data: { workspaceId, actorId, action, entityType, entityId },
  });
}

export async function listActivity(workspaceId, { limit = 20, cursor } = {}) {
  const take = Math.min(Math.max(Number(limit) || 20, 1), 100);

  return prisma.activityLog.findMany({
    where: { workspaceId, deletedAt: null },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      actor: { select: { id: true, name: true, email: true } },
    },
  });
}
