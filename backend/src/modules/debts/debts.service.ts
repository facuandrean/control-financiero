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
import { and, eq, sql } from "drizzle-orm";
import crypto from "crypto";
import { entityService } from "../entities/entities.service";

export const debtService = {
  createDebt: async (data: CreateDebtDTO & { userID: string }): Promise<Debt> => {
    // Verificar que la entidad pertenezca al usuario
    await entityService.getEntityById(data.entityID, data.userID);

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

    return rows.map((r) => {
      const paid = Number(r.totalPaid) || 0;
      return {
        ...r.debt,
        entity: r.entity?.id ? r.entity : null,
        totalPaid: paid,
        remainingAmount: Math.max(0, r.debt.totalAmount - paid),
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

    const entity =
      (await db
        .select()
        .from(entities)
        .where(eq(entities.id, debt.entityID))
        .get()) || null;

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
      await entityService.getEntityById(data.entityID, userID);
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

    await db.delete(debtPayments).where(eq(debtPayments.debtID, id));
    await db.delete(debts).where(and(eq(debts.id, id), eq(debts.userID, userID)));
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

    const paymentID = crypto.randomUUID();
    const newPayment = await db
      .insert(debtPayments)
      .values({
        id: paymentID,
        debtID: debt.id,
        amount: data.amount,
        date: data.date || sql`CURRENT_TIMESTAMP`,
        notes: data.notes || null,
        createdAt: sql`CURRENT_TIMESTAMP`,
      })
      .returning()
      .get();

    if (!newPayment) {
      throw new AppError("No se pudo registrar el pago", 500, "PAYMENT_CREATION_FAILED");
    }

    // Recalcular pagos acumulados para la deuda
    const paymentsSum = await db
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

    await db
      .update(debts)
      .set({
        status: newStatus,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(debts.id, debt.id));

    return {
      payment: newPayment,
      debtStatus: newStatus,
      totalPaid,
      remainingAmount: Math.max(0, debt.totalAmount - totalPaid),
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

    const debt = paymentRow.debt;

    await db.delete(debtPayments).where(eq(debtPayments.id, paymentID));

    // Recalcular el estado tras eliminar el pago
    const paymentsSum = await db
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

    await db
      .update(debts)
      .set({
        status: newStatus,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(debts.id, debt.id));

    return {
      deletedPaymentId: paymentID,
      debtId: debt.id,
      debtStatus: newStatus,
      totalPaid,
      remainingAmount: Math.max(0, debt.totalAmount - totalPaid),
    };
  },
};
