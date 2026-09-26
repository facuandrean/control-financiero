"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactions = void 0;
const entities_schema_1 = require("../entities/entities.schema");
const drizzle_orm_1 = require("drizzle-orm");
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const users_schema_1 = require("../users/users.schema");
const accounts_schema_1 = require("../accounts/accounts.schema");
const categories_schema_1 = require("../categories/categories.schema");
exports.transactions = (0, sqlite_core_1.sqliteTable)("transactions", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    userID: (0, sqlite_core_1.text)("id_user").references(() => users_schema_1.users.id, { onDelete: 'cascade' }),
    accountID: (0, sqlite_core_1.text)("id_account").references(() => accounts_schema_1.accounts.id, { onDelete: 'cascade' }),
    categoryID: (0, sqlite_core_1.text)("id_category").references(() => categories_schema_1.categories.id, { onDelete: 'cascade' }),
    entityID: (0, sqlite_core_1.text)("id_entity").references(() => entities_schema_1.entities.id, { onDelete: 'cascade' }),
    amount: (0, sqlite_core_1.real)("amount").notNull(),
    status: (0, sqlite_core_1.text)("status").notNull().default("Recorded"),
    type: (0, sqlite_core_1.text)("type").notNull(), // Ingreso, egreso
    description: (0, sqlite_core_1.text)("description"),
    createdAt: (0, sqlite_core_1.text)("created_at").notNull().default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, sqlite_core_1.text)("updated_at").notNull().default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).$onUpdate(() => (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
