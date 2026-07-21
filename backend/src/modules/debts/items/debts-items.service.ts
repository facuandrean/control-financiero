import { db } from "../../../core/db/db";
import { debtItems } from "./debts-items.schema";
import { and, eq, sql } from "drizzle-orm";
import { AppError } from "../../../core/utils/AppError";
import { debtAccountService } from "../accounts/debts-accounts.service";
import type { DebtItem, CreateDebtItemInput, UpdateDebtItemInput } from "./debts-items.types";
import crypto from "crypto";

export const debtItemService = {
  getAllDebtItems: async (debtAccountID: string, userID: string): Promise<DebtItem[]> => {
    await debtAccountService.getDebtAccountById(debtAccountID, userID);

    const allDebtItems = await db.select().from(debtItems).where(eq(debtItems.debtAccountID, debtAccountID)).all();
    if (allDebtItems.length === 0) {
      throw new AppError("No se encontraron ítems de deuda", 404, "DEBT_ITEMS_NOT_FOUND");
    }

    return allDebtItems;
  },

  getDebtItemById: async (id: string, debtAccountID: string, userID: string): Promise<DebtItem> => {
    await debtAccountService.getDebtAccountById(debtAccountID, userID);

    const debtItem = await db.select().from(debtItems).where(and(eq(debtItems.id, id), eq(debtItems.debtAccountID, debtAccountID))).get();
    if (!debtItem) {
      throw new AppError("Ítem de deuda no encontrado", 404, "DEBT_ITEM_NOT_FOUND");
    }

    return debtItem;
  },

  createDebtItem: async (data: CreateDebtItemInput & { debtAccountID: string; userID: string }): Promise<DebtItem> => {
    await debtAccountService.getDebtAccountById(data.debtAccountID, data.userID);

    const newDebtItem = await db.insert(debtItems).values({
      ...data,
      id: crypto.randomUUID(),
      status: "Pending",
      createdAt: sql`CURRENT_TIMESTAMP`,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).returning().get();

    if (!newDebtItem) {
      throw new AppError("No se pudo crear el ítem de deuda", 500, "DEBT_ITEM_CREATION_FAILED");
    }

    return newDebtItem;
  },

  updateDebtItem: async (id: string, debtAccountID: string, data: UpdateDebtItemInput): Promise<DebtItem> => {
    const [updatedDebtItem] = await db.update(debtItems).set({
      ...data,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).where(and(eq(debtItems.id, id), eq(debtItems.debtAccountID, debtAccountID))).returning();

    if (!updatedDebtItem) {
      throw new AppError("No se pudo actualizar el ítem de deuda", 500, "DEBT_ITEM_UPDATE_FAILED");
    }

    return updatedDebtItem;
  },

  deactivateDebtItem: async (id: string, debtAccountID: string, userID: string): Promise<DebtItem> => {
    await debtAccountService.getDebtAccountById(debtAccountID, userID);

    const [deactivatedDebtItem] = await db.update(debtItems).set({
      status: "Paid",
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).where(and(eq(debtItems.id, id), eq(debtItems.debtAccountID, debtAccountID))).returning();

    if (!deactivatedDebtItem) {
      throw new AppError("No se pudo marcar como pagado el ítem de deuda", 500, "DEBT_ITEM_DEACTIVATION_FAILED");
    }

    return deactivatedDebtItem;
  },
};
