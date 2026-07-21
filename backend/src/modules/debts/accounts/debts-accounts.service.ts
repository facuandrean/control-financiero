import { db } from "../../../core/db/db";
import { debtAccounts } from "./debts-accounts.schema";
import { eq, and, sql } from "drizzle-orm";
import { AppError } from "../../../core/utils/AppError";
import type { DebtAccount, CreateDebtAccountInput, UpdateDebtAccountInput } from "./debts-accounts.types";
import crypto from "crypto";

export const debtAccountService = {
  getAllDebtAccounts: async (userID: string): Promise<DebtAccount[]> => {
    const allDebtAccounts = await db.select().from(debtAccounts).where(eq(debtAccounts.userID, userID)).all();
    if (!allDebtAccounts) {
      throw new AppError("No se encontraron cuentas de deuda", 404, "DEBT_ACCOUNTS_NOT_FOUND");
    }
    return allDebtAccounts;
  },

  getDebtAccountById: async (id: string, userID: string): Promise<DebtAccount> => {
    const debtAccount = await db.select().from(debtAccounts).where(and(eq(debtAccounts.id, id), eq(debtAccounts.userID, userID))).get();
    if (!debtAccount) {
      throw new AppError("No se encontró la cuenta de deuda o no está autorizado", 404, "DEBT_ACCOUNT_NOT_FOUND");
    };
    return debtAccount;
  },

  createDebtAccount: async (data: CreateDebtAccountInput & { userID: string }): Promise<DebtAccount> => {
    const newDebtAccount = await db.insert(debtAccounts).values({
      ...data,
      userID: data.userID,
      id: crypto.randomUUID(),
      status: "Open",
      createdAt: sql`CURRENT_TIMESTAMP`,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).returning().get();

    if (!newDebtAccount) {
      throw new AppError("No se pudo crear la cuenta de deuda", 500, "DEBT_ACCOUNT_CREATION_FAILED");
    }

    return newDebtAccount;
  },

  updateDebtAccount: async (id: string, data: UpdateDebtAccountInput): Promise<DebtAccount> => {
    const updated = await db
      .update(debtAccounts)
      .set(data)
      .where(eq(debtAccounts.id, id))
      .returning().get();

    return updated;
  },

  deactivateDebtAccount: async (id: string): Promise<DebtAccount> => {
    const deactivated = await db
      .update(debtAccounts)
      .set({ status: "Settled" })
      .where(eq(debtAccounts.id, id))
      .returning().get();

    return deactivated;
  },

  deleteDebtAccount: async (id: string): Promise<void> => {
    await db
      .delete(debtAccounts)
      .where(eq(debtAccounts.id, id));
  }
};