"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountService = void 0;
const db_1 = require("../../core/db/db");
const accounts_schema_1 = require("./accounts.schema");
const AppError_1 = require("../../core/utils/AppError");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
exports.accountService = {
    getAllAccounts: async (userID) => {
        const allAccounts = await db_1.db.select().from(accounts_schema_1.accounts).where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.userID, userID)).all();
        if (!allAccounts) {
            throw new AppError_1.AppError("No se encontraron cuentas", 404, "ACCOUNTS_NOT_FOUND");
        }
        return allAccounts;
    },
    getAccountById: async (id, userID) => {
        const account = await db_1.db.select().from(accounts_schema_1.accounts).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, id), (0, drizzle_orm_1.eq)(accounts_schema_1.accounts.userID, userID))).get();
        if (!account) {
            throw new AppError_1.AppError("Cuenta no encontrada", 404, "ACCOUNT_NOT_FOUND");
        }
        return account;
    },
    createAccount: async (data) => {
        const newAccount = await db_1.db.insert(accounts_schema_1.accounts).values({
            ...data,
            userID: data.userID,
            id: crypto_1.default.randomUUID(),
            status: "Active",
            createdAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        }).returning().get();
        if (!newAccount) {
            throw new AppError_1.AppError("No se pudo crear la cuenta", 500, "ACCOUNT_CREATION_FAILED");
        }
        return newAccount;
    },
    updateAccount: async (id, userID, data) => {
        const existing = await exports.accountService.getAccountById(id, userID);
        const allowedData = { ...data };
        // Se permite modificar el saldo directamente si la cuenta es de tipo 'Efectivo' o 'Billetera virtual'
        const isDirectlyEditable = existing.type === "Efectivo" ||
            data.type === "Efectivo" ||
            existing.type === "Billetera virtual" ||
            data.type === "Billetera virtual";
        if (!isDirectlyEditable) {
            delete allowedData.amount;
        }
        const updatedAccount = await db_1.db
            .update(accounts_schema_1.accounts)
            .set({
            ...allowedData,
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, id), (0, drizzle_orm_1.eq)(accounts_schema_1.accounts.userID, userID)))
            .returning()
            .get();
        if (!updatedAccount) {
            throw new AppError_1.AppError("No se pudo actualizar la cuenta", 500, "ACCOUNT_UPDATE_FAILED");
        }
        return updatedAccount;
    },
    deactivateAccount: async (id, userID) => {
        const deactivatedAccount = await db_1.db
            .update(accounts_schema_1.accounts)
            .set({
            status: "Inactive",
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, id), (0, drizzle_orm_1.eq)(accounts_schema_1.accounts.userID, userID)))
            .returning()
            .get();
        if (!deactivatedAccount) {
            throw new AppError_1.AppError("No se pudo desactivar la cuenta", 500, "ACCOUNT_DEACTIVATION_FAILED");
        }
        return deactivatedAccount;
    },
    deleteAccount: async (id, userID) => {
        const deletedAccount = await db_1.db
            .delete(accounts_schema_1.accounts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, id), (0, drizzle_orm_1.eq)(accounts_schema_1.accounts.userID, userID)))
            .returning()
            .get();
        if (!deletedAccount) {
            throw new AppError_1.AppError("No se pudo eliminar la cuenta", 500, "ACCOUNT_DELETION_FAILED");
        }
    },
};
