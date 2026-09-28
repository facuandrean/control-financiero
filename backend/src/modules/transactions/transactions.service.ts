import { db } from "../../core/db/db";
import { transactions } from "./transactions.schema";
import { accounts } from "../accounts/accounts.schema";
import { categories } from "../categories/categories.schema";
import { entities } from "../entities/entities.schema";
import { debts, debtPayments } from "../debts/debts.schema";
import { AppError } from "../../core/utils/AppError";
import {
  CreateTransactionInput,
  TransactionWithDetails,
  UpdateTransactionInput,
  TransactionFilters,
} from "./transactions.types";
import { and, desc, eq, like, or, sql, aliasedTable } from "drizzle-orm";
import crypto from "crypto";
import { accountService } from "../accounts/accounts.service";
import { categoryService } from "../categories/categories.service";
import { entityService } from "../entities/entities.service";

const toAccounts = aliasedTable(accounts, "to_accounts");

const isCreditCard = (accountType: string): boolean => {
  return accountType.toLowerCase().includes("crédito") || accountType.toLowerCase().includes("credito");
};

export const transactionService = {
  getAllTransactions: async (
    userID: string,
    filters?: TransactionFilters
  ): Promise<TransactionWithDetails[]> => {
    const conditions = [eq(transactions.userID, userID)];

    if (filters?.accountID) {
      conditions.push(
        or(
          eq(transactions.accountID, filters.accountID),
          eq(transactions.toAccountID, filters.accountID)
        )!
      );
    }

    if (filters?.type) {
      conditions.push(eq(transactions.type, filters.type));
    }

    if (filters?.year && filters?.month) {
      const formattedMonth = String(filters.month).padStart(2, "0");
      conditions.push(
        like(transactions.date, `${filters.year}-${formattedMonth}%`)
      );
    } else if (filters?.year) {
      conditions.push(like(transactions.date, `${filters.year}-%`));
    }

    const rows = await db
      .select({
        transaction: transactions,
        account: accounts,
        toAccount: toAccounts,
        category: categories,
        entity: entities,
      })
      .from(transactions)
      .leftJoin(accounts, eq(transactions.accountID, accounts.id))
      .leftJoin(toAccounts, eq(transactions.toAccountID, toAccounts.id))
      .leftJoin(categories, eq(transactions.categoryID, categories.id))
      .leftJoin(entities, eq(transactions.entityID, entities.id))
      .where(and(...conditions))
      .orderBy(desc(transactions.date), desc(transactions.createdAt))
      .all();

    return rows.map((r) => ({
      ...r.transaction,
      account: r.account?.id ? r.account : null,
      toAccount: r.toAccount?.id ? r.toAccount : null,
      category: r.category?.id ? r.category : null,
      entity: r.entity?.id ? r.entity : null,
    }));
  },

  getTransactionById: async (
    id: string,
    userID: string
  ): Promise<TransactionWithDetails> => {
    const row = await db
      .select({
        transaction: transactions,
        account: accounts,
        toAccount: toAccounts,
        category: categories,
        entity: entities,
      })
      .from(transactions)
      .leftJoin(accounts, eq(transactions.accountID, accounts.id))
      .leftJoin(toAccounts, eq(transactions.toAccountID, toAccounts.id))
      .leftJoin(categories, eq(transactions.categoryID, categories.id))
      .leftJoin(entities, eq(transactions.entityID, entities.id))
      .where(and(eq(transactions.id, id), eq(transactions.userID, userID)))
      .get();

    if (!row) {
      throw new AppError("Transacción no encontrada", 404, "TRANSACTION_NOT_FOUND");
    }

    return {
      ...row.transaction,
      account: row.account?.id ? row.account : null,
      toAccount: row.toAccount?.id ? row.toAccount : null,
      category: row.category?.id ? row.category : null,
      entity: row.entity?.id ? row.entity : null,
    };
  },

  createTransaction: async (
    data: CreateTransactionInput & { userID: string }
  ): Promise<TransactionWithDetails> => {
    // 1. Validar cuenta origen
    const sourceAccount = await accountService.getAccountById(
      data.accountID,
      data.userID
    );

    let destinationAccount: any = null;
    if (data.type === "Transfer") {
      if (!data.toAccountID) {
        throw new AppError(
          "La cuenta destino es obligatoria para transferencias",
          400,
          "DESTINATION_ACCOUNT_REQUIRED"
        );
      }
      if (data.toAccountID === data.accountID) {
        throw new AppError(
          "La cuenta destino no puede ser la misma que la cuenta origen",
          400,
          "SAME_SOURCE_DESTINATION"
        );
      }
      destinationAccount = await accountService.getAccountById(
        data.toAccountID,
        data.userID
      );
    }

    const finalCategoryID =
      data.type === "Transfer"
        ? null
        : data.categoryID && data.categoryID.trim() !== ""
        ? data.categoryID
        : null;

    const finalEntityID =
      data.type === "Transfer"
        ? null
        : data.entityID && data.entityID.trim() !== ""
        ? data.entityID
        : null;

    // 2. Validar categoría y entidad opcionales
    if (finalCategoryID) {
      await categoryService.getCategoryById(finalCategoryID, data.userID);
    }
    if (finalEntityID) {
      await entityService.getEntityById(finalEntityID, data.userID);
    }

    // 3. Validar saldo disponible para Expense o Transfer (a menos que sea Tarjeta de Crédito)
    if (data.type === "Expense" || data.type === "Transfer") {
      const sourceBalance = sourceAccount.amount ?? 0;
      if (!isCreditCard(sourceAccount.type) && data.amount > sourceBalance) {
        throw new AppError(
          "Saldo insuficiente en la cuenta origen",
          400,
          "INSUFFICIENT_FUNDS"
        );
      }
    }

    const transactionId = crypto.randomUUID();

    // 4. Ejecutar cambios en BD de forma atómica
    await db.transaction(async (tx) => {
      // Actualizar saldos de las cuentas
      if (data.type === "Income") {
        const newBalance = (sourceAccount.amount ?? 0) + data.amount;
        await tx
          .update(accounts)
          .set({ amount: newBalance, updatedAt: sql`CURRENT_TIMESTAMP` })
          .where(eq(accounts.id, sourceAccount.id));
      } else if (data.type === "Expense") {
        const newBalance = (sourceAccount.amount ?? 0) - data.amount;
        await tx
          .update(accounts)
          .set({ amount: newBalance, updatedAt: sql`CURRENT_TIMESTAMP` })
          .where(eq(accounts.id, sourceAccount.id));
      } else if (data.type === "Transfer") {
        const newSourceBalance = (sourceAccount.amount ?? 0) - data.amount;
        const newDestBalance = (destinationAccount.amount ?? 0) + data.amount;

        await tx
          .update(accounts)
          .set({ amount: newSourceBalance, updatedAt: sql`CURRENT_TIMESTAMP` })
          .where(eq(accounts.id, sourceAccount.id));

        await tx
          .update(accounts)
          .set({ amount: newDestBalance, updatedAt: sql`CURRENT_TIMESTAMP` })
          .where(eq(accounts.id, destinationAccount.id));
      }

      // Insertar transacción
      await tx.insert(transactions).values({
        id: transactionId,
        userID: data.userID,
        type: data.type,
        amount: data.amount,
        accountID: data.accountID,
        toAccountID: data.type === "Transfer" ? data.toAccountID : null,
        categoryID: finalCategoryID,
        entityID: finalEntityID,
        date: data.date,
        description: data.description,
        createdAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      });
    });

    return await transactionService.getTransactionById(
      transactionId,
      data.userID
    );
  },

  updateTransaction: async (
    id: string,
    userID: string,
    data: UpdateTransactionInput
  ): Promise<TransactionWithDetails> => {
    const oldTx = await transactionService.getTransactionById(id, userID);

    const targetType = data.type ?? oldTx.type;
    const targetAmount = data.amount ?? oldTx.amount;
    const targetAccountID = data.accountID ?? oldTx.accountID;
    const targetToAccountID =
      targetType === "Transfer"
        ? data.toAccountID !== undefined
          ? data.toAccountID
          : oldTx.toAccountID
        : null;
    const rawCategoryID =
      targetType === "Transfer"
        ? null
        : data.categoryID !== undefined
        ? data.categoryID
        : oldTx.categoryID;
    const targetCategoryID =
      rawCategoryID && rawCategoryID.trim() !== "" ? rawCategoryID : null;

    const rawEntityID =
      targetType === "Transfer"
        ? null
        : data.entityID !== undefined
        ? data.entityID
        : oldTx.entityID;
    const targetEntityID =
      rawEntityID && rawEntityID.trim() !== "" ? rawEntityID : null;
    const targetDate = data.date ?? oldTx.date;
    const targetDescription = data.description ?? oldTx.description;

    if (targetType === "Transfer") {
      if (!targetToAccountID) {
        throw new AppError(
          "La cuenta destino es obligatoria para transferencias",
          400,
          "DESTINATION_ACCOUNT_REQUIRED"
        );
      }
      if (targetToAccountID === targetAccountID) {
        throw new AppError(
          "La cuenta destino no puede ser la misma que la cuenta origen",
          400,
          "SAME_SOURCE_DESTINATION"
        );
      }
    }

    // Validar entidades/categorías nuevas si cambiaron
    if (targetCategoryID) {
      await categoryService.getCategoryById(targetCategoryID, userID);
    }
    if (targetEntityID) {
      await entityService.getEntityById(targetEntityID, userID);
    }

    await db.transaction(async (tx) => {
      // 1. REVERTIR IMPACTO DE LA TRANSACCIÓN ANTERIOR
      const currentOldSource = await tx
        .select()
        .from(accounts)
        .where(eq(accounts.id, oldTx.accountID))
        .get();

      if (!currentOldSource) {
        throw new AppError("Cuenta origen anterior no encontrada", 404);
      }

      if (oldTx.type === "Income") {
        await tx
          .update(accounts)
          .set({
            amount: (currentOldSource.amount ?? 0) - oldTx.amount,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(eq(accounts.id, oldTx.accountID));
      } else if (oldTx.type === "Expense") {
        await tx
          .update(accounts)
          .set({
            amount: (currentOldSource.amount ?? 0) + oldTx.amount,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(eq(accounts.id, oldTx.accountID));
      } else if (oldTx.type === "Transfer" && oldTx.toAccountID) {
        const currentOldDest = await tx
          .select()
          .from(accounts)
          .where(eq(accounts.id, oldTx.toAccountID))
          .get();

        await tx
          .update(accounts)
          .set({
            amount: (currentOldSource.amount ?? 0) + oldTx.amount,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(eq(accounts.id, oldTx.accountID));

        if (currentOldDest) {
          await tx
            .update(accounts)
            .set({
              amount: (currentOldDest.amount ?? 0) - oldTx.amount,
              updatedAt: sql`CURRENT_TIMESTAMP`,
            })
            .where(eq(accounts.id, oldTx.toAccountID));
        }
      }

      // 2. VALIDAR Y APLICAR NUEVA TRANSACCIÓN
      const newSourceAccount = await tx
        .select()
        .from(accounts)
        .where(eq(accounts.id, targetAccountID))
        .get();

      if (!newSourceAccount) {
        throw new AppError("Cuenta origen no encontrada", 404);
      }

      let newDestAccount: any = null;
      if (targetType === "Transfer" && targetToAccountID) {
        newDestAccount = await tx
          .select()
          .from(accounts)
          .where(eq(accounts.id, targetToAccountID))
          .get();

        if (!newDestAccount) {
          throw new AppError("Cuenta destino no encontrada", 404);
        }
      }

      if (targetType === "Expense" || targetType === "Transfer") {
        const currentBal = newSourceAccount.amount ?? 0;
        if (!isCreditCard(newSourceAccount.type) && targetAmount > currentBal) {
          throw new AppError(
            "Saldo insuficiente en la cuenta origen",
            400,
            "INSUFFICIENT_FUNDS"
          );
        }
      }

      // Actualizar cuentas con nuevo valor
      if (targetType === "Income") {
        await tx
          .update(accounts)
          .set({
            amount: (newSourceAccount.amount ?? 0) + targetAmount,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(eq(accounts.id, newSourceAccount.id));
      } else if (targetType === "Expense") {
        await tx
          .update(accounts)
          .set({
            amount: (newSourceAccount.amount ?? 0) - targetAmount,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(eq(accounts.id, newSourceAccount.id));
      } else if (targetType === "Transfer" && newDestAccount) {
        await tx
          .update(accounts)
          .set({
            amount: (newSourceAccount.amount ?? 0) - targetAmount,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(eq(accounts.id, newSourceAccount.id));

        await tx
          .update(accounts)
          .set({
            amount: (newDestAccount.amount ?? 0) + targetAmount,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(eq(accounts.id, newDestAccount.id));
      }

      // Actualizar la fila de transactions
      await tx
        .update(transactions)
        .set({
          type: targetType,
          amount: targetAmount,
          accountID: targetAccountID,
          toAccountID: targetToAccountID,
          categoryID: targetCategoryID,
          entityID: targetEntityID,
          date: targetDate,
          description: targetDescription,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(transactions.id, id));

      // Si la transacción está vinculada a un pago de deuda, sincronizar el pago y recalcular el estado de la deuda
      const linkedPayments = await tx
        .select()
        .from(debtPayments)
        .where(eq(debtPayments.transactionID, id))
        .all();

      for (const linked of linkedPayments) {
        await tx
          .update(debtPayments)
          .set({
            amount: targetAmount,
            date: targetDate,
          })
          .where(eq(debtPayments.id, linked.id));

        const debt = await tx
          .select()
          .from(debts)
          .where(eq(debts.id, linked.debtID))
          .get();

        if (debt) {
          const paymentsSum = await tx
            .select({
              total: sql<number>`COALESCE(SUM(${debtPayments.amount}), 0)`,
            })
            .from(debtPayments)
            .where(eq(debtPayments.debtID, debt.id))
            .get();

          const totalPaid = Number(paymentsSum?.total) || 0;

          let newStatus: "Pending" | "Partial" | "Settled" = "Pending";
          if (totalPaid >= debt.totalAmount) {
            newStatus = "Settled";
          } else if (totalPaid > 0) {
            newStatus = "Partial";
          } else {
            newStatus = "Pending";
          }

          await tx
            .update(debts)
            .set({
              status: newStatus,
              updatedAt: sql`CURRENT_TIMESTAMP`,
            })
            .where(eq(debts.id, debt.id));
        }
      }
    });

    return await transactionService.getTransactionById(id, userID);
  },

  deleteTransaction: async (id: string, userID: string): Promise<void> => {
    const txToDelete = await transactionService.getTransactionById(id, userID);

    await db.transaction(async (tx) => {
      // Revertir impacto en cuentas
      const sourceAccount = await tx
        .select()
        .from(accounts)
        .where(eq(accounts.id, txToDelete.accountID))
        .get();

      if (sourceAccount) {
        if (txToDelete.type === "Income") {
          await tx
            .update(accounts)
            .set({
              amount: (sourceAccount.amount ?? 0) - txToDelete.amount,
              updatedAt: sql`CURRENT_TIMESTAMP`,
            })
            .where(eq(accounts.id, sourceAccount.id));
        } else if (txToDelete.type === "Expense") {
          await tx
            .update(accounts)
            .set({
              amount: (sourceAccount.amount ?? 0) + txToDelete.amount,
              updatedAt: sql`CURRENT_TIMESTAMP`,
            })
            .where(eq(accounts.id, sourceAccount.id));
        } else if (txToDelete.type === "Transfer" && txToDelete.toAccountID) {
          const destAccount = await tx
            .select()
            .from(accounts)
            .where(eq(accounts.id, txToDelete.toAccountID))
            .get();

          await tx
            .update(accounts)
            .set({
              amount: (sourceAccount.amount ?? 0) + txToDelete.amount,
              updatedAt: sql`CURRENT_TIMESTAMP`,
            })
            .where(eq(accounts.id, sourceAccount.id));

          if (destAccount) {
            await tx
              .update(accounts)
              .set({
                amount: (destAccount.amount ?? 0) - txToDelete.amount,
                updatedAt: sql`CURRENT_TIMESTAMP`,
              })
              .where(eq(accounts.id, destAccount.id));
          }
        }
      }

      // Revertir y eliminar pago de deuda vinculado si existía
      const linkedPayments = await tx
        .select()
        .from(debtPayments)
        .where(eq(debtPayments.transactionID, id))
        .all();

      for (const linked of linkedPayments) {
        await tx
          .delete(debtPayments)
          .where(eq(debtPayments.id, linked.id));

        const debt = await tx
          .select()
          .from(debts)
          .where(eq(debts.id, linked.debtID))
          .get();

        if (debt) {
          const paymentsSum = await tx
            .select({
              total: sql<number>`COALESCE(SUM(${debtPayments.amount}), 0)`,
            })
            .from(debtPayments)
            .where(eq(debtPayments.debtID, debt.id))
            .get();

          const totalPaid = Number(paymentsSum?.total) || 0;

          let newStatus: "Pending" | "Partial" | "Settled" = "Pending";
          if (totalPaid >= debt.totalAmount) {
            newStatus = "Settled";
          } else if (totalPaid > 0) {
            newStatus = "Partial";
          } else {
            newStatus = "Pending";
          }

          await tx
            .update(debts)
            .set({
              status: newStatus,
              updatedAt: sql`CURRENT_TIMESTAMP`,
            })
            .where(eq(debts.id, debt.id));
        }
      }

      await tx
        .delete(transactions)
        .where(and(eq(transactions.id, id), eq(transactions.userID, userID)));
    });
  },
};
