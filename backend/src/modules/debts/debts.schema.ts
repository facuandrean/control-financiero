import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "../users/users.schema";
import { entities } from "../entities/entities.schema";
import { transactions } from "../transactions/transactions.schema";

export const debts = sqliteTable("Debts", {
  id: text("id").primaryKey(),
  userID: text("id_user").notNull().references(() => users.id, { onDelete: "cascade" }),
  entityID: text("id_entity").references(() => entities.id, { onDelete: "set null" }),
  type: text("type").notNull(), // 'Payable' | 'Receivable'
  initialAmount: integer("initial_amount").notNull().default(0),
  status: text("status").notNull().default("Pending"), // 'Pending' | 'Settled'
  createdAt: text("created_at").notNull().default(sql`datetime('now', '-3 hours')`),
  updatedAt: text("updated_at").notNull().default(sql`datetime('now', '-3 hours')`).$onUpdate(() => sql`datetime('now', '-3 hours')`),
});

export const debtMovements = sqliteTable("DebtMovements", {
  id: text("id").primaryKey(),
  debtID: text("id_debt").notNull().references(() => debts.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'CHARGE' | 'PAYMENT'
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(),
  transactionID: text("id_transaction").references(() => transactions.id, { onDelete: "set null" }),
  createdAt: text("created_at").notNull().default(sql`datetime('now', '-3 hours')`),
});
