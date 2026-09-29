"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.debtService = void 0;
const db_1 = require("../../core/db/db");
const debts_schema_1 = require("./debts.schema");
const entities_schema_1 = require("../entities/entities.schema");
const accounts_schema_1 = require("../accounts/accounts.schema");
const transactions_schema_1 = require("../transactions/transactions.schema");
const AppError_1 = require("../../core/utils/AppError");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
const entities_service_1 = require("../entities/entities.service");
const isCreditCard = (accountType, accountTag) => {
    if (accountType === "Credit Card")
        return true;
    if (accountTag &&
        (accountTag.toLowerCase().includes("crédito") ||
            accountTag.toLowerCase().includes("credito") ||
            accountTag.toLowerCase().includes("credit"))) {
        return true;
    }
    if (!accountType)
        return false;
    const lower = accountType.toLowerCase();
    return lower.includes("crédito") || lower.includes("credito") || lower.includes("credit");
};
exports.debtService = {
    createDebt: async (data) => {
        // 1. Verificar que la entidad pertenezca al usuario y esté activa
        const entity = await entities_service_1.entityService.getEntityById(data.entityID, data.userID);
        if (entity.status === "Inactive") {
            throw new AppError_1.AppError("No se puede registrar una deuda con una entidad inactiva", 400, "INACTIVE_ENTITY");
        }
        // 2. Verificar si ya existe una deuda Pending para esa entityID y type
        const existingDebt = await db_1.db
            .select()
            .from(debts_schema_1.debts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(debts_schema_1.debts.userID, data.userID), (0, drizzle_orm_1.eq)(debts_schema_1.debts.entityID, data.entityID), (0, drizzle_orm_1.eq)(debts_schema_1.debts.type, data.type), (0, drizzle_orm_1.eq)(debts_schema_1.debts.status, "Pending")))
            .get();
        if (existingDebt) {
            throw new AppError_1.AppError("Ya existe una cuenta pendiente con esta persona para este tipo de deuda", 400, "DEBT_ALREADY_EXISTS");
        }
        const initialAmount = data.initialAmount ?? 0;
        const initialStatus = initialAmount <= 0 ? "Pending" : "Pending";
        const [newDebt] = await db_1.db
            .insert(debts_schema_1.debts)
            .values({
            id: crypto_1.default.randomUUID(),
            userID: data.userID,
            entityID: data.entityID,
            type: data.type,
            initialAmount: initialAmount,
            status: initialStatus,
            createdAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        })
            .returning();
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
        })
            .from(debts_schema_1.debts)
            .leftJoin(entities_schema_1.entities, (0, drizzle_orm_1.eq)(debts_schema_1.debts.entityID, entities_schema_1.entities.id))
            .where((0, drizzle_orm_1.eq)(debts_schema_1.debts.userID, userID))
            .all();
        const userDebtIds = rows.map((r) => r.debt.id);
        const movementsMap = {};
        if (userDebtIds.length > 0) {
            const allMovements = await db_1.db
                .select()
                .from(debts_schema_1.debtMovements)
                .where((0, drizzle_orm_1.inArray)(debts_schema_1.debtMovements.debtID, userDebtIds))
                .orderBy((0, drizzle_orm_1.asc)(debts_schema_1.debtMovements.date), (0, drizzle_orm_1.asc)(debts_schema_1.debtMovements.createdAt))
                .all();
            for (const m of allMovements) {
                if (!movementsMap[m.debtID])
                    movementsMap[m.debtID] = [];
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
            const calculatedStatus = balance <= 0 ? "Settled" : "Pending";
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
    getDebtById: async (id, userID) => {
        const debt = await db_1.db
            .select()
            .from(debts_schema_1.debts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(debts_schema_1.debts.id, id), (0, drizzle_orm_1.eq)(debts_schema_1.debts.userID, userID)))
            .get();
        if (!debt) {
            throw new AppError_1.AppError("Deuda no encontrada", 404, "DEBT_NOT_FOUND");
        }
        const entity = debt.entityID
            ? (await db_1.db
                .select()
                .from(entities_schema_1.entities)
                .where((0, drizzle_orm_1.eq)(entities_schema_1.entities.id, debt.entityID))
                .get()) || null
            : null;
        const movements = await db_1.db
            .select()
            .from(debts_schema_1.debtMovements)
            .where((0, drizzle_orm_1.eq)(debts_schema_1.debtMovements.debtID, id))
            .orderBy((0, drizzle_orm_1.asc)(debts_schema_1.debtMovements.date), (0, drizzle_orm_1.asc)(debts_schema_1.debtMovements.createdAt))
            .all();
        const totalCharges = movements
            .filter((m) => m.type === "CHARGE")
            .reduce((sum, m) => sum + m.amount, 0);
        const totalPayments = movements
            .filter((m) => m.type === "PAYMENT")
            .reduce((sum, m) => sum + m.amount, 0);
        const initialAmount = debt.initialAmount ?? 0;
        const balance = initialAmount + totalCharges - totalPayments;
        const calculatedStatus = balance <= 0 ? "Settled" : "Pending";
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
    updateDebt: async (id, userID, data) => {
        const currentDebt = await db_1.db
            .select()
            .from(debts_schema_1.debts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(debts_schema_1.debts.id, id), (0, drizzle_orm_1.eq)(debts_schema_1.debts.userID, userID)))
            .get();
        if (!currentDebt) {
            throw new AppError_1.AppError("Deuda no encontrada", 404, "DEBT_NOT_FOUND");
        }
        const [updatedDebt] = await db_1.db
            .update(debts_schema_1.debts)
            .set({
            ...data,
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(debts_schema_1.debts.id, id), (0, drizzle_orm_1.eq)(debts_schema_1.debts.userID, userID)))
            .returning();
        return updatedDebt;
    },
    addMovement: async (debtID, userID, data) => {
        const debt = await db_1.db
            .select()
            .from(debts_schema_1.debts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(debts_schema_1.debts.id, debtID), (0, drizzle_orm_1.eq)(debts_schema_1.debts.userID, userID)))
            .get();
        if (!debt) {
            throw new AppError_1.AppError("Deuda no encontrada", 404, "DEBT_NOT_FOUND");
        }
        let transactionID = null;
        let transactionType = null;
        return await db_1.db.transaction(async (tx) => {
            // 1. Si se provee accountID, aplicar validaciones de saldo estricto y crear transacción
            if (data.accountID) {
                const account = await tx
                    .select()
                    .from(accounts_schema_1.accounts)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, data.accountID), (0, drizzle_orm_1.eq)(accounts_schema_1.accounts.userID, userID)))
                    .get();
                if (!account) {
                    throw new AppError_1.AppError("Cuenta bancaria no encontrada", 404, "ACCOUNT_NOT_FOUND");
                }
                if (account.status === "Inactive") {
                    throw new AppError_1.AppError("No se pueden registrar movimientos con una cuenta inactiva", 400, "INACTIVE_ACCOUNT");
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
                }
                else {
                    transactionType = data.type === "PAYMENT" ? "Income" : "Expense";
                }
                // Si es Egreso (Expense), verificar saldo disponible en la cuenta (a menos que sea tarjeta de crédito)
                if (transactionType === "Expense") {
                    const currentBalance = account.amount ?? 0;
                    if (!isCreditCard(account.type, account.tag) && data.amount > currentBalance) {
                        throw new AppError_1.AppError("Saldo insuficiente en la cuenta seleccionada", 400, "INSUFFICIENT_FUNDS");
                    }
                }
                transactionID = crypto_1.default.randomUUID();
                const txDescription = `${data.type === "PAYMENT" ? "Pago de deuda" : "Cargo de deuda"}: ${data.description}`;
                // Insertar en Transactions
                await tx.insert(transactions_schema_1.transactions).values({
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
                    createdAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
                    updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
                });
                // Actualizar saldo de la cuenta
                const newBalance = transactionType === "Expense"
                    ? (account.amount ?? 0) - data.amount
                    : (account.amount ?? 0) + data.amount;
                await tx
                    .update(accounts_schema_1.accounts)
                    .set({ amount: newBalance, updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP` })
                    .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, account.id));
            }
            // 2. Inserta el registro en DebtMovements
            const movementID = crypto_1.default.randomUUID();
            const [insertedMovement] = await tx
                .insert(debts_schema_1.debtMovements)
                .values({
                id: movementID,
                debtID: debt.id,
                type: data.type,
                amount: data.amount,
                description: data.description,
                date: data.date,
                transactionID: transactionID || null,
                createdAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
            })
                .returning();
            // 3. Recalcular el balance total de la deuda: initialAmount + SUM(cargos) - SUM(pagos)
            const allMovements = await tx
                .select()
                .from(debts_schema_1.debtMovements)
                .where((0, drizzle_orm_1.eq)(debts_schema_1.debtMovements.debtID, debt.id))
                .all();
            const totalCharges = allMovements
                .filter((m) => m.type === "CHARGE")
                .reduce((sum, m) => sum + m.amount, 0);
            const totalPayments = allMovements
                .filter((m) => m.type === "PAYMENT")
                .reduce((sum, m) => sum + m.amount, 0);
            const currentBalance = (debt.initialAmount ?? 0) + totalCharges - totalPayments;
            const newStatus = currentBalance <= 0 ? "Settled" : "Pending";
            await tx
                .update(debts_schema_1.debts)
                .set({
                status: newStatus,
                updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
            })
                .where((0, drizzle_orm_1.eq)(debts_schema_1.debts.id, debt.id));
            return {
                movement: insertedMovement,
                debtStatus: newStatus,
                balance: currentBalance,
                totalCharges,
                totalPayments,
            };
        });
    },
    deleteMovement: async (movementID, userID) => {
        return await db_1.db.transaction(async (tx) => {
            const row = await tx
                .select({
                movement: debts_schema_1.debtMovements,
                debt: debts_schema_1.debts,
            })
                .from(debts_schema_1.debtMovements)
                .innerJoin(debts_schema_1.debts, (0, drizzle_orm_1.eq)(debts_schema_1.debtMovements.debtID, debts_schema_1.debts.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(debts_schema_1.debtMovements.id, movementID), (0, drizzle_orm_1.eq)(debts_schema_1.debts.userID, userID)))
                .get();
            if (!row) {
                throw new AppError_1.AppError("Movimiento no encontrado", 404, "MOVEMENT_NOT_FOUND");
            }
            const { movement, debt } = row;
            // 1. Si el movimiento tiene un transactionID, eliminar esa transacción y restaurar saldo en Accounts
            if (movement.transactionID) {
                const txRecord = await tx
                    .select()
                    .from(transactions_schema_1.transactions)
                    .where((0, drizzle_orm_1.eq)(transactions_schema_1.transactions.id, movement.transactionID))
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
            // 2. Elimina el registro de DebtMovements
            await tx.delete(debts_schema_1.debtMovements).where((0, drizzle_orm_1.eq)(debts_schema_1.debtMovements.id, movement.id));
            // 3. Recalcular el balance total de la Deuda para actualizar su status
            const remainingMovements = await tx
                .select()
                .from(debts_schema_1.debtMovements)
                .where((0, drizzle_orm_1.eq)(debts_schema_1.debtMovements.debtID, debt.id))
                .all();
            const totalCharges = remainingMovements
                .filter((m) => m.type === "CHARGE")
                .reduce((sum, m) => sum + m.amount, 0);
            const totalPayments = remainingMovements
                .filter((m) => m.type === "PAYMENT")
                .reduce((sum, m) => sum + m.amount, 0);
            const currentBalance = (debt.initialAmount ?? 0) + totalCharges - totalPayments;
            const newStatus = currentBalance <= 0 ? "Settled" : "Pending";
            await tx
                .update(debts_schema_1.debts)
                .set({
                status: newStatus,
                updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
            })
                .where((0, drizzle_orm_1.eq)(debts_schema_1.debts.id, debt.id));
            return {
                deletedMovementId: movement.id,
                debtId: debt.id,
                debtStatus: newStatus,
                balance: currentBalance,
            };
        });
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
        await db_1.db.transaction(async (tx) => {
            // 1. Obtener todos los movimientos asociados
            const movements = await tx
                .select()
                .from(debts_schema_1.debtMovements)
                .where((0, drizzle_orm_1.eq)(debts_schema_1.debtMovements.debtID, id))
                .all();
            // 2. Para cada movimiento, revertir transacción y cuenta vinculada
            for (const m of movements) {
                if (m.transactionID) {
                    const txRecord = await tx
                        .select()
                        .from(transactions_schema_1.transactions)
                        .where((0, drizzle_orm_1.eq)(transactions_schema_1.transactions.id, m.transactionID))
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
            }
            // 3. Eliminar los movimientos
            await tx.delete(debts_schema_1.debtMovements).where((0, drizzle_orm_1.eq)(debts_schema_1.debtMovements.debtID, id));
            // 4. Eliminar la deuda
            await tx.delete(debts_schema_1.debts).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(debts_schema_1.debts.id, id), (0, drizzle_orm_1.eq)(debts_schema_1.debts.userID, userID)));
        });
    },
};
