import prisma from '../../config/prisma.js';
import { httpError } from '../../utils/httpError.js';
import { logActivity } from '../activity/activity.service.js';

const userPublic = { select: { id: true, email: true, name: true } };

export async function createWorkspace(userId, { name }) {
  const workspace = await prisma.$transaction(async (tx) => {
    const created = await tx.workspace.create({
      data: { name, ownerId: userId },
    });
    await tx.workspaceMember.create({
      data: { workspaceId: created.id, userId, role: 'owner' },
    });
    return created;
  });

  await logActivity({
    workspaceId: workspace.id,
    actorId: userId,
    action: 'workspace.created',
    entityType: 'workspace',
    entityId: workspace.id,
  });

  return workspace;
}

export async function listWorkspaces(userId) {
  return prisma.workspace.findMany({
    where: {
      deletedAt: null,
      members: { some: { userId, deletedAt: null } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getWorkspace(id) {
  const workspace = await prisma.workspace.findFirst({
    where: { id, deletedAt: null },
    include: {
      members: {
        where: { deletedAt: null },
        include: { user: userPublic },
      },
    },
  });
  if (!workspace) throw httpError('Workspace not found', 404);
  return workspace;
}

export async function inviteMember(workspaceId, actorId, { email, role }) {
  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
  });
  if (!user) throw httpError('User not found', 404);

  const existing = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: user.id } },
  });
  if (existing && !existing.deletedAt) {
    throw httpError('User is already a member of this workspace', 409);
  }

  const member = existing
    ? await prisma.workspaceMember.update({
        where: { workspaceId_userId: { workspaceId, userId: user.id } },
        data: { deletedAt: null, role },
        include: { user: userPublic },
      })
    : await prisma.workspaceMember.create({
        data: { workspaceId, userId: user.id, role },
        include: { user: userPublic },
      });

  await logActivity({
    workspaceId,
    actorId,
    action: 'member.invited',
    entityType: 'member',
    entityId: user.id,
  });

  return member;
}

export async function updateMemberRole(workspaceId, actorId, targetUserId, { role }) {
  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId, userId: targetUserId, deletedAt: null },
  });
  if (!member) throw httpError('Member not found', 404);
  if (member.role === 'owner') {
    throw httpError('Cannot change the owner\'s role', 403);
  }

  const updated = await prisma.workspaceMember.update({
    where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
    data: { role },
    include: { user: userPublic },
  });

  await logActivity({
    workspaceId,
    actorId,
    action: 'member.role_changed',
    entityType: 'member',
    entityId: targetUserId,
  });

  return updated;
}

export async function removeMember(workspaceId, actorId, targetUserId) {
  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId, userId: targetUserId, deletedAt: null },
  });
  if (!member) throw httpError('Member not found', 404);
  if (member.role === 'owner') {
    throw httpError('Cannot remove the workspace owner', 403);
  }

  await prisma.workspaceMember.delete({
    where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
  });

  await logActivity({
    workspaceId,
    actorId,
    action: 'member.removed',
    entityType: 'member',
    entityId: targetUserId,
  });
}

export async function deleteWorkspace(id, actorId) {
  const workspace = await prisma.workspace.findFirst({
    where: { id, deletedAt: null },
  });
  if (!workspace) throw httpError('Workspace not found', 404);

  const deleted = await prisma.workspace.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await logActivity({
    workspaceId: id,
    actorId,
    action: 'workspace.deleted',
    entityType: 'workspace',
    entityId: id,
  });

  return deleted;
}
