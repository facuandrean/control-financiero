"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entities = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const sqlite_core_2 = require("drizzle-orm/sqlite-core");
const users_schema_1 = require("../users/users.schema");
const drizzle_orm_1 = require("drizzle-orm");
exports.entities = (0, sqlite_core_2.sqliteTable)("entities", {
    id: (0, sqlite_core_1.text)("id").primaryKey(),
    userID: (0, sqlite_core_1.text)("id_user").references(() => users_schema_1.users.id, { onDelete: 'cascade' }),
    name: (0, sqlite_core_1.text)("name").notNull(),
    status: (0, sqlite_core_1.text)("status").notNull().default("Active"),
    description: (0, sqlite_core_1.text)("description"),
    createdAt: (0, sqlite_core_1.text)("created_at").notNull().default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, sqlite_core_1.text)("updated_at").notNull().default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).$onUpdate(() => (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
