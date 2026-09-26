"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debtItemService = void 0;
const db_1 = require("../../../core/db/db");
const debts_items_schema_1 = require("./debts-items.schema");
const drizzle_orm_1 = require("drizzle-orm");
const AppError_1 = require("../../../core/utils/AppError");
const debts_accounts_service_1 = require("../accounts/debts-accounts.service");
const crypto_1 = __importDefault(require("crypto"));
exports.debtItemService = {
    getAllDebtItems: async (debtAccountID, userID) => {
        await debts_accounts_service_1.debtAccountService.getDebtAccountById(debtAccountID, userID);
        const allDebtItems = await db_1.db.select().from(debts_items_schema_1.debtItems).where((0, drizzle_orm_1.eq)(debts_items_schema_1.debtItems.debtAccountID, debtAccountID)).all();
        if (allDebtItems.length === 0) {
            throw new AppError_1.AppError("No se encontraron ítems de deuda", 404, "DEBT_ITEMS_NOT_FOUND");
        }
        return allDebtItems;
    },
    getDebtItemById: async (id, debtAccountID, userID) => {
        await debts_accounts_service_1.debtAccountService.getDebtAccountById(debtAccountID, userID);
        const debtItem = await db_1.db.select().from(debts_items_schema_1.debtItems).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(debts_items_schema_1.debtItems.id, id), (0, drizzle_orm_1.eq)(debts_items_schema_1.debtItems.debtAccountID, debtAccountID))).get();
        if (!debtItem) {
            throw new AppError_1.AppError("Ítem de deuda no encontrado", 404, "DEBT_ITEM_NOT_FOUND");
        }
        return debtItem;
    },
    createDebtItem: async (data) => {
        await debts_accounts_service_1.debtAccountService.getDebtAccountById(data.debtAccountID, data.userID);
        const newDebtItem = await db_1.db.insert(debts_items_schema_1.debtItems).values({
            ...data,
            id: crypto_1.default.randomUUID(),
            status: "Pending",
            createdAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        }).returning().get();
        if (!newDebtItem) {
            throw new AppError_1.AppError("No se pudo crear el ítem de deuda", 500, "DEBT_ITEM_CREATION_FAILED");
        }
        return newDebtItem;
    },
    updateDebtItem: async (id, debtAccountID, data) => {
        const [updatedDebtItem] = await db_1.db.update(debts_items_schema_1.debtItems).set({
            ...data,
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        }).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(debts_items_schema_1.debtItems.id, id), (0, drizzle_orm_1.eq)(debts_items_schema_1.debtItems.debtAccountID, debtAccountID))).returning();
        if (!updatedDebtItem) {
            throw new AppError_1.AppError("No se pudo actualizar el ítem de deuda", 500, "DEBT_ITEM_UPDATE_FAILED");
        }
        return updatedDebtItem;
    },
    deactivateDebtItem: async (id, debtAccountID, userID) => {
        await debts_accounts_service_1.debtAccountService.getDebtAccountById(debtAccountID, userID);
        const [deactivatedDebtItem] = await db_1.db.update(debts_items_schema_1.debtItems).set({
            status: "Paid",
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        }).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(debts_items_schema_1.debtItems.id, id), (0, drizzle_orm_1.eq)(debts_items_schema_1.debtItems.debtAccountID, debtAccountID))).returning();
        if (!deactivatedDebtItem) {
            throw new AppError_1.AppError("No se pudo marcar como pagado el ítem de deuda", 500, "DEBT_ITEM_DEACTIVATION_FAILED");
        }
        return deactivatedDebtItem;
    },
};
