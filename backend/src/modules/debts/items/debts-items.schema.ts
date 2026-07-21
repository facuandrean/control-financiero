import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { debtAccounts } from "../accounts/debts-accounts.schema";

/**
 * TABLA DETALLE: Cada uno de los ítems individuales que suman a la deuda.
 */
export const debtItems = sqliteTable("DebtItems", {
  id: text("id").primaryKey(),
  debtAccountID: text("id_debt_account").references(() => debtAccounts.id, { onDelete: 'cascade' }),
  description: text("description").notNull(), // Ej: "Peluquería" o "Buzo comprado por ML"
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("Pending"), // "Pending" (Falta pagar este ítem) o "Paid" (Ya te pagó este ítem específico)
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});