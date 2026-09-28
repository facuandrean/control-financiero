import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "../users/users.schema";
import { accounts } from "../accounts/accounts.schema";
import { categories } from "../categories/categories.schema";
import { entities } from "../entities/entities.schema";

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  userID: text("id_user")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'Income' | 'Expense' | 'Transfer'
  amount: integer("amount").notNull(),
  accountID: text("id_account")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  toAccountID: text("id_to_account").references(() => accounts.id, {
    onDelete: "cascade",
  }),
  categoryID: text("id_category").references(() => categories.id, {
    onDelete: "cascade",
  }),
  entityID: text("id_entity").references(() => entities.id, {
    onDelete: "cascade",
  }),
  date: text("date").notNull(),
  description: text("description"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});