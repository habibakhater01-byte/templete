import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';

export const findUserByEmail = async (email) => {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
};

export const findUserByUsername = async (username) => {
  const [user] = await db.select().from(users).where(eq(users.username, username));
  return user;
};

export const getUserById = async (id) => {
  const [user] = await db
    .select({ id: users.id, username: users.username, email: users.email })
    .from(users)
    .where(eq(users.id, id));
  return user;
};

export const createUser = async ({ username, email, passwordHash }) => {
  const [user] = await db
    .insert(users)
    .values({ username, email, passwordHash })
    .returning({ id: users.id, username: users.username, email: users.email });
  return user;
};