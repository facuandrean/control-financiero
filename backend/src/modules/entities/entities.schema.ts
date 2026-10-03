import { text } from "drizzle-orm/sqlite-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";
import { users } from "../users/users.schema";
import { sql } from "drizzle-orm";

export const entities = sqliteTable("entities", {
  id: text("id").primaryKey(),
  userID: text("id_user").references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  status: text("status").notNull().default("Active"),
  description: text("description"),
  createdAt: text("created_at").notNull().default(sql`datetime('now', '-3 hours')`),
  updatedAt: text("updated_at").notNull().default(sql`datetime('now', '-3 hours')`).$onUpdate(() => sql`datetime('now', '-3 hours')`),
});

