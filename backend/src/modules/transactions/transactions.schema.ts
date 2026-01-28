import { entities } from "@modules/entities/entities.schema";
import { sql } from "drizzle-orm";
import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { users } from "@modules/users/users.schema";
import { accounts } from "@modules/accounts/accounts.schema";
import { categories } from "@modules/categories/categories.schema";

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  userID: text("id_user").references(() => users.id, { onDelete: 'cascade' }),
  accountID: text("id_account").references(() => accounts.id, { onDelete: 'cascade' }),
  categoryID: text("id_category").references(() => categories.id, { onDelete: 'cascade' }),
  entityID: text("id_entity").references(() => entities.id, { onDelete: 'cascade' }),
  amount: real("amount").notNull(),
  status: text("status").notNull().default("Recorded"),
  type: text("type").notNull(), // Ingreso, egreso
  description: text("description"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});