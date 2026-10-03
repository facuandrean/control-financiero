"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessions = void 0;
const users_schema_1 = require("../users/users.schema");
const drizzle_orm_1 = require("drizzle-orm");
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const sqlite_core_2 = require("drizzle-orm/sqlite-core");
exports.sessions = (0, sqlite_core_2.sqliteTable)('sessions', {
    id: (0, sqlite_core_1.text)('id').primaryKey(),
    userID: (0, sqlite_core_1.text)('id_user').references(() => users_schema_1.users.id, { onDelete: 'cascade' }),
    tokenHashed: (0, sqlite_core_1.text)('token_hashed').notNull(),
    ipAddress: (0, sqlite_core_1.text)('ip_address'),
    userAgent: (0, sqlite_core_1.text)('user_agent'),
    expiresAt: (0, sqlite_core_1.text)('expires_at').notNull(),
    createdAt: (0, sqlite_core_1.text)('created_at').notNull().default((0, drizzle_orm_1.sql) `datetime('now', '-3 hours')`)
});
