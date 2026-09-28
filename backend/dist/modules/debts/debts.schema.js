"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debtPayments = exports.debts = void 0;
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
    description: (0, sqlite_core_1.text)("description").notNull(),
    totalAmount: (0, sqlite_core_1.integer)("total_amount").notNull(),
    status: (0, sqlite_core_1.text)("status").notNull().default("Pending"), // 'Pending' | 'Partial' | 'Settled'
    dueDate: (0, sqlite_core_1.text)("due_date"),
    createdAt: (0, sqlite_core_1.text)("created_at").notNull().default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, sqlite_core_1.text)("updated_at").notNull().default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).$onUpdate(() => (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.debtPayments = (0, sqlite_core_1.sqliteTable)("DebtPayments", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    debtID: (0, sqlite_core_1.text)("id_debt").notNull().references(() => exports.debts.id, { onDelete: "cascade" }),
    amount: (0, sqlite_core_1.integer)("amount").notNull(),
    date: (0, sqlite_core_1.text)("date").notNull().default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    notes: (0, sqlite_core_1.text)("notes"),
    transactionID: (0, sqlite_core_1.text)("id_transaction").references(() => transactions_schema_1.transactions.id, { onDelete: "set null" }),
    createdAt: (0, sqlite_core_1.text)("created_at").notNull().default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
