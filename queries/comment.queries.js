import { eq, asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { comments, users } from '../db/schema.js';

export const getCommentsByPost = (postId) =>
  db
    .select({
      id: comments.id,
      postId: comments.postId,
      userId: comments.userId,
      username: users.username,
      content: comments.content,
      created_at: comments.createdAt,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.postId, postId))
    .orderBy(asc(comments.createdAt));

export const findComment = async (id) => {
  const [comment] = await db.select().from(comments).where(eq(comments.id, id));
  return comment;
};

export const createComment = async (data) => {
  const [comment] = await db.insert(comments).values(data).returning();
  return comment;
};

export const updateComment = async (id, content) => {
  const [comment] = await db.update(comments).set({ content }).where(eq(comments.id, id)).returning();
  return comment;
};

export const deleteComment = (id) => db.delete(comments).where(eq(comments.id, id));