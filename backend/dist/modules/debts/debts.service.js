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
const accounts_schema_1 = require("../accounts/accounts.schema");
const accounts_service_1 = require("../accounts/accounts.service");
const transactions_schema_1 = require("../transactions/transactions.schema");
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
        // 1. Obtener la cuenta y validar fondos si la deuda es a pagar (Payable)
        const account = await accounts_service_1.accountService.getAccountById(data.accountID, userID);
        const isCreditCard = (type) => {
            const lower = type.toLowerCase();
            return lower.includes("crédito") || lower.includes("credito");
        };
        if (debt.type === "Payable") {
            const currentBalance = account.amount ?? 0;
            if (!isCreditCard(account.type) && data.amount > currentBalance) {
                throw new AppError_1.AppError("Saldo insuficiente", 400, "INSUFFICIENT_FUNDS");
            }
        }
        const paymentID = crypto_1.default.randomUUID();
        const transactionID = crypto_1.default.randomUUID();
        const transactionType = debt.type === "Payable" ? "Expense" : "Income";
        const paymentDate = data.date || new Date().toISOString().split("T")[0];
        let resultPayment;
        let newStatus = "Pending";
        let finalTotalPaid = 0;
        await db_1.db.transaction(async (tx) => {
            // 1. Crear el registro en la tabla Transactions primero para satisfacer la FK
            await tx.insert(transactions_schema_1.transactions).values({
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
                createdAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
                updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
            });
            // 2. Insertar el pago en DebtPayments vinculando transactionID existente
            const [insertedPayment] = await tx
                .insert(debts_schema_1.debtPayments)
                .values({
                id: paymentID,
                debtID: debt.id,
                amount: data.amount,
                date: paymentDate,
                notes: data.notes || null,
                transactionID: transactionID,
                createdAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
            })
                .returning();
            resultPayment = insertedPayment;
            // 4. Actualizar el saldo en la tabla Accounts
            const currentAccount = await tx
                .select()
                .from(accounts_schema_1.accounts)
                .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, data.accountID))
                .get();
            if (currentAccount) {
                const newBalance = transactionType === "Expense"
                    ? (currentAccount.amount ?? 0) - data.amount
                    : (currentAccount.amount ?? 0) + data.amount;
                await tx
                    .update(accounts_schema_1.accounts)
                    .set({ amount: newBalance, updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP` })
                    .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, currentAccount.id));
            }
            // 5. Recalcular pagos acumulados para la deuda y actualizar status
            const paymentsSum = await tx
                .select({
                total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${debts_schema_1.debtPayments.amount}), 0)`,
            })
                .from(debts_schema_1.debtPayments)
                .where((0, drizzle_orm_1.eq)(debts_schema_1.debtPayments.debtID, debt.id))
                .get();
            finalTotalPaid = Number(paymentsSum?.total) || 0;
            if (finalTotalPaid >= debt.totalAmount) {
                newStatus = "Settled";
            }
            else if (finalTotalPaid > 0) {
                newStatus = "Partial";
            }
            else {
                newStatus = "Pending";
            }
            await tx
                .update(debts_schema_1.debts)
                .set({
                status: newStatus,
                updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
            })
                .where((0, drizzle_orm_1.eq)(debts_schema_1.debts.id, debt.id));
        });
        return {
            payment: resultPayment,
            debtStatus: newStatus,
            totalPaid: finalTotalPaid,
            remainingAmount: Math.max(0, debt.totalAmount - finalTotalPaid),
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
        const { payment, debt } = paymentRow;
        let newStatus = "Pending";
        let finalTotalPaid = 0;
        await db_1.db.transaction(async (tx) => {
            // 1. Revertir transacción y cuenta asociada si existía
            if (payment.transactionID) {
                const txRecord = await tx
                    .select()
                    .from(transactions_schema_1.transactions)
                    .where((0, drizzle_orm_1.eq)(transactions_schema_1.transactions.id, payment.transactionID))
                    .get();
                if (txRecord) {
                    const acc = await tx
                        .select()
                        .from(accounts_schema_1.accounts)
                        .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, txRecord.accountID))
                        .get();
                    if (acc) {
                        const restoredBalance = txRecord.type === "Expense"
                            ? (acc.amount ?? 0) + txRecord.amount
                            : (acc.amount ?? 0) - txRecord.amount;
                        await tx
                            .update(accounts_schema_1.accounts)
                            .set({ amount: restoredBalance, updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP` })
                            .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, acc.id));
                    }
                    await tx
                        .delete(transactions_schema_1.transactions)
                        .where((0, drizzle_orm_1.eq)(transactions_schema_1.transactions.id, txRecord.id));
                }
            }
            // 2. Eliminar el pago en DebtPayments
            await tx.delete(debts_schema_1.debtPayments).where((0, drizzle_orm_1.eq)(debts_schema_1.debtPayments.id, paymentID));
            // 3. Recalcular pagos acumulados para la deuda y actualizar status
            const paymentsSum = await tx
                .select({
                total: (0, drizzle_orm_1.sql) `COALESCE(SUM(${debts_schema_1.debtPayments.amount}), 0)`,
            })
                .from(debts_schema_1.debtPayments)
                .where((0, drizzle_orm_1.eq)(debts_schema_1.debtPayments.debtID, debt.id))
                .get();
            finalTotalPaid = Number(paymentsSum?.total) || 0;
            if (finalTotalPaid >= debt.totalAmount) {
                newStatus = "Settled";
            }
            else if (finalTotalPaid > 0) {
                newStatus = "Partial";
            }
            else {
                newStatus = "Pending";
            }
            await tx
                .update(debts_schema_1.debts)
                .set({
                status: newStatus,
                updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
            })
                .where((0, drizzle_orm_1.eq)(debts_schema_1.debts.id, debt.id));
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
