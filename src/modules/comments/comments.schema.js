import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.string().min(1),
});

export const createAttachmentSchema = z.object({
  url: z.string().min(1),
});
