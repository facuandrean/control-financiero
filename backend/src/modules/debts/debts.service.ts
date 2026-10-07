import { db } from "../../core/db/db";
import { debts, debtMovements } from "./debts.schema";
import { entities } from "../entities/entities.schema";
import { accounts } from "../accounts/accounts.schema";
import { transactions } from "../transactions/transactions.schema";
import { AppError } from "../../core/utils/AppError";
import {
  Debt,
  DebtMovement,
  CreateDebtDTO,
  UpdateDebtDTO,
  CreateMovementDTO,
  DebtWithDetails,
  DebtDetailResponse,
} from "./debts.types";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import crypto from "crypto";
import { entityService } from "../entities/entities.service";
import { accountService } from "../accounts/accounts.service";

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

export const debtService = {
  createDebt: async (data: CreateDebtDTO & { userID: string }): Promise<Debt> => {
    // 1. Verificar que la entidad pertenezca al usuario y esté activa
    const entity = await entityService.getEntityById(data.entityID, data.userID);
    if (entity.status === "Inactive") {
      throw new AppError("No se puede registrar una deuda con una entidad inactiva", 400, "INACTIVE_ENTITY");
    }

    // 2. Verificar si ya existe una deuda Pending para esa entityID y type
    const existingDebt = await db
      .select()
      .from(debts)
      .where(
        and(
          eq(debts.userID, data.userID),
          eq(debts.entityID, data.entityID),
          eq(debts.type, data.type),
          eq(debts.status, "Pending")
        )
      )
      .get();

    if (existingDebt) {
      throw new AppError(
        "Ya existe una cuenta pendiente con esta persona para este tipo de deuda",
        400,
        "DEBT_ALREADY_EXISTS"
      );
    }

    const initialAmount = data.initialAmount ?? 0;
    const initialStatus = initialAmount <= 0 ? "Pending" : "Pending";

    const [newDebt] = await db
      .insert(debts)
      .values({
        id: crypto.randomUUID(),
        userID: data.userID,
        entityID: data.entityID,
        type: data.type,
        initialAmount: initialAmount,
        status: initialStatus,
        createdAt: sql`datetime('now', '-3 hours')`,
        updatedAt: sql`datetime('now', '-3 hours')`,
      })
      .returning();

    if (!newDebt) {
      throw new AppError("No se pudo crear la deuda", 500, "DEBT_CREATION_FAILED");
    }

    return newDebt;
  },

  getDebts: async (userID: string): Promise<DebtWithDetails[]> => {
    const rows = await db
      .select({
        debt: debts,
        entity: entities,
      })
      .from(debts)
      .leftJoin(entities, eq(debts.entityID, entities.id))
      .where(eq(debts.userID, userID))
      .all();

    const userDebtIds = rows.map((r) => r.debt.id);
    const movementsMap: Record<string, DebtMovement[]> = {};

    if (userDebtIds.length > 0) {
      const allMovements = await db
        .select()
        .from(debtMovements)
        .where(inArray(debtMovements.debtID, userDebtIds))
        .orderBy(asc(debtMovements.date), asc(debtMovements.createdAt))
        .all();

      for (const m of allMovements) {
        if (!movementsMap[m.debtID]) movementsMap[m.debtID] = [];
        movementsMap[m.debtID].push(m);
      }
    }

    return rows.map((r) => {
      const mvts = movementsMap[r.debt.id] || [];
      const totalCharges = mvts
        .filter((m) => m.type === "CHARGE")
        .reduce((sum, m) => sum + m.amount, 0);

      const totalPayments = mvts
        .filter((m) => m.type === "PAYMENT")
        .reduce((sum, m) => sum + m.amount, 0);

      const initialAmount = r.debt.initialAmount ?? 0;
      const balance = initialAmount + totalCharges - totalPayments;
      const calculatedStatus: "Pending" | "Settled" = balance <= 0 ? "Settled" : "Pending";

      return {
        ...r.debt,
        status: calculatedStatus,
        entity: r.entity?.id ? r.entity : null,
        balance,
        totalCharges,
        totalPayments,
        remainingAmount: Math.max(0, balance),
        totalAmount: initialAmount + totalCharges,
        totalPaid: totalPayments,
        paidAmount: totalPayments,
        movements: mvts,
        payments: mvts.filter((m) => m.type === "PAYMENT"),
      };
    });
  },

  getDebtById: async (id: string, userID: string): Promise<DebtDetailResponse> => {
    const debt = await db
      .select()
      .from(debts)
      .where(and(eq(debts.id, id), eq(debts.userID, userID)))
      .get();

    if (!debt) {
      throw new AppError("Deuda no encontrada", 404, "DEBT_NOT_FOUND");
    }

    const entity = debt.entityID
      ? (await db
          .select()
          .from(entities)
          .where(eq(entities.id, debt.entityID))
          .get()) || null
      : null;

    const movements = await db
      .select()
      .from(debtMovements)
      .where(eq(debtMovements.debtID, id))
      .orderBy(asc(debtMovements.date), asc(debtMovements.createdAt))
      .all();

    const totalCharges = movements
      .filter((m) => m.type === "CHARGE")
      .reduce((sum, m) => sum + m.amount, 0);

    const totalPayments = movements
      .filter((m) => m.type === "PAYMENT")
      .reduce((sum, m) => sum + m.amount, 0);

    const initialAmount = debt.initialAmount ?? 0;
    const balance = initialAmount + totalCharges - totalPayments;
    const calculatedStatus: "Pending" | "Settled" = balance <= 0 ? "Settled" : "Pending";

    return {
      ...debt,
      status: calculatedStatus,
      entity,
      balance,
      totalCharges,
      totalPayments,
      remainingAmount: Math.max(0, balance),
      totalAmount: initialAmount + totalCharges,
      totalPaid: totalPayments,
      paidAmount: totalPayments,
      movements,
      payments: movements.filter((m) => m.type === "PAYMENT"),
    };
  },

  updateDebt: async (
    id: string,
    userID: string,
    data: UpdateDebtDTO
  ): Promise<Debt> => {
    const currentDebt = await db
      .select()
      .from(debts)
      .where(and(eq(debts.id, id), eq(debts.userID, userID)))
      .get();

    if (!currentDebt) {
      throw new AppError("Deuda no encontrada", 404, "DEBT_NOT_FOUND");
    }

    const effectiveInitialAmount =
      data.initialAmount !== undefined ? data.initialAmount : (currentDebt.initialAmount ?? 0);

    const movements = await db
      .select()
      .from(debtMovements)
      .where(eq(debtMovements.debtID, id))
      .all();

    const totalCharges = movements
      .filter((m) => m.type === "CHARGE")
      .reduce((sum, m) => sum + m.amount, 0);

    const totalPayments = movements
      .filter((m) => m.type === "PAYMENT")
      .reduce((sum, m) => sum + m.amount, 0);

    const balance = effectiveInitialAmount + totalCharges - totalPayments;
    const calculatedStatus: "Pending" | "Settled" = balance <= 0 ? "Settled" : "Pending";
    const statusToSet = data.initialAmount !== undefined ? calculatedStatus : (data.status ?? calculatedStatus);

    const [updatedDebt] = await db
      .update(debts)
      .set({
        ...data,
        status: statusToSet,
        updatedAt: sql`datetime('now', '-3 hours')`,
      })
      .where(and(eq(debts.id, id), eq(debts.userID, userID)))
      .returning();

    return updatedDebt;
  },

  addMovement: async (
    debtID: string,
    userID: string,
    data: CreateMovementDTO
  ): Promise<{
    movement: DebtMovement;
    debtStatus: "Pending" | "Settled";
    balance: number;
    totalCharges: number;
    totalPayments: number;
  }> => {
    const debt = await db
      .select()
      .from(debts)
      .where(and(eq(debts.id, debtID), eq(debts.userID, userID)))
      .get();

    if (!debt) {
      throw new AppError("Deuda no encontrada", 404, "DEBT_NOT_FOUND");
    }

    let transactionID: string | null = null;
    let transactionType: "Income" | "Expense" | null = null;

    return await db.transaction(async (tx) => {
      // 1. Si se provee accountID, aplicar validaciones de saldo estricto y crear transacción
      if (data.accountID) {
        const account = await tx
          .select()
          .from(accounts)
          .where(and(eq(accounts.id, data.accountID), eq(accounts.userID, userID)))
          .get();

        if (!account) {
          throw new AppError("Cuenta bancaria no encontrada", 404, "ACCOUNT_NOT_FOUND");
        }

        if (account.status === "Inactive") {
          throw new AppError("No se pueden registrar movimientos con una cuenta inactiva", 400, "INACTIVE_ACCOUNT");
        }

        // Determinar tipo de transacción según tipo de deuda y movimiento:
        // - Payable (Debo dinero):
        //     PAYMENT -> Pago a la persona -> Sale dinero de mi cuenta -> Expense
        //     CHARGE  -> Me prestaron más plata -> Entra dinero a mi cuenta -> Income
        // - Receivable (Me deben dinero):
        //     PAYMENT -> La persona me paga -> Entra dinero a mi cuenta -> Income
        //     CHARGE  -> Le presto más plata -> Sale dinero de mi cuenta -> Expense
        if (debt.type === "Payable") {
          transactionType = data.type === "PAYMENT" ? "Expense" : "Income";
        } else {
          transactionType = data.type === "PAYMENT" ? "Income" : "Expense";
        }

        // Si es Egreso (Expense), verificar saldo disponible en la cuenta (a menos que sea tarjeta de crédito)
        if (transactionType === "Expense") {
          const currentBalance = account.amount ?? 0;
          if (!isCreditCard(account.type, account.tag) && data.amount > currentBalance) {
            throw new AppError("Saldo insuficiente en la cuenta seleccionada", 400, "INSUFFICIENT_FUNDS");
          }
        }

        transactionID = crypto.randomUUID();
        const txDescription = `${data.type === "PAYMENT" ? "Pago de deuda" : "Cargo de deuda"}: ${data.description}`;

        // Insertar en Transactions
        await tx.insert(transactions).values({
          id: transactionID,
          userID: userID,
          type: transactionType,
          amount: data.amount,
          accountID: data.accountID,
          toAccountID: null,
          categoryID: null,
          entityID: debt.entityID,
          date: data.date,
          description: txDescription,
          createdAt: sql`datetime('now', '-3 hours')`,
          updatedAt: sql`datetime('now', '-3 hours')`,
        });

        // Actualizar saldo de la cuenta
        const isCard = isCreditCard(account.type, account.tag);
        const newBalance = isCard
          ? transactionType === "Expense"
            ? (account.amount ?? 0) + data.amount
            : (account.amount ?? 0) - data.amount
          : transactionType === "Expense"
            ? (account.amount ?? 0) - data.amount
            : (account.amount ?? 0) + data.amount;

        await tx
          .update(accounts)
          .set({ amount: newBalance, updatedAt: sql`datetime('now', '-3 hours')` })
          .where(eq(accounts.id, account.id));
      }

      // 2. Inserta el registro en DebtMovements
      const movementID = crypto.randomUUID();
      const [insertedMovement] = await tx
        .insert(debtMovements)
        .values({
          id: movementID,
          debtID: debt.id,
          type: data.type,
          amount: data.amount,
          description: data.description,
          date: data.date,
          transactionID: transactionID || null,
          createdAt: sql`datetime('now', '-3 hours')`,
        })
        .returning();

      // 3. Recalcular el balance total de la deuda: initialAmount + SUM(cargos) - SUM(pagos)
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
          updatedAt: sql`datetime('now', '-3 hours')`,
        })
        .where(eq(debts.id, debt.id));

      return {
        movement: insertedMovement,
        debtStatus: newStatus,
        balance: currentBalance,
        totalCharges,
        totalPayments,
      };
    });
  },

  deleteMovement: async (
    movementID: string,
    userID: string
  ): Promise<{
    deletedMovementId: string;
    debtId: string;
    debtStatus: "Pending" | "Settled";
    balance: number;
  }> => {
    return await db.transaction(async (tx) => {
      const row = await tx
        .select({
          movement: debtMovements,
          debt: debts,
        })
        .from(debtMovements)
        .innerJoin(debts, eq(debtMovements.debtID, debts.id))
        .where(and(eq(debtMovements.id, movementID), eq(debts.userID, userID)))
        .get();

      if (!row) {
        throw new AppError("Movimiento no encontrado", 404, "MOVEMENT_NOT_FOUND");
      }

      const { movement, debt } = row;

      // 1. Si el movimiento tiene un transactionID, eliminar esa transacción y restaurar saldo en Accounts
      if (movement.transactionID) {
        const txRecord = await tx
          .select()
          .from(transactions)
          .where(eq(transactions.id, movement.transactionID))
          .get();

        if (txRecord) {
          const acc = await tx
            .select()
            .from(accounts)
            .where(eq(accounts.id, txRecord.accountID))
            .get();

          if (acc) {
            const isCard = isCreditCard(acc.type, acc.tag);
            const restoredBalance = isCard
              ? txRecord.type === "Expense"
                ? (acc.amount ?? 0) - txRecord.amount
                : (acc.amount ?? 0) + txRecord.amount
              : txRecord.type === "Expense"
                ? (acc.amount ?? 0) + txRecord.amount
                : (acc.amount ?? 0) - txRecord.amount;

            await tx
              .update(accounts)
              .set({ amount: restoredBalance, updatedAt: sql`datetime('now', '-3 hours')` })
              .where(eq(accounts.id, acc.id));
          }

          await tx
            .delete(transactions)
            .where(eq(transactions.id, txRecord.id));
        }
      }

      // 2. Elimina el registro de DebtMovements
      await tx.delete(debtMovements).where(eq(debtMovements.id, movement.id));

      // 3. Recalcular el balance total de la Deuda para actualizar su status
      const remainingMovements = await tx
        .select()
        .from(debtMovements)
        .where(eq(debtMovements.debtID, debt.id))
        .all();

      const totalCharges = remainingMovements
        .filter((m) => m.type === "CHARGE")
        .reduce((sum, m) => sum + m.amount, 0);

      const totalPayments = remainingMovements
        .filter((m) => m.type === "PAYMENT")
        .reduce((sum, m) => sum + m.amount, 0);

      const currentBalance = (debt.initialAmount ?? 0) + totalCharges - totalPayments;
      const newStatus: "Pending" | "Settled" = currentBalance <= 0 ? "Settled" : "Pending";

      await tx
        .update(debts)
        .set({
          status: newStatus,
          updatedAt: sql`datetime('now', '-3 hours')`,
        })
        .where(eq(debts.id, debt.id));

      return {
        deletedMovementId: movement.id,
        debtId: debt.id,
        debtStatus: newStatus,
        balance: currentBalance,
      };
    });
  },

  deleteDebt: async (id: string, userID: string): Promise<void> => {
    const currentDebt = await db
      .select()
      .from(debts)
      .where(and(eq(debts.id, id), eq(debts.userID, userID)))
      .get();

    if (!currentDebt) {
      throw new AppError("Deuda no encontrada", 404, "DEBT_NOT_FOUND");
    }

    await db.transaction(async (tx) => {
      // 1. Obtener todos los movimientos asociados
      const movements = await tx
        .select()
        .from(debtMovements)
        .where(eq(debtMovements.debtID, id))
        .all();

      // 2. Para cada movimiento, revertir transacción y cuenta vinculada
      for (const m of movements) {
        if (m.transactionID) {
          const txRecord = await tx
            .select()
            .from(transactions)
            .where(eq(transactions.id, m.transactionID))
            .get();

          if (txRecord) {
            const acc = await tx
              .select()
              .from(accounts)
              .where(eq(accounts.id, txRecord.accountID))
              .get();

            if (acc) {
              const isCard = isCreditCard(acc.type, acc.tag);
              const restoredBalance = isCard
                ? txRecord.type === "Expense"
                  ? (acc.amount ?? 0) - txRecord.amount
                  : (acc.amount ?? 0) + txRecord.amount
                : txRecord.type === "Expense"
                  ? (acc.amount ?? 0) + txRecord.amount
                  : (acc.amount ?? 0) - txRecord.amount;

              await tx
                .update(accounts)
                .set({ amount: restoredBalance, updatedAt: sql`datetime('now', '-3 hours')` })
                .where(eq(accounts.id, acc.id));
            }

            await tx
              .delete(transactions)
              .where(eq(transactions.id, txRecord.id));
          }
        }
      }

      // 3. Eliminar los movimientos
      await tx.delete(debtMovements).where(eq(debtMovements.debtID, id));

      // 4. Eliminar la deuda
      await tx.delete(debts).where(and(eq(debts.id, id), eq(debts.userID, userID)));
    });
  },
};
