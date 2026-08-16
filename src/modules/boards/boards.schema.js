import { z } from 'zod';

export const createBoardSchema = z.object({
  name: z.string().min(1),
});

export const updateBoardSchema = z.object({
  name: z.string().min(1),
});

export const createListSchema = z.object({
  name: z.string().min(1),
});

export const updateListSchema = z
  .object({
    name: z.string().min(1).optional(),
    prevPosition: z.number().nullable().optional(),
    nextPosition: z.number().nullable().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.prevPosition !== undefined ||
      data.nextPosition !== undefined,
    { message: 'Provide a name and/or neighboring positions' }
  );
