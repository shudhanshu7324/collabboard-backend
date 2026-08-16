import { z } from 'zod';

const dueDate = z.string().min(1).nullable().optional();

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  assigneeId: z.uuid().nullable().optional(),
  dueDate,
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  assigneeId: z.uuid().nullable().optional(),
  dueDate,
});

export const moveTaskSchema = z.object({
  listId: z.uuid(),
  prevPosition: z.number().nullable().optional(),
  nextPosition: z.number().nullable().optional(),
});
