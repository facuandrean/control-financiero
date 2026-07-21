import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { users } from "../../users/users.schema";

/**
 * TABLA MAESTRA: Registra a la persona y el estado general de la deuda.
 * Si saldás la deuda, pasa a "Settled". Si te vuelve a deber, pasa a "Open".
 */
export const debtAccounts = sqliteTable("DebtAccounts", {
  id: text("id").primaryKey(),
  userID: text("id_user").references(() => users.id, { onDelete: 'cascade' }),
  personName: text("person_name").notNull(),
  type: text("type").notNull(), // "Cobrar" (Te deben a vos - Activo) o "Pagar" (Vos debés plata - Pasivo)
  status: text("status").notNull().default("Open"), // "Open" (Deuda activa) o "Settled" (Deuda totalmente saldada)
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});
