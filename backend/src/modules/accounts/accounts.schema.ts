import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { users } from "../users/users.schema";
import { sql } from "drizzle-orm";


/**
 * Schema for the accounts table
 * id: Unique identifier for the account (Primary Key)
 * userID: Foreign key referencing the users table (onDelete: cascade)
 * bank: Name of the bank associated with the account. Example: "Santander"
 * name: Name of the account. Example: "Cuenta de ahorro"
 * type: Type of the account. Example: "Efectivo, Billetera Virtual, Caja de Ahorro, Cuenta Corriente, Tarjeta de Crédito"
 * tag: Tag associated with the account. Example: "Efec., B. Virt., C. Ahorro, C. Corr., T. Créd."
 * amount: Current balance or amount in the account. Default is 0.
 * description: Optional description for the account.
 * lastDigits: Last digits of the account number (for credit cards).
 * creditLimit: Credit limit for credit card accounts.
 * closingDay: Closing day for credit card accounts.
 * dueDate: Due date for credit card accounts.
 * status: Status of the account. Default is "Active".
 * createdAt: Timestamp when the account was created. Default is datetime('now', '-3 hours').
 * updatedAt: Timestamp when the account was last updated. Default is datetime('now', '-3 hours') and updates on every change.
 */
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
  createdAt: text("created_at").notNull().default(sql`datetime('now', '-3 hours')`),
  updatedAt: text("updated_at").notNull().default(sql`datetime('now', '-3 hours')`).$onUpdate(() => sql`datetime('now', '-3 hours')`),
});

