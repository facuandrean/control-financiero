import { db } from "../../core/db/db";
import { transactions } from "./transactions.schema";
import { accounts } from "../accounts/accounts.schema";
import { categories } from "../categories/categories.schema";
import { entities } from "../entities/entities.schema";
import { debts, debtMovements } from "../debts/debts.schema";
import { AppError } from "../../core/utils/AppError";
import {
  CreateTransactionInput,
  TransactionWithDetails,
  UpdateTransactionInput,
  TransactionFilters,
  NewTransaction,
} from "./transactions.types";
import { and, desc, eq, like, or, sql, aliasedTable } from "drizzle-orm";
import crypto from "crypto";
import { accountService } from "../accounts/accounts.service";
import { categoryService } from "../categories/categories.service";
import { entityService } from "../entities/entities.service";

const toAccounts = aliasedTable(accounts, "to_accounts");

const isCreditCard = (accountType?: string | null, accountTag?: string | null): boolean => {
  if (accountType === "Credit Card") return true;
  if (
    accountTag &&
    (accountTag.toLowerCase().includes("crédito") ||
      accountTag.toLowerCase().includes("credito") ||
      accountTag.toLowerCase().includes("credit"))
  ) {
    return true;
  }
  if (!accountType) return false;
  const lower = accountType.toLowerCase();
  return lower.includes("crédito") || lower.includes("credito") || lower.includes("credit");
};

const addMonthsToDate = (baseDateStr: string, monthsToAdd: number): string => {
  if (monthsToAdd === 0) {
    return baseDateStr.split("T")[0];
  }

  const [yearStr, monthStr, dayStr] = baseDateStr.split("T")[0].split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // 0-indexed
  const day = parseInt(dayStr, 10);

  const targetDate = new Date(year, month + monthsToAdd, day);
  const expectedMonth = (((month + monthsToAdd) % 12) + 12) % 12;

  if (targetDate.getMonth() !== expectedMonth) {
    // Si hubo desborde de fin de mes (ej: 31 de marzo + 1 mes -> día 0 de mayo es 30 de abril)
    const adjustedDate = new Date(year, month + monthsToAdd + 1, 0);
    const y = adjustedDate.getFullYear();
    const m = String(adjustedDate.getMonth() + 1).padStart(2, "0");
    const d = String(adjustedDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, "0");
  const d = String(targetDate.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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

    const page = filters?.page ? Math.max(1, Number(filters.page)) : undefined;
    const pageSize = filters?.pageSize ? Math.max(1, Number(filters.pageSize)) : undefined;

    const baseQuery = db
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
      .orderBy(desc(transactions.date), desc(transactions.createdAt));

    let rows;
    if (page && pageSize) {
      rows = await baseQuery.limit(pageSize).offset((page - 1) * pageSize).all();
    } else if (pageSize) {
      rows = await baseQuery.limit(pageSize).all();
    } else {
      rows = await baseQuery.all();
    }

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

    if (sourceAccount.status === "Inactive") {
      throw new AppError("No se pueden registrar transacciones con una cuenta inactiva", 400, "INACTIVE_ACCOUNT");
    }

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

      if (destinationAccount.status === "Inactive") {
        throw new AppError("No se pueden realizar transferencias a una cuenta inactiva", 400, "INACTIVE_ACCOUNT");
      }
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
      const cat = await categoryService.getCategoryById(finalCategoryID, data.userID);
      if (cat.status === "Inactive") {
        throw new AppError("No se pueden registrar transacciones con una categoría inactiva", 400, "INACTIVE_CATEGORY");
      }
    }
    if (finalEntityID) {
      const ent = await entityService.getEntityById(finalEntityID, data.userID);
      if (ent.status === "Inactive") {
        throw new AppError("No se pueden registrar transacciones con una entidad inactiva", 400, "INACTIVE_ENTITY");
      }
    }

    // 3. Validar saldo disponible para Expense o Transfer (a menos que sea Tarjeta de Crédito)
    if (data.type === "Expense" || data.type === "Transfer") {
      const sourceBalance = sourceAccount.amount ?? 0;
      if (!isCreditCard(sourceAccount.type, sourceAccount.tag) && data.amount > sourceBalance) {
        throw new AppError(
          "Saldo insuficiente en la cuenta origen",
          400,
          "INSUFFICIENT_FUNDS"
        );
      }
    }

    const installmentsCount = data.installments ?? 1;

    // Manejo de compras en cuotas con Tarjeta de Crédito
    if (installmentsCount > 1) {
      if (!isCreditCard(sourceAccount.type, sourceAccount.tag)) {
        throw new AppError(
          "Solo se pueden registrar cuotas con tarjetas de crédito",
          400,
          "CREDIT_CARD_REQUIRED"
        );
      }

      if (data.type !== "Expense") {
        throw new AppError(
          "Las cuotas solo aplican para transacciones de tipo Egreso",
          400,
          "EXPENSE_REQUIRED_FOR_INSTALLMENTS"
        );
      }

      const installmentAmount = Math.floor(data.amount / installmentsCount);
      const remainder = data.amount - installmentAmount * installmentsCount;

      const transactionsToInsert: NewTransaction[] = [];
      const firstTransactionId = crypto.randomUUID();

      for (let i = 1; i <= installmentsCount; i++) {
        const currentId = i === 1 ? firstTransactionId : crypto.randomUUID();
        const currentAmount =
          i === 1 ? installmentAmount + remainder : installmentAmount;
        const currentDate = addMonthsToDate(data.date, i - 1);
        const currentDescription = `${data.description} (Cuota ${i}/${installmentsCount})`;

        transactionsToInsert.push({
          id: currentId,
          userID: data.userID,
          type: data.type,
          amount: currentAmount,
          accountID: data.accountID,
          toAccountID: null,
          categoryID: finalCategoryID,
          entityID: finalEntityID,
          date: currentDate,
          description: currentDescription,
        });
      }

      await db.transaction(async (tx) => {
        // En tarjetas de crédito, la deuda aumenta con el monto total de la compra
        const isCard = isCreditCard(sourceAccount.type, sourceAccount.tag);
        const newBalance = isCard
          ? (sourceAccount.amount ?? 0) + data.amount
          : (sourceAccount.amount ?? 0) - data.amount;

        await tx
          .update(accounts)
          .set({ amount: newBalance, updatedAt: sql`CURRENT_TIMESTAMP` })
          .where(eq(accounts.id, sourceAccount.id));

        // Bulk insert de todas las cuotas generadas
        await tx.insert(transactions).values(transactionsToInsert);
      });

      return await transactionService.getTransactionById(
        firstTransactionId,
        data.userID
      );
    }

    const transactionId = crypto.randomUUID();

    // 4. Ejecutar cambios en BD de forma atómica
    await db.transaction(async (tx) => {
      // Actualizar saldos de las cuentas
      const isCard = isCreditCard(sourceAccount.type, sourceAccount.tag);
      if (data.type === "Income") {
        const newBalance = isCard
          ? (sourceAccount.amount ?? 0) - data.amount
          : (sourceAccount.amount ?? 0) + data.amount;
        await tx
          .update(accounts)
          .set({ amount: newBalance, updatedAt: sql`CURRENT_TIMESTAMP` })
          .where(eq(accounts.id, sourceAccount.id));
      } else if (data.type === "Expense") {
        const newBalance = isCard
          ? (sourceAccount.amount ?? 0) + data.amount
          : (sourceAccount.amount ?? 0) - data.amount;
        await tx
          .update(accounts)
          .set({ amount: newBalance, updatedAt: sql`CURRENT_TIMESTAMP` })
          .where(eq(accounts.id, sourceAccount.id));
      } else if (data.type === "Transfer") {
        const isDestCard = destinationAccount ? isCreditCard(destinationAccount.type, destinationAccount.tag) : false;
        const newSourceBalance = isCard
          ? (sourceAccount.amount ?? 0) + data.amount
          : (sourceAccount.amount ?? 0) - data.amount;
        const newDestBalance = isDestCard
          ? (destinationAccount.amount ?? 0) - data.amount
          : (destinationAccount.amount ?? 0) + data.amount;

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
      const cat = await categoryService.getCategoryById(targetCategoryID, userID);
      if (cat.status === "Inactive") {
        throw new AppError("La categoría seleccionada se encuentra inactiva", 400, "INACTIVE_CATEGORY");
      }
    }
    if (targetEntityID) {
      const ent = await entityService.getEntityById(targetEntityID, userID);
      if (ent.status === "Inactive") {
        throw new AppError("La entidad seleccionada se encuentra inactiva", 400, "INACTIVE_ENTITY");
      }
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

      const isOldCreditCard = isCreditCard(currentOldSource.type, currentOldSource.tag);

      if (oldTx.type === "Income") {
        // En TC un ingreso reduce la deuda; al revertir, se suma de nuevo la deuda
        const revertedBalance = isOldCreditCard
          ? (currentOldSource.amount ?? 0) + oldTx.amount
          : (currentOldSource.amount ?? 0) - oldTx.amount;

        await tx
          .update(accounts)
          .set({
            amount: revertedBalance,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(eq(accounts.id, oldTx.accountID));
      } else if (oldTx.type === "Expense") {
        // En TC un gasto aumenta la deuda; al revertir, se resta la deuda
        const revertedBalance = isOldCreditCard
          ? (currentOldSource.amount ?? 0) - oldTx.amount
          : (currentOldSource.amount ?? 0) + oldTx.amount;

        await tx
          .update(accounts)
          .set({
            amount: revertedBalance,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(eq(accounts.id, oldTx.accountID));
      } else if (oldTx.type === "Transfer" && oldTx.toAccountID) {
        const currentOldDest = await tx
          .select()
          .from(accounts)
          .where(eq(accounts.id, oldTx.toAccountID))
          .get();

        const isDestCreditCard = currentOldDest
          ? isCreditCard(currentOldDest.type, currentOldDest.tag)
          : false;

        const revertedSource = isOldCreditCard
          ? (currentOldSource.amount ?? 0) - oldTx.amount
          : (currentOldSource.amount ?? 0) + oldTx.amount;

        await tx
          .update(accounts)
          .set({
            amount: revertedSource,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(eq(accounts.id, oldTx.accountID));

        if (currentOldDest) {
          const revertedDest = isDestCreditCard
            ? (currentOldDest.amount ?? 0) + oldTx.amount
            : (currentOldDest.amount ?? 0) - oldTx.amount;

          await tx
            .update(accounts)
            .set({
              amount: revertedDest,
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

      if (newSourceAccount.status === "Inactive") {
        throw new AppError("No se pueden asociar transacciones a una cuenta inactiva", 400, "INACTIVE_ACCOUNT");
      }

      const isNewCreditCard = isCreditCard(newSourceAccount.type, newSourceAccount.tag);

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

        if (newDestAccount.status === "Inactive") {
          throw new AppError("La cuenta destino seleccionada se encuentra inactiva", 400, "INACTIVE_ACCOUNT");
        }
      }

      if (targetType === "Expense" || targetType === "Transfer") {
        const currentBal = newSourceAccount.amount ?? 0;
        if (!isNewCreditCard && targetAmount > currentBal) {
          throw new AppError(
            "Saldo insuficiente en la cuenta origen",
            400,
            "INSUFFICIENT_FUNDS"
          );
        }
      }

      const updateInstallmentsCount = data.installments ?? 1;

      if (updateInstallmentsCount > 1) {
        if (!isNewCreditCard) {
          throw new AppError(
            "Solo se pueden registrar cuotas con tarjetas de crédito",
            400,
            "CREDIT_CARD_REQUIRED"
          );
        }
        if (targetType !== "Expense") {
          throw new AppError(
            "Las cuotas solo aplican para transacciones de tipo Egreso",
            400,
            "EXPENSE_REQUIRED_FOR_INSTALLMENTS"
          );
        }

        const installmentAmount = Math.floor(targetAmount / updateInstallmentsCount);
        const remainder = targetAmount - installmentAmount * updateInstallmentsCount;
        const baseDescription = (targetDescription || "").replace(/\s*\(Cuota \d+\/\d+\)\s*$/i, "").trim();

        // Actualizar la transacción actual como Cuota 1
        await tx
          .update(transactions)
          .set({
            type: targetType,
            amount: installmentAmount + remainder,
            accountID: targetAccountID,
            toAccountID: null,
            categoryID: targetCategoryID,
            entityID: targetEntityID,
            date: targetDate,
            description: `${baseDescription} (Cuota 1/${updateInstallmentsCount})`,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(and(eq(transactions.id, id), eq(transactions.userID, userID)));

        // Generar e insertar las cuotas restantes
        const extraInstallments: NewTransaction[] = [];
        for (let i = 2; i <= updateInstallmentsCount; i++) {
          extraInstallments.push({
            id: crypto.randomUUID(),
            userID,
            type: targetType,
            amount: installmentAmount,
            accountID: targetAccountID,
            toAccountID: null,
            categoryID: targetCategoryID,
            entityID: targetEntityID,
            date: addMonthsToDate(targetDate, i - 1),
            description: `${baseDescription} (Cuota ${i}/${updateInstallmentsCount})`,
          });
        }
        if (extraInstallments.length > 0) {
          await tx.insert(transactions).values(extraInstallments);
        }

        // Actualizar deuda de la tarjeta con el monto total
        const newBalance = (newSourceAccount.amount ?? 0) + targetAmount;
        await tx
          .update(accounts)
          .set({ amount: newBalance, updatedAt: sql`CURRENT_TIMESTAMP` })
          .where(eq(accounts.id, newSourceAccount.id));
      } else {
        // Actualización normal (1 cuota)
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
          .where(and(eq(transactions.id, id), eq(transactions.userID, userID)));

        if (targetType === "Income") {
          const newBalance = isNewCreditCard
            ? (newSourceAccount.amount ?? 0) - targetAmount
            : (newSourceAccount.amount ?? 0) + targetAmount;

          await tx
            .update(accounts)
            .set({ amount: newBalance, updatedAt: sql`CURRENT_TIMESTAMP` })
            .where(eq(accounts.id, newSourceAccount.id));
        } else if (targetType === "Expense") {
          const newBalance = isNewCreditCard
            ? (newSourceAccount.amount ?? 0) + targetAmount
            : (newSourceAccount.amount ?? 0) - targetAmount;

          await tx
            .update(accounts)
            .set({ amount: newBalance, updatedAt: sql`CURRENT_TIMESTAMP` })
            .where(eq(accounts.id, newSourceAccount.id));
        } else if (targetType === "Transfer" && newDestAccount) {
          const isDestCreditCard = isCreditCard(newDestAccount.type, newDestAccount.tag);
          const newSourceBalance = isNewCreditCard
            ? (newSourceAccount.amount ?? 0) + targetAmount
            : (newSourceAccount.amount ?? 0) - targetAmount;
          const newDestBalance = isDestCreditCard
            ? (newDestAccount.amount ?? 0) - targetAmount
            : (newDestAccount.amount ?? 0) + targetAmount;

          await tx
            .update(accounts)
            .set({ amount: newSourceBalance, updatedAt: sql`CURRENT_TIMESTAMP` })
            .where(eq(accounts.id, newSourceAccount.id));

          await tx
            .update(accounts)
            .set({ amount: newDestBalance, updatedAt: sql`CURRENT_TIMESTAMP` })
            .where(eq(accounts.id, newDestAccount.id));
        }
      }

      // Si la transacción está vinculada a un movimiento de deuda, sincronizar el movimiento y recalcular el estado de la deuda
      const linkedMovements = await tx
        .select()
        .from(debtMovements)
        .where(eq(debtMovements.transactionID, id))
        .all();

      for (const linked of linkedMovements) {
        await tx
          .update(debtMovements)
          .set({
            amount: targetAmount,
            date: targetDate,
          })
          .where(eq(debtMovements.id, linked.id));

        const debt = await tx
          .select()
          .from(debts)
          .where(eq(debts.id, linked.debtID))
          .get();

        if (debt) {
          const allMovements = await tx
            .select()
            .from(debtMovements)
            .where(eq(debtMovements.debtID, debt.id))
            .all();

          const totalCharges = allMovements
            .filter((m) => m.type === "CHARGE")
            .reduce((sum, m) => sum + m.amount, 0);

          const totalPayments = allMovements
            .filter((m) => m.type === "PAYMENT")
            .reduce((sum, m) => sum + m.amount, 0);

          const currentBalance = (debt.initialAmount ?? 0) + totalCharges - totalPayments;
          const newStatus: "Pending" | "Settled" = currentBalance <= 0 ? "Settled" : "Pending";

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
        const isSourceCreditCard = isCreditCard(sourceAccount.type, sourceAccount.tag);

        if (txToDelete.type === "Income") {
          const restoredBalance = isSourceCreditCard
            ? (sourceAccount.amount ?? 0) + txToDelete.amount
            : (sourceAccount.amount ?? 0) - txToDelete.amount;

          await tx
            .update(accounts)
            .set({
              amount: restoredBalance,
              updatedAt: sql`CURRENT_TIMESTAMP`,
            })
            .where(eq(accounts.id, sourceAccount.id));
        } else if (txToDelete.type === "Expense") {
          const restoredBalance = isSourceCreditCard
            ? (sourceAccount.amount ?? 0) - txToDelete.amount
            : (sourceAccount.amount ?? 0) + txToDelete.amount;

          await tx
            .update(accounts)
            .set({
              amount: restoredBalance,
              updatedAt: sql`CURRENT_TIMESTAMP`,
            })
            .where(eq(accounts.id, sourceAccount.id));
        } else if (txToDelete.type === "Transfer" && txToDelete.toAccountID) {
          const destAccount = await tx
            .select()
            .from(accounts)
            .where(eq(accounts.id, txToDelete.toAccountID))
            .get();

          const isDestCreditCard = destAccount
            ? isCreditCard(destAccount.type, destAccount.tag)
            : false;

          const restoredSource = isSourceCreditCard
            ? (sourceAccount.amount ?? 0) - txToDelete.amount
            : (sourceAccount.amount ?? 0) + txToDelete.amount;

          await tx
            .update(accounts)
            .set({
              amount: restoredSource,
              updatedAt: sql`CURRENT_TIMESTAMP`,
            })
            .where(eq(accounts.id, sourceAccount.id));

          if (destAccount) {
            const restoredDest = isDestCreditCard
              ? (destAccount.amount ?? 0) + txToDelete.amount
              : (destAccount.amount ?? 0) - txToDelete.amount;

            await tx
              .update(accounts)
              .set({
                amount: restoredDest,
                updatedAt: sql`CURRENT_TIMESTAMP`,
              })
              .where(eq(accounts.id, destAccount.id));
          }
        }
      }

      // Revertir y eliminar movimiento de deuda vinculado si existía
      const linkedMovements = await tx
        .select()
        .from(debtMovements)
        .where(eq(debtMovements.transactionID, id))
        .all();

      for (const linked of linkedMovements) {
        await tx
          .delete(debtMovements)
          .where(eq(debtMovements.id, linked.id));

        const debt = await tx
          .select()
          .from(debts)
          .where(eq(debts.id, linked.debtID))
          .get();

        if (debt) {
          const allMovements = await tx
            .select()
            .from(debtMovements)
            .where(eq(debtMovements.debtID, debt.id))
            .all();

          const totalCharges = allMovements
            .filter((m) => m.type === "CHARGE")
            .reduce((sum, m) => sum + m.amount, 0);

          const totalPayments = allMovements
            .filter((m) => m.type === "PAYMENT")
            .reduce((sum, m) => sum + m.amount, 0);

          const currentBalance = (debt.initialAmount ?? 0) + totalCharges - totalPayments;
          const newStatus: "Pending" | "Settled" = currentBalance <= 0 ? "Settled" : "Pending";

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
