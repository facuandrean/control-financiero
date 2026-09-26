"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debtItems = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const drizzle_orm_1 = require("drizzle-orm");
const debts_accounts_schema_1 = require("../accounts/debts-accounts.schema");
/**
 * TABLA DETALLE: Cada uno de los ítems individuales que suman a la deuda.
 */
exports.debtItems = (0, sqlite_core_1.sqliteTable)("DebtItems", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    debtAccountID: (0, sqlite_core_1.text)("id_debt_account").references(() => debts_accounts_schema_1.debtAccounts.id, { onDelete: 'cascade' }),
    description: (0, sqlite_core_1.text)("description").notNull(), // Ej: "Peluquería" o "Buzo comprado por ML"
    amount: (0, sqlite_core_1.integer)("amount").notNull(),
    status: (0, sqlite_core_1.text)("status").notNull().default("Pending"), // "Pending" (Falta pagar este ítem) o "Paid" (Ya te pagó este ítem específico)
    createdAt: (0, sqlite_core_1.text)("created_at").notNull().default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, sqlite_core_1.text)("updated_at").notNull().default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).$onUpdate(() => (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
