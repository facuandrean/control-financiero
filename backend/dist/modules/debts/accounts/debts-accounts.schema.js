"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debtAccounts = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_schema_1 = require("../../users/users.schema");
/**
 * TABLA MAESTRA: Registra a la persona y el estado general de la deuda.
 * Si saldás la deuda, pasa a "Settled". Si te vuelve a deber, pasa a "Open".
 */
exports.debtAccounts = (0, sqlite_core_1.sqliteTable)("DebtAccounts", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    userID: (0, sqlite_core_1.text)("id_user").references(() => users_schema_1.users.id, { onDelete: 'cascade' }),
    personName: (0, sqlite_core_1.text)("person_name").notNull(),
    type: (0, sqlite_core_1.text)("type").notNull(), // "Cobrar" (Te deben a vos - Activo) o "Pagar" (Vos debés plata - Pasivo)
    status: (0, sqlite_core_1.text)("status").notNull().default("Open"), // "Open" (Deuda activa) o "Settled" (Deuda totalmente saldada)
    createdAt: (0, sqlite_core_1.text)("created_at").notNull().default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, sqlite_core_1.text)("updated_at").notNull().default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).$onUpdate(() => (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
