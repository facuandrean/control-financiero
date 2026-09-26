"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categories = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const sqlite_core_2 = require("drizzle-orm/sqlite-core");
const users_schema_1 = require("../users/users.schema");
const drizzle_orm_1 = require("drizzle-orm");
/**
 * This file defines the schema for the "categories" table in the database using Drizzle ORM. The table includes fields for id, userID, name, status, description, createdAt, and updatedAt. The userID field references the id field in the users table and has a cascade delete behavior. The createdAt and updatedAt fields are automatically set to the current timestamp when a new record is created or updated.
 */
exports.categories = (0, sqlite_core_2.sqliteTable)("categories", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    userID: (0, sqlite_core_1.text)("id_user").references(() => users_schema_1.users.id, { onDelete: 'cascade' }),
    name: (0, sqlite_core_1.text)("name").notNull(),
    status: (0, sqlite_core_1.text)("status").notNull().default("Active"),
    description: (0, sqlite_core_1.text)("description"),
    createdAt: (0, sqlite_core_1.text)("created_at").notNull().default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, sqlite_core_1.text)("updated_at").notNull().default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).$onUpdate(() => (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
