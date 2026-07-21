import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { users } from "../users/users.schema";
import { sql } from "drizzle-orm";

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userID: text("id_user").references(() => users.id, { onDelete: 'cascade' }),
  bank: text("bank").notNull(),
  name: text("name").notNull(), 
  type: text("type").notNull(),
  tag: text("tag").notNull(),
  amount: integer("amount").default(0),
  description: text("description"),

  lastDigits: text("last_digits"),
  creditLimit: integer("credit_limit"),
  closingDay: integer("closing_day"),
  dueDate: integer("due_date"),
  status: text("status").notNull().default("Active"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

