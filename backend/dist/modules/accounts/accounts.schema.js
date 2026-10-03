"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accounts = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const users_schema_1 = require("../users/users.schema");
const drizzle_orm_1 = require("drizzle-orm");
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
exports.accounts = (0, sqlite_core_1.sqliteTable)("accounts", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    userID: (0, sqlite_core_1.text)("id_user").references(() => users_schema_1.users.id, { onDelete: 'cascade' }),
    bank: (0, sqlite_core_1.text)("bank").notNull(),
    name: (0, sqlite_core_1.text)("name").notNull(),
    type: (0, sqlite_core_1.text)("type").notNull(),
    tag: (0, sqlite_core_1.text)("tag").notNull(),
    amount: (0, sqlite_core_1.integer)("amount").default(0),
    description: (0, sqlite_core_1.text)("description"),
    lastDigits: (0, sqlite_core_1.text)("last_digits"),
    creditLimit: (0, sqlite_core_1.integer)("credit_limit"),
    closingDay: (0, sqlite_core_1.integer)("closing_day"),
    dueDate: (0, sqlite_core_1.integer)("due_date"),
    status: (0, sqlite_core_1.text)("status").notNull().default("Active"),
    createdAt: (0, sqlite_core_1.text)("created_at").notNull().default((0, drizzle_orm_1.sql) `datetime('now', '-3 hours')`),
    updatedAt: (0, sqlite_core_1.text)("updated_at").notNull().default((0, drizzle_orm_1.sql) `datetime('now', '-3 hours')`).$onUpdate(() => (0, drizzle_orm_1.sql) `datetime('now', '-3 hours')`),
});
