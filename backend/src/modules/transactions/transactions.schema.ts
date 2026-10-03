import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "../users/users.schema";
import { accounts } from "../accounts/accounts.schema";
import { categories } from "../categories/categories.schema";
import { entities } from "../entities/entities.schema";

export const transactions = sqliteTable(
  "transactions",
  {
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
      onDelete: "set null",
    }),
    entityID: text("id_entity").references(() => entities.id, {
      onDelete: "set null",
    }),
    date: text("date").notNull(),
    description: text("description"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`datetime('now', '-3 hours')`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`datetime('now', '-3 hours')`)
      .$onUpdate(() => sql`datetime('now', '-3 hours')`),
  },
  (table) => [
    index("idx_transactions_user_date").on(table.userID, table.date),
    index("idx_transactions_account").on(table.accountID),
  ]
);