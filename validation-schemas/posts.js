import { z } from 'zod';

export const createPostSchema = z.object({
  content: z.string().trim().min(1, 'Post content is required').max(5000),
});

export const updatePostSchema = createPostSchema.partial();

export const commentSchema = z.object({
  content: z.string().trim().min(1, 'Comment is required').max(2000),
});