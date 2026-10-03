import { text } from "drizzle-orm/sqlite-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";
import { users } from "../users/users.schema";
import { sql } from "drizzle-orm";


/**
 * This file defines the schema for the "categories" table in the database using Drizzle ORM. The table includes fields for id, userID, name, status, description, createdAt, and updatedAt. The userID field references the id field in the users table and has a cascade delete behavior. The createdAt and updatedAt fields are automatically set to the current timestamp when a new record is created or updated.
 */
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  userID: text("id_user").references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  status: text("status").notNull().default("Active"),
  description: text("description"),
  createdAt: text("created_at").notNull().default(sql`datetime('now', '-3 hours')`),
  updatedAt: text("updated_at").notNull().default(sql`datetime('now', '-3 hours')`).$onUpdate(() => sql`datetime('now', '-3 hours')`),
})