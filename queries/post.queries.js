import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { posts, users, likes, comments } from '../db/schema.js';

const postFields = (userId) => ({
  id: posts.id,
  userId: posts.userId,
  username: users.username,
  content: posts.content,
  image: posts.image,
  created_at: posts.createdAt,
  like_count: sql`(select count(*) from ${likes} where ${likes.postId} = ${posts.id})`.mapWith(Number),
  comment_count: sql`(select count(*) from ${comments} where ${comments.postId} = ${posts.id})`.mapWith(Number),
  liked_by_me: sql`exists (select 1 from ${likes} where ${likes.postId} = ${posts.id} and ${likes.userId} = ${userId ?? -1})`.mapWith(Boolean),
});

export const getAllPosts = (userId) =>
  db
    .select(postFields(userId))
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .orderBy(desc(posts.createdAt));

export const getPostById = async (id, userId) => {
  const [post] = await db
    .select(postFields(userId))
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .where(eq(posts.id, id));
  return post;
};

export const findPost = async (id) => {
  const [post] = await db.select().from(posts).where(eq(posts.id, id));
  return post;
};

export const createPost = async ({ userId, content, image }) => {
  const [row] = await db
    .insert(posts)
    .values({ userId, content, image, title: '' })
    .returning();
  return row;
};

export const updatePost = async (id, data) => {
  const [row] = await db.update(posts).set(data).where(eq(posts.id, id)).returning();
  return row;
};

export const deletePost = (id) => db.delete(posts).where(eq(posts.id, id));

export const getLikes = (postId) =>
  db.select({ userId: likes.userId }).from(likes).where(eq(likes.postId, postId));

export const addLike = (postId, userId) =>
  db.insert(likes).values({ postId, userId }).onConflictDoNothing();

export const removeLike = (postId, userId) =>
  db.delete(likes).where(and(eq(likes.postId, postId), eq(likes.userId, userId)));