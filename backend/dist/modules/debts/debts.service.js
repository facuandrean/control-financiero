"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debtService = void 0;
const db_1 = require("../../core/db/db");
const debts_schema_1 = require("./debts.schema");
const entities_schema_1 = require("../entities/entities.schema");
const AppError_1 = require("../../core/utils/AppError");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
const entities_service_1 = require("../entities/entities.service");
exports.debtService = {
    createDebt: async (data) => {
        // Verificar que la entidad pertenezca al usuario
        await entities_service_1.entityService.getEntityById(data.entityID, data.userID);
        const newDebt = await db_1.db
            .insert(debts_schema_1.debts)
            .values({
            id: crypto_1.default.randomUUID(),
            userID: data.userID,
            entityID: data.entityID,
            type: data.type,
            description: data.description,
            totalAmount: data.totalAmount,
            status: "Pending",
            dueDate: data.dueDate || null,
            createdAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        })
            .returning()
            .get();
        if (!newDebt) {
            throw new AppError_1.AppError("No se pudo crear la deuda", 500, "DEBT_CREATION_FAILED");
        }
        return newDebt;
    },
    getDebts: async (userID) => {
        const rows = await db_1.db
            .select({
            debt: debts_schema_1.debts,
            entity: entities_schema_1.entities,
            totalPaid: (0, drizzle_orm_1.sql) `COALESCE(SUM(${debts_schema_1.debtPayments.amount}), 0)`,
        })
            .from(debts_schema_1.debts)
            .leftJoin(entities_schema_1.entities, (0, drizzle_orm_1.eq)(debts_schema_1.debts.entityID, entities_schema_1.entities.id))
            .leftJoin(debts_schema_1.debtPayments, (0, drizzle_orm_1.eq)(debts_schema_1.debts.id, debts_schema_1.debtPayments.debtID))
            .where((0, drizzle_orm_1.eq)(debts_schema_1.debts.userID, userID))
            .groupBy(debts_schema_1.debts.id)
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
    getDebtById: async (id, userID) => {
        const debt = await db_1.db
            .select()
            .from(debts_schema_1.debts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(debts_schema_1.debts.id, id), (0, drizzle_orm_1.eq)(debts_schema_1.debts.userID, userID)))
            .get();
        if (!debt) {
            throw new AppError_1.AppError("Deuda no encontrada", 404, "DEBT_NOT_FOUND");
        }
        const entity = (await db_1.db
            .select()
            .from(entities_schema_1.entities)
            .where((0, drizzle_orm_1.eq)(entities_schema_1.entities.id, debt.entityID))
            .get()) || null;
        const payments = await db_1.db
            .select()
            .from(debts_schema_1.debtPayments)
            .where((0, drizzle_orm_1.eq)(debts_schema_1.debtPayments.debtID, id))
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
    updateDebt: async (id, userID, data) => {
        const currentDebt = await db_1.db
            .select()
            .from(debts_schema_1.debts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(debts_schema_1.debts.id, id), (0, drizzle_orm_1.eq)(debts_schema_1.debts.userID, userID)))
            .get();
        if (!currentDebt) {
            throw new AppError_1.AppError("Deuda no encontrada", 404, "DEBT_NOT_FOUND");
        }
        if (data.entityID && data.entityID !== currentDebt.entityID) {
            await entities_service_1.entityService.getEntityById(data.entityID, userID);
        }
        const targetTotalAmount = data.totalAmount ?? currentDebt.totalAmount;
        // Recalcular status basado en pagos actuales y el nuevo totalAmount
        const paymentsSum = await db_1.db
            .select({
            total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${debts_schema_1.debtPayments.amount}), 0)`,
        })
            .from(debts_schema_1.debtPayments)
            .where((0, drizzle_orm_1.eq)(debts_schema_1.debtPayments.debtID, id))
            .get();
        const totalPaid = Number(paymentsSum?.total) || 0;
        let calculatedStatus = "Pending";
        if (totalPaid >= targetTotalAmount) {
            calculatedStatus = "Settled";
        }
        else if (totalPaid > 0) {
            calculatedStatus = "Partial";
        }
        else {
            calculatedStatus = "Pending";
        }
        const updatedDebt = await db_1.db
            .update(debts_schema_1.debts)
            .set({
            ...data,
            status: calculatedStatus,
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(debts_schema_1.debts.id, id), (0, drizzle_orm_1.eq)(debts_schema_1.debts.userID, userID)))
            .returning()
            .get();
        if (!updatedDebt) {
            throw new AppError_1.AppError("No se pudo actualizar la deuda", 500, "DEBT_UPDATE_FAILED");
        }
        return updatedDebt;
    },
    deleteDebt: async (id, userID) => {
        const currentDebt = await db_1.db
            .select()
            .from(debts_schema_1.debts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(debts_schema_1.debts.id, id), (0, drizzle_orm_1.eq)(debts_schema_1.debts.userID, userID)))
            .get();
        if (!currentDebt) {
            throw new AppError_1.AppError("Deuda no encontrada", 404, "DEBT_NOT_FOUND");
        }
        await db_1.db.delete(debts_schema_1.debtPayments).where((0, drizzle_orm_1.eq)(debts_schema_1.debtPayments.debtID, id));
        await db_1.db.delete(debts_schema_1.debts).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(debts_schema_1.debts.id, id), (0, drizzle_orm_1.eq)(debts_schema_1.debts.userID, userID)));
    },
    addPayment: async (debtID, userID, data) => {
        const debt = await db_1.db
            .select()
            .from(debts_schema_1.debts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(debts_schema_1.debts.id, debtID), (0, drizzle_orm_1.eq)(debts_schema_1.debts.userID, userID)))
            .get();
        if (!debt) {
            throw new AppError_1.AppError("Deuda no encontrada", 404, "DEBT_NOT_FOUND");
        }
        const paymentID = crypto_1.default.randomUUID();
        const newPayment = await db_1.db
            .insert(debts_schema_1.debtPayments)
            .values({
            id: paymentID,
            debtID: debt.id,
            amount: data.amount,
            date: data.date || (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
            notes: data.notes || null,
            createdAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        })
            .returning()
            .get();
        if (!newPayment) {
            throw new AppError_1.AppError("No se pudo registrar el pago", 500, "PAYMENT_CREATION_FAILED");
        }
        // Recalcular pagos acumulados para la deuda
        const paymentsSum = await db_1.db
            .select({
            total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${debts_schema_1.debtPayments.amount}), 0)`,
        })
            .from(debts_schema_1.debtPayments)
            .where((0, drizzle_orm_1.eq)(debts_schema_1.debtPayments.debtID, debt.id))
            .get();
        const totalPaid = Number(paymentsSum?.total) || 0;
        let newStatus = "Pending";
        if (totalPaid >= debt.totalAmount) {
            newStatus = "Settled";
        }
        else if (totalPaid > 0) {
            newStatus = "Partial";
        }
        else {
            newStatus = "Pending";
        }
        await db_1.db
            .update(debts_schema_1.debts)
            .set({
            status: newStatus,
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        })
            .where((0, drizzle_orm_1.eq)(debts_schema_1.debts.id, debt.id));
        return {
            payment: newPayment,
            debtStatus: newStatus,
            totalPaid,
            remainingAmount: Math.max(0, debt.totalAmount - totalPaid),
        };
    },
    deletePayment: async (paymentID, userID) => {
        const paymentRow = await db_1.db
            .select({
            payment: debts_schema_1.debtPayments,
            debt: debts_schema_1.debts,
        })
            .from(debts_schema_1.debtPayments)
            .innerJoin(debts_schema_1.debts, (0, drizzle_orm_1.eq)(debts_schema_1.debtPayments.debtID, debts_schema_1.debts.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(debts_schema_1.debtPayments.id, paymentID), (0, drizzle_orm_1.eq)(debts_schema_1.debts.userID, userID)))
            .get();
        if (!paymentRow) {
            throw new AppError_1.AppError("Pago no encontrado", 404, "PAYMENT_NOT_FOUND");
        }
        const debt = paymentRow.debt;
        await db_1.db.delete(debts_schema_1.debtPayments).where((0, drizzle_orm_1.eq)(debts_schema_1.debtPayments.id, paymentID));
        // Recalcular el estado tras eliminar el pago
        const paymentsSum = await db_1.db
            .select({
            total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${debts_schema_1.debtPayments.amount}), 0)`,
        })
            .from(debts_schema_1.debtPayments)
            .where((0, drizzle_orm_1.eq)(debts_schema_1.debtPayments.debtID, debt.id))
            .get();
        const totalPaid = Number(paymentsSum?.total) || 0;
        let newStatus = "Pending";
        if (totalPaid >= debt.totalAmount) {
            newStatus = "Settled";
        }
        else if (totalPaid > 0) {
            newStatus = "Partial";
        }
        else {
            newStatus = "Pending";
        }
        await db_1.db
            .update(debts_schema_1.debts)
            .set({
            status: newStatus,
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        })
            .where((0, drizzle_orm_1.eq)(debts_schema_1.debts.id, debt.id));
        return {
            deletedPaymentId: paymentID,
            debtId: debt.id,
            debtStatus: newStatus,
            totalPaid,
            remainingAmount: Math.max(0, debt.totalAmount - totalPaid),
        };
    },
};
