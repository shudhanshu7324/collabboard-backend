import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(1),
});

export const inviteMemberSchema = z.object({
  email: z.email(),
  role: z.enum(['admin', 'member']),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'member']),
});
