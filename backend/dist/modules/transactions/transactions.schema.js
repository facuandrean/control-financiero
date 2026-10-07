"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactions = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_schema_1 = require("../users/users.schema");
const accounts_schema_1 = require("../accounts/accounts.schema");
const categories_schema_1 = require("../categories/categories.schema");
const entities_schema_1 = require("../entities/entities.schema");
exports.transactions = (0, sqlite_core_1.sqliteTable)("transactions", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    userID: (0, sqlite_core_1.text)("id_user")
        .notNull()
        .references(() => users_schema_1.users.id, { onDelete: "cascade" }),
    type: (0, sqlite_core_1.text)("type").notNull(), // 'Income' | 'Expense' | 'Transfer'
    amount: (0, sqlite_core_1.integer)("amount").notNull(),
    accountID: (0, sqlite_core_1.text)("id_account")
        .notNull()
        .references(() => accounts_schema_1.accounts.id, { onDelete: "cascade" }),
    toAccountID: (0, sqlite_core_1.text)("id_to_account").references(() => accounts_schema_1.accounts.id, {
        onDelete: "cascade",
    }),
    categoryID: (0, sqlite_core_1.text)("id_category").references(() => categories_schema_1.categories.id, {
        onDelete: "set null",
    }),
    entityID: (0, sqlite_core_1.text)("id_entity").references(() => entities_schema_1.entities.id, {
        onDelete: "set null",
    }),
    installmentGroupId: (0, sqlite_core_1.text)("installment_group_id"),
    date: (0, sqlite_core_1.text)("date").notNull(),
    description: (0, sqlite_core_1.text)("description"),
    createdAt: (0, sqlite_core_1.text)("created_at")
        .notNull()
        .default((0, drizzle_orm_1.sql) `datetime('now', '-3 hours')`),
    updatedAt: (0, sqlite_core_1.text)("updated_at")
        .notNull()
        .default((0, drizzle_orm_1.sql) `datetime('now', '-3 hours')`)
        .$onUpdate(() => (0, drizzle_orm_1.sql) `datetime('now', '-3 hours')`),
}, (table) => [
    (0, sqlite_core_1.index)("idx_transactions_user_date").on(table.userID, table.date),
    (0, sqlite_core_1.index)("idx_transactions_account").on(table.accountID),
    (0, sqlite_core_1.index)("idx_transactions_installment_group").on(table.installmentGroupId),
]);
