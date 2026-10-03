"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debtMovements = exports.debts = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_schema_1 = require("../users/users.schema");
const entities_schema_1 = require("../entities/entities.schema");
const transactions_schema_1 = require("../transactions/transactions.schema");
exports.debts = (0, sqlite_core_1.sqliteTable)("Debts", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    userID: (0, sqlite_core_1.text)("id_user").notNull().references(() => users_schema_1.users.id, { onDelete: "cascade" }),
    entityID: (0, sqlite_core_1.text)("id_entity").references(() => entities_schema_1.entities.id, { onDelete: "set null" }),
    type: (0, sqlite_core_1.text)("type").notNull(), // 'Payable' | 'Receivable'
    initialAmount: (0, sqlite_core_1.integer)("initial_amount").notNull().default(0),
    status: (0, sqlite_core_1.text)("status").notNull().default("Pending"), // 'Pending' | 'Settled'
    createdAt: (0, sqlite_core_1.text)("created_at").notNull().default((0, drizzle_orm_1.sql) `datetime('now', '-3 hours')`),
    updatedAt: (0, sqlite_core_1.text)("updated_at").notNull().default((0, drizzle_orm_1.sql) `datetime('now', '-3 hours')`).$onUpdate(() => (0, drizzle_orm_1.sql) `datetime('now', '-3 hours')`),
});
exports.debtMovements = (0, sqlite_core_1.sqliteTable)("DebtMovements", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    debtID: (0, sqlite_core_1.text)("id_debt").notNull().references(() => exports.debts.id, { onDelete: "cascade" }),
    type: (0, sqlite_core_1.text)("type").notNull(), // 'CHARGE' | 'PAYMENT'
    amount: (0, sqlite_core_1.integer)("amount").notNull(),
    description: (0, sqlite_core_1.text)("description").notNull(),
    date: (0, sqlite_core_1.text)("date").notNull(),
    transactionID: (0, sqlite_core_1.text)("id_transaction").references(() => transactions_schema_1.transactions.id, { onDelete: "set null" }),
    createdAt: (0, sqlite_core_1.text)("created_at").notNull().default((0, drizzle_orm_1.sql) `datetime('now', '-3 hours')`),
});
