"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const client_1 = require("@libsql/client");
const config_1 = require("../../config");
const libsql_1 = require("drizzle-orm/libsql");
if (!config_1.config.dbUrl || !config_1.config.dbToken) {
    throw new Error("DB_URL or DB_TOKEN is not set");
}
const client = (0, client_1.createClient)({
    url: config_1.config.dbUrl,
    authToken: config_1.config.dbToken
});
exports.db = (0, libsql_1.drizzle)(client);
