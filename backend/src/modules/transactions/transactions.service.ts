import { db } from "@core/db/db";
import { transactions } from "./transactions.schema";
import { AppError } from "@core/utils/AppError";
import { Transaction, CreateTransactionInput, NewTransaction, UpdateTransactionInput } from "./transactions.types";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";

export const transactionService = {
  getAllTransactions: async (userID: string): Promise<Transaction[]> => {
    const allTransactions = await db.select().from(transactions).where(eq(transactions.userID, userID)).all();
    if (!allTransactions) {
      throw new AppError("No se encontraron transacciones", 404, "TRANSACTIONS_NOT_FOUND");
    }
    return allTransactions;
  },

  getTransactionById: async (id: string): Promise<Transaction> => {
    const transaction = await db.select().from(transactions).where(eq(transactions.id, id)).get();
    if (!transaction) {
      throw new AppError("Transacción no encontrada", 404, "TRANSACTION_NOT_FOUND");
    }
    return transaction;
  },

  createTransaction: async (data: CreateTransactionInput & { userID: string }): Promise<NewTransaction> => {
    const newTransaction = await db.insert(transactions).values({
      ...data,
      userID: data.userID,
      id: crypto.randomUUID(),
      status: "Recorded",
      createdAt: sql`CURRENT_TIMESTAMP`,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).returning().get();

    if (!newTransaction) {
      throw new AppError("No se pudo crear la transacción", 500, "TRANSACTION_CREATION_FAILED");
    }

    return newTransaction;
  },

  updateTransaction: async (id: string, data: UpdateTransactionInput): Promise<Transaction> => {
    const updatedTransaction = await db.update(transactions).set({
      ...data,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).where(eq(transactions.id, id)).returning().get();

    if (!updatedTransaction) {
      throw new AppError("No se pudo actualizar la transacción", 500, "TRANSACTION_UPDATE_FAILED");
    }

    return updatedTransaction;
  },

  revertTransaction: async (id: string): Promise<Transaction> => {
    const revertedTransaction = await db.update(transactions).set({
      status: "Reverted",
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).where(eq(transactions.id, id)).returning().get();

    if (!revertedTransaction) {
      throw new AppError("No se pudo revertir la transacción", 500, "TRANSACTION_REVERT_FAILED");
    }

    return revertedTransaction;
  },

  deleteTransaction: async (id: string): Promise<void> => {
    const deletedTransaction = await db.delete(transactions).where(eq(transactions.id, id)).returning().get();
    if (!deletedTransaction) {
      throw new AppError("No se pudo eliminar la transacción", 500, "TRANSACTION_DELETION_FAILED");
    }
  },
};

