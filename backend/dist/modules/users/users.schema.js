"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.users = (0, sqlite_core_1.sqliteTable)('users', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    name: (0, sqlite_core_1.text)('name').notNull(),
    lastName: (0, sqlite_core_1.text)('last_name').notNull(),
    email: (0, sqlite_core_1.text)('email').notNull().unique(),
    password: (0, sqlite_core_1.text)('password').notNull(),
    createdAt: (0, sqlite_core_1.text)('created_at').notNull().default((0, drizzle_orm_1.sql) `datetime('now', '-3 hours')`),
    updatedAt: (0, sqlite_core_1.text)('updated_at').notNull().default((0, drizzle_orm_1.sql) `datetime('now', '-3 hours')`).$onUpdate(() => (0, drizzle_orm_1.sql) `datetime('now', '-3 hours')`),
});
