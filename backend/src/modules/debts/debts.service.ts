import { db } from "../../core/db/db";
import { debts, debtPayments } from "./debts.schema";
import { entities } from "../entities/entities.schema";
import { AppError } from "../../core/utils/AppError";
import {
  Debt,
  DebtPayment,
  CreateDebtDTO,
  UpdateDebtDTO,
  CreateDebtPaymentDTO,
  DebtWithDetails,
  DebtDetailResponse,
} from "./debts.types";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import crypto from "crypto";
import { entityService } from "../entities/entities.service";
import { accounts } from "../accounts/accounts.schema";
import { accountService } from "../accounts/accounts.service";
import { transactions } from "../transactions/transactions.schema";

export const debtService = {
  createDebt: async (data: CreateDebtDTO & { userID: string }): Promise<Debt> => {
    // Verificar que la entidad pertenezca al usuario y esté activa
    const entity = await entityService.getEntityById(data.entityID, data.userID);
    if (entity.status === "Inactive") {
      throw new AppError("No se puede registrar una deuda con una entidad inactiva", 400, "INACTIVE_ENTITY");
    }

    const newDebt = await db
      .insert(debts)
      .values({
        id: crypto.randomUUID(),
        userID: data.userID,
        entityID: data.entityID,
        type: data.type,
        description: data.description,
        totalAmount: data.totalAmount,
        status: "Pending",
        dueDate: data.dueDate || null,
        createdAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .returning()
      .get();

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
        totalPaid: sql<number>`COALESCE(SUM(${debtPayments.amount}), 0)`,
      })
      .from(debts)
      .leftJoin(entities, eq(debts.entityID, entities.id))
      .leftJoin(debtPayments, eq(debts.id, debtPayments.debtID))
      .where(eq(debts.userID, userID))
      .groupBy(debts.id)
      .all();

    const userDebtIds = rows.map((r) => r.debt.id);
    const paymentsMap: Record<string, DebtPayment[]> = {};
    if (userDebtIds.length > 0) {
      const allPayments = await db
        .select()
        .from(debtPayments)
        .where(inArray(debtPayments.debtID, userDebtIds))
        .orderBy(desc(debtPayments.date))
        .all();
      for (const p of allPayments) {
        if (!paymentsMap[p.debtID]) paymentsMap[p.debtID] = [];
        paymentsMap[p.debtID].push(p);
      }
    }

    return rows.map((r) => {
      const paid = Number(r.totalPaid) || 0;
      return {
        ...r.debt,
        entity: r.entity?.id ? r.entity : null,
        totalPaid: paid,
        remainingAmount: Math.max(0, r.debt.totalAmount - paid),
        payments: paymentsMap[r.debt.id] || [],
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

    const payments = await db
      .select()
      .from(debtPayments)
      .where(eq(debtPayments.debtID, id))
      .all();

    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);

    return {
      ...debt,
      entity,
      totalPaid,
      remainingAmount: Math.max(0, debt.totalAmount - totalPaid),
      payments,
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

    if (data.entityID && data.entityID !== currentDebt.entityID) {
      const entity = await entityService.getEntityById(data.entityID, userID);
      if (entity.status === "Inactive") {
        throw new AppError("No se puede vincular una entidad inactiva", 400, "INACTIVE_ENTITY");
      }
    }

    const targetTotalAmount = data.totalAmount ?? currentDebt.totalAmount;

    // Recalcular status basado en pagos actuales y el nuevo totalAmount
    const paymentsSum = await db
      .select({
        total: sql<number>`COALESCE(SUM(${debtPayments.amount}), 0)`,
      })
      .from(debtPayments)
      .where(eq(debtPayments.debtID, id))
      .get();

    const totalPaid = Number(paymentsSum?.total) || 0;

    if (data.totalAmount !== undefined && data.totalAmount < totalPaid) {
      throw new AppError(
        `El monto total ($${data.totalAmount}) no puede ser menor a lo ya pagado ($${totalPaid})`,
        400,
        "INVALID_TOTAL_AMOUNT"
      );
    }

    let calculatedStatus: "Pending" | "Partial" | "Settled" = "Pending";
    if (totalPaid >= targetTotalAmount) {
      calculatedStatus = "Settled";
    } else if (totalPaid > 0) {
      calculatedStatus = "Partial";
    } else {
      calculatedStatus = "Pending";
    }

    const updatedDebt = await db
      .update(debts)
      .set({
        ...data,
        status: calculatedStatus,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(and(eq(debts.id, id), eq(debts.userID, userID)))
      .returning()
      .get();

    if (!updatedDebt) {
      throw new AppError("No se pudo actualizar la deuda", 500, "DEBT_UPDATE_FAILED");
    }

    return updatedDebt;
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
      // 1. Obtener todos los pagos asociados a la deuda
      const payments = await tx
        .select()
        .from(debtPayments)
        .where(eq(debtPayments.debtID, id))
        .all();

      // 2. Para cada pago, si tiene transacción vinculada, restaurar saldo de cuenta y borrar transacción
      for (const payment of payments) {
        if (payment.transactionID) {
          const txRecord = await tx
            .select()
            .from(transactions)
            .where(eq(transactions.id, payment.transactionID))
            .get();

          if (txRecord) {
            const acc = await tx
              .select()
              .from(accounts)
              .where(eq(accounts.id, txRecord.accountID))
              .get();

            if (acc) {
              const restoredBalance =
                txRecord.type === "Expense"
                  ? (acc.amount ?? 0) + txRecord.amount
                  : (acc.amount ?? 0) - txRecord.amount;

              await tx
                .update(accounts)
                .set({ amount: restoredBalance, updatedAt: sql`CURRENT_TIMESTAMP` })
                .where(eq(accounts.id, acc.id));
            }

            await tx
              .delete(transactions)
              .where(eq(transactions.id, txRecord.id));
          }
        }
      }

      // 3. Eliminar los pagos de la deuda
      await tx.delete(debtPayments).where(eq(debtPayments.debtID, id));

      // 4. Eliminar la deuda
      await tx.delete(debts).where(and(eq(debts.id, id), eq(debts.userID, userID)));
    });
  },

  addPayment: async (
    debtID: string,
    userID: string,
    data: CreateDebtPaymentDTO
  ): Promise<{
    payment: DebtPayment;
    debtStatus: "Pending" | "Partial" | "Settled";
    totalPaid: number;
    remainingAmount: number;
  }> => {
    const debt = await db
      .select()
      .from(debts)
      .where(and(eq(debts.id, debtID), eq(debts.userID, userID)))
      .get();

    if (!debt) {
      throw new AppError("Deuda no encontrada", 404, "DEBT_NOT_FOUND");
    }

    if (debt.status === "Settled") {
      throw new AppError("Esta deuda ya se encuentra saldada", 400, "DEBT_ALREADY_SETTLED");
    }

    // Calcular pagos actuales
    const currentPaymentsSum = await db
      .select({
        total: sql<number>`COALESCE(SUM(${debtPayments.amount}), 0)`,
      })
      .from(debtPayments)
      .where(eq(debtPayments.debtID, debt.id))
      .get();

    const currentTotalPaid = Number(currentPaymentsSum?.total) || 0;
    const remaining = Math.max(0, debt.totalAmount - currentTotalPaid);

    if (data.amount > remaining) {
      throw new AppError(
        `El monto a pagar ($${data.amount}) no puede superar el saldo pendiente ($${remaining})`,
        400,
        "OVERPAYMENT_NOT_ALLOWED"
      );
    }

    // 1. Obtener la cuenta y validar que esté activa
    const account = await accountService.getAccountById(data.accountID, userID);
    if (account.status === "Inactive") {
      throw new AppError("No se pueden registrar pagos con una cuenta inactiva", 400, "INACTIVE_ACCOUNT");
    }

    const isCreditCard = (type: string) => {
      const lower = type.toLowerCase();
      return lower.includes("crédito") || lower.includes("credito");
    };

    if (debt.type === "Payable") {
      const currentBalance = account.amount ?? 0;
      if (!isCreditCard(account.type) && data.amount > currentBalance) {
        throw new AppError("Saldo insuficiente", 400, "INSUFFICIENT_FUNDS");
      }
    }

    const paymentID = crypto.randomUUID();
    const transactionID = crypto.randomUUID();
    const transactionType = debt.type === "Payable" ? "Expense" : "Income";
    const paymentDate = data.date || new Date().toISOString().split("T")[0];

    let resultPayment: DebtPayment;
    let newStatus: "Pending" | "Partial" | "Settled" = "Pending";
    let finalTotalPaid = 0;

    await db.transaction(async (tx) => {
      // 1. Crear el registro en la tabla Transactions primero para satisfacer la FK
      await tx.insert(transactions).values({
        id: transactionID,
        userID: userID,
        type: transactionType,
        amount: data.amount,
        accountID: data.accountID,
        toAccountID: null,
        categoryID: null,
        entityID: debt.entityID,
        date: paymentDate,
        description: `Pago de deuda: ${debt.description}`,
        createdAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      });

      // 2. Insertar el pago en DebtPayments vinculando transactionID existente
      const [insertedPayment] = await tx
        .insert(debtPayments)
        .values({
          id: paymentID,
          debtID: debt.id,
          amount: data.amount,
          date: paymentDate,
          notes: data.notes || null,
          transactionID: transactionID,
          createdAt: sql`CURRENT_TIMESTAMP`,
        })
        .returning();

      resultPayment = insertedPayment;

      // 4. Actualizar el saldo en la tabla Accounts
      const currentAccount = await tx
        .select()
        .from(accounts)
        .where(eq(accounts.id, data.accountID))
        .get();

      if (currentAccount) {
        const newBalance =
          transactionType === "Expense"
            ? (currentAccount.amount ?? 0) - data.amount
            : (currentAccount.amount ?? 0) + data.amount;

        await tx
          .update(accounts)
          .set({ amount: newBalance, updatedAt: sql`CURRENT_TIMESTAMP` })
          .where(eq(accounts.id, currentAccount.id));
      }

      // 5. Recalcular pagos acumulados para la deuda y actualizar status
      const paymentsSum = await tx
        .select({
          total: sql<number>`COALESCE(SUM(${debtPayments.amount}), 0)`,
        })
        .from(debtPayments)
        .where(eq(debtPayments.debtID, debt.id))
        .get();

      finalTotalPaid = Number(paymentsSum?.total) || 0;

      if (finalTotalPaid >= debt.totalAmount) {
        newStatus = "Settled";
      } else if (finalTotalPaid > 0) {
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
    });

    return {
      payment: resultPayment!,
      debtStatus: newStatus,
      totalPaid: finalTotalPaid,
      remainingAmount: Math.max(0, debt.totalAmount - finalTotalPaid),
    };
  },

  deletePayment: async (
    paymentID: string,
    userID: string
  ): Promise<{
    deletedPaymentId: string;
    debtId: string;
    debtStatus: "Pending" | "Partial" | "Settled";
    totalPaid: number;
    remainingAmount: number;
  }> => {
    const paymentRow = await db
      .select({
        payment: debtPayments,
        debt: debts,
      })
      .from(debtPayments)
      .innerJoin(debts, eq(debtPayments.debtID, debts.id))
      .where(and(eq(debtPayments.id, paymentID), eq(debts.userID, userID)))
      .get();

    if (!paymentRow) {
      throw new AppError("Pago no encontrado", 404, "PAYMENT_NOT_FOUND");
    }

    const { payment, debt } = paymentRow;
    let newStatus: "Pending" | "Partial" | "Settled" = "Pending";
    let finalTotalPaid = 0;

    await db.transaction(async (tx) => {
      // 1. Revertir transacción y cuenta asociada si existía
      if (payment.transactionID) {
        const txRecord = await tx
          .select()
          .from(transactions)
          .where(eq(transactions.id, payment.transactionID))
          .get();

        if (txRecord) {
          const acc = await tx
            .select()
            .from(accounts)
            .where(eq(accounts.id, txRecord.accountID))
            .get();

          if (acc) {
            const restoredBalance =
              txRecord.type === "Expense"
                ? (acc.amount ?? 0) + txRecord.amount
                : (acc.amount ?? 0) - txRecord.amount;

            await tx
              .update(accounts)
              .set({ amount: restoredBalance, updatedAt: sql`CURRENT_TIMESTAMP` })
              .where(eq(accounts.id, acc.id));
          }

          await tx
            .delete(transactions)
            .where(eq(transactions.id, txRecord.id));
        }
      }

      // 2. Eliminar el pago en DebtPayments
      await tx.delete(debtPayments).where(eq(debtPayments.id, paymentID));

      // 3. Recalcular pagos acumulados para la deuda y actualizar status
      const paymentsSum = await tx
        .select({
          total: sql<number>`COALESCE(SUM(${debtPayments.amount}), 0)`,
        })
        .from(debtPayments)
        .where(eq(debtPayments.debtID, debt.id))
        .get();

      finalTotalPaid = Number(paymentsSum?.total) || 0;

      if (finalTotalPaid >= debt.totalAmount) {
        newStatus = "Settled";
      } else if (finalTotalPaid > 0) {
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
    });

    return {
      deletedPaymentId: paymentID,
      debtId: debt.id,
      debtStatus: newStatus,
      totalPaid: finalTotalPaid,
      remainingAmount: Math.max(0, debt.totalAmount - finalTotalPaid),
    };
  },
};
