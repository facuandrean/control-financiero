"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debtAccountService = void 0;
const db_1 = require("../../../core/db/db");
const debts_accounts_schema_1 = require("./debts-accounts.schema");
const drizzle_orm_1 = require("drizzle-orm");
const AppError_1 = require("../../../core/utils/AppError");
const crypto_1 = __importDefault(require("crypto"));
exports.debtAccountService = {
    getAllDebtAccounts: async (userID) => {
        const allDebtAccounts = await db_1.db.select().from(debts_accounts_schema_1.debtAccounts).where((0, drizzle_orm_1.eq)(debts_accounts_schema_1.debtAccounts.userID, userID)).all();
        if (!allDebtAccounts) {
            throw new AppError_1.AppError("No se encontraron cuentas de deuda", 404, "DEBT_ACCOUNTS_NOT_FOUND");
        }
        return allDebtAccounts;
    },
    getDebtAccountById: async (id, userID) => {
        const debtAccount = await db_1.db.select().from(debts_accounts_schema_1.debtAccounts).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(debts_accounts_schema_1.debtAccounts.id, id), (0, drizzle_orm_1.eq)(debts_accounts_schema_1.debtAccounts.userID, userID))).get();
        if (!debtAccount) {
            throw new AppError_1.AppError("No se encontró la cuenta de deuda o no está autorizado", 404, "DEBT_ACCOUNT_NOT_FOUND");
        }
        ;
        return debtAccount;
    },
    createDebtAccount: async (data) => {
        const newDebtAccount = await db_1.db.insert(debts_accounts_schema_1.debtAccounts).values({
            ...data,
            userID: data.userID,
            id: crypto_1.default.randomUUID(),
            status: "Open",
            createdAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        }).returning().get();
        if (!newDebtAccount) {
            throw new AppError_1.AppError("No se pudo crear la cuenta de deuda", 500, "DEBT_ACCOUNT_CREATION_FAILED");
        }
        return newDebtAccount;
    },
    updateDebtAccount: async (id, data) => {
        const updated = await db_1.db
            .update(debts_accounts_schema_1.debtAccounts)
            .set(data)
            .where((0, drizzle_orm_1.eq)(debts_accounts_schema_1.debtAccounts.id, id))
            .returning().get();
        return updated;
    },
    deactivateDebtAccount: async (id) => {
        const deactivated = await db_1.db
            .update(debts_accounts_schema_1.debtAccounts)
            .set({ status: "Settled" })
            .where((0, drizzle_orm_1.eq)(debts_accounts_schema_1.debtAccounts.id, id))
            .returning().get();
        return deactivated;
    },
    deleteDebtAccount: async (id) => {
        await db_1.db
            .delete(debts_accounts_schema_1.debtAccounts)
            .where((0, drizzle_orm_1.eq)(debts_accounts_schema_1.debtAccounts.id, id));
    }
};
