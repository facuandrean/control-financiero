import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: text('created_at').notNull().default(sql`datetime('now', '-3 hours')`),
  updatedAt: text('updated_at').notNull().default(sql`datetime('now', '-3 hours')`).$onUpdate(() => sql`datetime('now', '-3 hours')`),
});