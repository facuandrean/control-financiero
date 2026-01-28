import { db } from "@core/db/db";
import { accounts } from "./accounts.schema";
import { AppError } from "@core/utils/AppError";
import { Account, CreateAccountInput, NewAccount, UpdateAccountInput } from "./accounts.types";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";

export const accountService = {
  getAllAccounts: async (): Promise<Account[]> => {
    const allAccounts = await db.select().from(accounts).all();
    if (!allAccounts) {
      throw new AppError("No se encontraron cuentas", 404, "ACCOUNTS_NOT_FOUND");
    }
    return allAccounts;
  },

  getAccountById: async (id: string): Promise<Account> => {
    const account = await db.select().from(accounts).where(eq(accounts.id, id)).get();
    if (!account) {
      throw new AppError("Cuenta no encontrada", 404, "ACCOUNT_NOT_FOUND");
    }
    return account;
  },

  createAccount: async (data: CreateAccountInput & { userID: string }): Promise<NewAccount> => {
    const newAccount = await db.insert(accounts).values({
      ...data,
      userID: data.userID,
      type: "Cash",
      id: crypto.randomUUID(),
      status: "Active",
      createdAt: sql`CURRENT_TIMESTAMP`,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).returning().get();

    if (!newAccount) {
      throw new AppError("No se pudo crear la cuenta", 500, "ACCOUNT_CREATION_FAILED");
    }

    return newAccount;
  },

  updateAccount: async (id: string, data: UpdateAccountInput): Promise<Account> => {
    const updatedAccount = await db.update(accounts).set({
      ...data,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).where(eq(accounts.id, id)).returning().get();

    if (!updatedAccount) {
      throw new AppError("No se pudo actualizar la cuenta", 500, "ACCOUNT_UPDATE_FAILED");
    }

    return updatedAccount;
  },

  deactivateAccount: async (id: string): Promise<Account> => {
    const deactivatedAccount = await db.update(accounts).set({
      status: "Inactive",
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).where(eq(accounts.id, id)).returning().get();

    if (!deactivatedAccount) {
      throw new AppError("No se pudo desactivar la cuenta", 500, "ACCOUNT_DEACTIVATION_FAILED");
    }

    return deactivatedAccount;
  },

  deleteAccount: async (id: string): Promise<void> => {
    const deletedAccount = await db.delete(accounts).where(eq(accounts.id, id)).returning().get();
    if (!deletedAccount) {
      throw new AppError("No se pudo eliminar la cuenta", 500, "ACCOUNT_DELETION_FAILED");
    }
  },
};

