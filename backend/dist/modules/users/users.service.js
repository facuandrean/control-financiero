"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../../core/db/db");
const AppError_1 = require("../../core/utils/AppError");
const users_schema_1 = require("./users.schema");
const crypto_1 = __importDefault(require("crypto"));
exports.userService = {
    // Busca un usuario por ID. Si no existe, corta la ejecución con un 404.
    getUserById: async (id) => {
        const user = await db_1.db.select().from(users_schema_1.users).where((0, drizzle_orm_1.eq)(users_schema_1.users.id, id)).get();
        if (!user) {
            throw new AppError_1.AppError("Usuario no encontrado", 404, "USER_NOT_FOUND");
        }
        return user;
    },
    // Busca por email. Devuelve el usuario o undefined (no lanza error).
    findByEmail: async (email) => {
        const user = await db_1.db.select().from(users_schema_1.users).where((0, drizzle_orm_1.eq)(users_schema_1.users.email, email)).get();
        return user;
    },
    createUser: async (data) => {
        const newUser = await db_1.db.insert(users_schema_1.users).values({
            ...data,
            createdAt: (0, drizzle_orm_1.sql) `datetime('now', '-3 hours')`,
            updatedAt: (0, drizzle_orm_1.sql) `datetime('now', '-3 hours')`,
            id: crypto_1.default.randomUUID(),
        }).returning().get();
        if (!newUser) {
            throw new AppError_1.AppError("No se pudo crear el usuario", 500, "USER_CREATION_FAILED");
        }
        return newUser;
    },
    // Actualiza datos parciales y retorna el registro actualizado.
    updateUser: async (id, data) => {
        const updatedUser = await db_1.db
            .update(users_schema_1.users)
            .set({
            ...data,
            updatedAt: (0, drizzle_orm_1.sql) `datetime('now', '-3 hours')`
        }).where((0, drizzle_orm_1.eq)(users_schema_1.users.id, id)).returning().get();
        if (!updatedUser) {
            throw new AppError_1.AppError("No se pudo actualizar: Usuario no encontrado", 404, "USER_NOT_FOUND");
        }
        return updatedUser;
    },
    // Borra el registro de la DB
    deleteUser: async (id) => {
        const deletedUser = await db_1.db
            .delete(users_schema_1.users)
            .where((0, drizzle_orm_1.eq)(users_schema_1.users.id, id))
            .returning().get();
        if (!deletedUser) {
            throw new AppError_1.AppError("No se pudo eliminar: Usuario no encontrado", 404, "USER_NOT_FOUND");
        }
    }
};
