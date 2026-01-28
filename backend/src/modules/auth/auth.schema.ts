import { users } from "@modules/users/users.schema";
import { sql } from "drizzle-orm";
import { text } from "drizzle-orm/sqlite-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userID: text('id_user').references(() => users.id, { onDelete: 'cascade' }),
  tokenHashed: text('token_hashed').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
})