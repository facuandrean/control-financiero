"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionService = void 0;
const db_1 = require("../../core/db/db");
const transactions_schema_1 = require("./transactions.schema");
const AppError_1 = require("../../core/utils/AppError");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
const entities_service_1 = require("../entities/entities.service");
const categories_service_1 = require("../categories/categories.service");
const accounts_service_1 = require("../accounts/accounts.service");
exports.transactionService = {
    getAllTransactions: async (userID) => {
        const allTransactions = await db_1.db.select().from(transactions_schema_1.transactions).where((0, drizzle_orm_1.eq)(transactions_schema_1.transactions.userID, userID)).all();
        if (!allTransactions) {
            throw new AppError_1.AppError("No se encontraron transacciones", 404, "TRANSACTIONS_NOT_FOUND");
        }
        return allTransactions;
    },
    getTransactionById: async (id, userID) => {
        const transaction = await db_1.db.select().from(transactions_schema_1.transactions).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(transactions_schema_1.transactions.id, id), (0, drizzle_orm_1.eq)(transactions_schema_1.transactions.userID, userID))).get();
        if (!transaction) {
            throw new AppError_1.AppError("Transacción no encontrada", 404, "TRANSACTION_NOT_FOUND");
        }
        return transaction;
    },
    createTransaction: async (data) => {
        // Verificar que las cuentas, categorías y entidades existan y sean propias del usuario autenticado
        await accounts_service_1.accountService.getAccountById(data.accountID, data.userID);
        await categories_service_1.categoryService.getCategoryById(data.categoryID, data.userID);
        await entities_service_1.entityService.getEntityById(data.entityID, data.userID);
        const newTransaction = await db_1.db.insert(transactions_schema_1.transactions).values({
            ...data,
            userID: data.userID,
            id: crypto_1.default.randomUUID(),
            status: "Recorded",
            createdAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        }).returning().get();
        if (!newTransaction) {
            throw new AppError_1.AppError("No se pudo crear la transacción", 500, "TRANSACTION_CREATION_FAILED");
        }
        return newTransaction;
    },
    updateTransaction: async (id, data) => {
        const updatedTransaction = await db_1.db.update(transactions_schema_1.transactions).set({
            ...data,
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        }).where((0, drizzle_orm_1.eq)(transactions_schema_1.transactions.id, id)).returning().get();
        if (!updatedTransaction) {
            throw new AppError_1.AppError("No se pudo actualizar la transacción", 500, "TRANSACTION_UPDATE_FAILED");
        }
        return updatedTransaction;
    }
};
