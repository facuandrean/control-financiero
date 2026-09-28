import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "../users/users.schema";
import { entities } from "../entities/entities.schema";
import { transactions } from "../transactions/transactions.schema";

export const debts = sqliteTable("Debts", {
  id: text("id").primaryKey(),
  userID: text("id_user").notNull().references(() => users.id, { onDelete: "cascade" }),
  entityID: text("id_entity").notNull().references(() => entities.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'Payable' | 'Receivable'
  description: text("description").notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: text("status").notNull().default("Pending"), // 'Pending' | 'Partial' | 'Settled'
  dueDate: text("due_date"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

export const debtPayments = sqliteTable("DebtPayments", {
  id: text("id").primaryKey(),
  debtID: text("id_debt").notNull().references(() => debts.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  date: text("date").notNull().default(sql`CURRENT_TIMESTAMP`),
  notes: text("notes"),
  transactionID: text("id_transaction").references(() => transactions.id, { onDelete: "set null" }),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
