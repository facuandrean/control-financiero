"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionService = void 0;
const db_1 = require("../../core/db/db");
const transactions_schema_1 = require("./transactions.schema");
const accounts_schema_1 = require("../accounts/accounts.schema");
const categories_schema_1 = require("../categories/categories.schema");
const entities_schema_1 = require("../entities/entities.schema");
const debts_schema_1 = require("../debts/debts.schema");
const AppError_1 = require("../../core/utils/AppError");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
const accounts_service_1 = require("../accounts/accounts.service");
const categories_service_1 = require("../categories/categories.service");
const entities_service_1 = require("../entities/entities.service");
const toAccounts = (0, drizzle_orm_1.aliasedTable)(accounts_schema_1.accounts, "to_accounts");
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
const addMonthsToDate = (baseDateStr, monthsToAdd) => {
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
exports.transactionService = {
    getAllTransactions: async (userID, filters) => {
        const conditions = [(0, drizzle_orm_1.eq)(transactions_schema_1.transactions.userID, userID)];
        if (filters?.accountID) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(transactions_schema_1.transactions.accountID, filters.accountID), (0, drizzle_orm_1.eq)(transactions_schema_1.transactions.toAccountID, filters.accountID)));
        }
        if (filters?.type) {
            conditions.push((0, drizzle_orm_1.eq)(transactions_schema_1.transactions.type, filters.type));
        }
        if (filters?.year && filters?.month) {
            const formattedMonth = String(filters.month).padStart(2, "0");
            conditions.push((0, drizzle_orm_1.like)(transactions_schema_1.transactions.date, `${filters.year}-${formattedMonth}%`));
        }
        else if (filters?.year) {
            conditions.push((0, drizzle_orm_1.like)(transactions_schema_1.transactions.date, `${filters.year}-%`));
        }
        const page = filters?.page ? Math.max(1, Number(filters.page)) : undefined;
        const pageSize = filters?.pageSize ? Math.max(1, Number(filters.pageSize)) : undefined;
        const baseQuery = db_1.db
            .select({
            transaction: transactions_schema_1.transactions,
            account: accounts_schema_1.accounts,
            toAccount: toAccounts,
            category: categories_schema_1.categories,
            entity: entities_schema_1.entities,
        })
            .from(transactions_schema_1.transactions)
            .leftJoin(accounts_schema_1.accounts, (0, drizzle_orm_1.eq)(transactions_schema_1.transactions.accountID, accounts_schema_1.accounts.id))
            .leftJoin(toAccounts, (0, drizzle_orm_1.eq)(transactions_schema_1.transactions.toAccountID, toAccounts.id))
            .leftJoin(categories_schema_1.categories, (0, drizzle_orm_1.eq)(transactions_schema_1.transactions.categoryID, categories_schema_1.categories.id))
            .leftJoin(entities_schema_1.entities, (0, drizzle_orm_1.eq)(transactions_schema_1.transactions.entityID, entities_schema_1.entities.id))
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(transactions_schema_1.transactions.date), (0, drizzle_orm_1.desc)(transactions_schema_1.transactions.createdAt));
        let rows;
        if (page && pageSize) {
            rows = await baseQuery.limit(pageSize).offset((page - 1) * pageSize).all();
        }
        else if (pageSize) {
            rows = await baseQuery.limit(pageSize).all();
        }
        else {
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
    getTransactionById: async (id, userID) => {
        const row = await db_1.db
            .select({
            transaction: transactions_schema_1.transactions,
            account: accounts_schema_1.accounts,
            toAccount: toAccounts,
            category: categories_schema_1.categories,
            entity: entities_schema_1.entities,
        })
            .from(transactions_schema_1.transactions)
            .leftJoin(accounts_schema_1.accounts, (0, drizzle_orm_1.eq)(transactions_schema_1.transactions.accountID, accounts_schema_1.accounts.id))
            .leftJoin(toAccounts, (0, drizzle_orm_1.eq)(transactions_schema_1.transactions.toAccountID, toAccounts.id))
            .leftJoin(categories_schema_1.categories, (0, drizzle_orm_1.eq)(transactions_schema_1.transactions.categoryID, categories_schema_1.categories.id))
            .leftJoin(entities_schema_1.entities, (0, drizzle_orm_1.eq)(transactions_schema_1.transactions.entityID, entities_schema_1.entities.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(transactions_schema_1.transactions.id, id), (0, drizzle_orm_1.eq)(transactions_schema_1.transactions.userID, userID)))
            .get();
        if (!row) {
            throw new AppError_1.AppError("Transacción no encontrada", 404, "TRANSACTION_NOT_FOUND");
        }
        return {
            ...row.transaction,
            account: row.account?.id ? row.account : null,
            toAccount: row.toAccount?.id ? row.toAccount : null,
            category: row.category?.id ? row.category : null,
            entity: row.entity?.id ? row.entity : null,
        };
    },
    createTransaction: async (data) => {
        // 1. Validar cuenta origen
        const sourceAccount = await accounts_service_1.accountService.getAccountById(data.accountID, data.userID);
        if (sourceAccount.status === "Inactive") {
            throw new AppError_1.AppError("No se pueden registrar transacciones con una cuenta inactiva", 400, "INACTIVE_ACCOUNT");
        }
        let destinationAccount = null;
        if (data.type === "Transfer") {
            if (!data.toAccountID) {
                throw new AppError_1.AppError("La cuenta destino es obligatoria para transferencias", 400, "DESTINATION_ACCOUNT_REQUIRED");
            }
            if (data.toAccountID === data.accountID) {
                throw new AppError_1.AppError("La cuenta destino no puede ser la misma que la cuenta origen", 400, "SAME_SOURCE_DESTINATION");
            }
            destinationAccount = await accounts_service_1.accountService.getAccountById(data.toAccountID, data.userID);
            if (destinationAccount.status === "Inactive") {
                throw new AppError_1.AppError("No se pueden realizar transferencias a una cuenta inactiva", 400, "INACTIVE_ACCOUNT");
            }
        }
        const finalCategoryID = data.type === "Transfer"
            ? null
            : data.categoryID && data.categoryID.trim() !== ""
                ? data.categoryID
                : null;
        const finalEntityID = data.type === "Transfer"
            ? null
            : data.entityID && data.entityID.trim() !== ""
                ? data.entityID
                : null;
        // 2. Validar categoría y entidad opcionales
        if (finalCategoryID) {
            const cat = await categories_service_1.categoryService.getCategoryById(finalCategoryID, data.userID);
            if (cat.status === "Inactive") {
                throw new AppError_1.AppError("No se pueden registrar transacciones con una categoría inactiva", 400, "INACTIVE_CATEGORY");
            }
        }
        if (finalEntityID) {
            const ent = await entities_service_1.entityService.getEntityById(finalEntityID, data.userID);
            if (ent.status === "Inactive") {
                throw new AppError_1.AppError("No se pueden registrar transacciones con una entidad inactiva", 400, "INACTIVE_ENTITY");
            }
        }
        // 3. Validar saldo disponible para Expense o Transfer (a menos que sea Tarjeta de Crédito)
        if (data.type === "Expense" || data.type === "Transfer") {
            const sourceBalance = sourceAccount.amount ?? 0;
            if (!isCreditCard(sourceAccount.type, sourceAccount.tag) && data.amount > sourceBalance) {
                throw new AppError_1.AppError("Saldo insuficiente en la cuenta origen", 400, "INSUFFICIENT_FUNDS");
            }
        }
        const installmentsCount = data.installments ?? 1;
        // Manejo de compras en cuotas con Tarjeta de Crédito
        if (installmentsCount > 1) {
            if (!isCreditCard(sourceAccount.type, sourceAccount.tag)) {
                throw new AppError_1.AppError("Solo se pueden registrar cuotas con tarjetas de crédito", 400, "CREDIT_CARD_REQUIRED");
            }
            if (data.type !== "Expense") {
                throw new AppError_1.AppError("Las cuotas solo aplican para transacciones de tipo Egreso", 400, "EXPENSE_REQUIRED_FOR_INSTALLMENTS");
            }
            const installmentAmount = Math.floor(data.amount / installmentsCount);
            const remainder = data.amount - installmentAmount * installmentsCount;
            const transactionsToInsert = [];
            const firstTransactionId = crypto_1.default.randomUUID();
            for (let i = 1; i <= installmentsCount; i++) {
                const currentId = i === 1 ? firstTransactionId : crypto_1.default.randomUUID();
                const currentAmount = i === 1 ? installmentAmount + remainder : installmentAmount;
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
            await db_1.db.transaction(async (tx) => {
                // En tarjetas de crédito, la deuda aumenta con el monto total de la compra
                const isCard = isCreditCard(sourceAccount.type, sourceAccount.tag);
                const newBalance = isCard
                    ? (sourceAccount.amount ?? 0) + data.amount
                    : (sourceAccount.amount ?? 0) - data.amount;
                await tx
                    .update(accounts_schema_1.accounts)
                    .set({ amount: newBalance, updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP` })
                    .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, sourceAccount.id));
                // Bulk insert de todas las cuotas generadas
                await tx.insert(transactions_schema_1.transactions).values(transactionsToInsert);
            });
            return await exports.transactionService.getTransactionById(firstTransactionId, data.userID);
        }
        const transactionId = crypto_1.default.randomUUID();
        // 4. Ejecutar cambios en BD de forma atómica
        await db_1.db.transaction(async (tx) => {
            // Actualizar saldos de las cuentas
            const isCard = isCreditCard(sourceAccount.type, sourceAccount.tag);
            if (data.type === "Income") {
                const newBalance = isCard
                    ? (sourceAccount.amount ?? 0) - data.amount
                    : (sourceAccount.amount ?? 0) + data.amount;
                await tx
                    .update(accounts_schema_1.accounts)
                    .set({ amount: newBalance, updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP` })
                    .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, sourceAccount.id));
            }
            else if (data.type === "Expense") {
                const newBalance = isCard
                    ? (sourceAccount.amount ?? 0) + data.amount
                    : (sourceAccount.amount ?? 0) - data.amount;
                await tx
                    .update(accounts_schema_1.accounts)
                    .set({ amount: newBalance, updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP` })
                    .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, sourceAccount.id));
            }
            else if (data.type === "Transfer") {
                const isDestCard = destinationAccount ? isCreditCard(destinationAccount.type, destinationAccount.tag) : false;
                const newSourceBalance = isCard
                    ? (sourceAccount.amount ?? 0) + data.amount
                    : (sourceAccount.amount ?? 0) - data.amount;
                const newDestBalance = isDestCard
                    ? (destinationAccount.amount ?? 0) - data.amount
                    : (destinationAccount.amount ?? 0) + data.amount;
                await tx
                    .update(accounts_schema_1.accounts)
                    .set({ amount: newSourceBalance, updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP` })
                    .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, sourceAccount.id));
                await tx
                    .update(accounts_schema_1.accounts)
                    .set({ amount: newDestBalance, updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP` })
                    .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, destinationAccount.id));
            }
            // Insertar transacción
            await tx.insert(transactions_schema_1.transactions).values({
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
                createdAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
                updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
            });
        });
        return await exports.transactionService.getTransactionById(transactionId, data.userID);
    },
    updateTransaction: async (id, userID, data) => {
        const oldTx = await exports.transactionService.getTransactionById(id, userID);
        const targetType = data.type ?? oldTx.type;
        const targetAmount = data.amount ?? oldTx.amount;
        const targetAccountID = data.accountID ?? oldTx.accountID;
        const targetToAccountID = targetType === "Transfer"
            ? data.toAccountID !== undefined
                ? data.toAccountID
                : oldTx.toAccountID
            : null;
        const rawCategoryID = targetType === "Transfer"
            ? null
            : data.categoryID !== undefined
                ? data.categoryID
                : oldTx.categoryID;
        const targetCategoryID = rawCategoryID && rawCategoryID.trim() !== "" ? rawCategoryID : null;
        const rawEntityID = targetType === "Transfer"
            ? null
            : data.entityID !== undefined
                ? data.entityID
                : oldTx.entityID;
        const targetEntityID = rawEntityID && rawEntityID.trim() !== "" ? rawEntityID : null;
        const targetDate = data.date ?? oldTx.date;
        const targetDescription = data.description ?? oldTx.description;
        if (targetType === "Transfer") {
            if (!targetToAccountID) {
                throw new AppError_1.AppError("La cuenta destino es obligatoria para transferencias", 400, "DESTINATION_ACCOUNT_REQUIRED");
            }
            if (targetToAccountID === targetAccountID) {
                throw new AppError_1.AppError("La cuenta destino no puede ser la misma que la cuenta origen", 400, "SAME_SOURCE_DESTINATION");
            }
        }
        // Validar entidades/categorías nuevas si cambiaron
        if (targetCategoryID) {
            const cat = await categories_service_1.categoryService.getCategoryById(targetCategoryID, userID);
            if (cat.status === "Inactive") {
                throw new AppError_1.AppError("La categoría seleccionada se encuentra inactiva", 400, "INACTIVE_CATEGORY");
            }
        }
        if (targetEntityID) {
            const ent = await entities_service_1.entityService.getEntityById(targetEntityID, userID);
            if (ent.status === "Inactive") {
                throw new AppError_1.AppError("La entidad seleccionada se encuentra inactiva", 400, "INACTIVE_ENTITY");
            }
        }
        await db_1.db.transaction(async (tx) => {
            // 1. REVERTIR IMPACTO DE LA TRANSACCIÓN ANTERIOR
            const currentOldSource = await tx
                .select()
                .from(accounts_schema_1.accounts)
                .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, oldTx.accountID))
                .get();
            if (!currentOldSource) {
                throw new AppError_1.AppError("Cuenta origen anterior no encontrada", 404);
            }
            const isOldCreditCard = isCreditCard(currentOldSource.type, currentOldSource.tag);
            if (oldTx.type === "Income") {
                // En TC un ingreso reduce la deuda; al revertir, se suma de nuevo la deuda
                const revertedBalance = isOldCreditCard
                    ? (currentOldSource.amount ?? 0) + oldTx.amount
                    : (currentOldSource.amount ?? 0) - oldTx.amount;
                await tx
                    .update(accounts_schema_1.accounts)
                    .set({
                    amount: revertedBalance,
                    updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
                })
                    .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, oldTx.accountID));
            }
            else if (oldTx.type === "Expense") {
                // En TC un gasto aumenta la deuda; al revertir, se resta la deuda
                const revertedBalance = isOldCreditCard
                    ? (currentOldSource.amount ?? 0) - oldTx.amount
                    : (currentOldSource.amount ?? 0) + oldTx.amount;
                await tx
                    .update(accounts_schema_1.accounts)
                    .set({
                    amount: revertedBalance,
                    updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
                })
                    .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, oldTx.accountID));
            }
            else if (oldTx.type === "Transfer" && oldTx.toAccountID) {
                const currentOldDest = await tx
                    .select()
                    .from(accounts_schema_1.accounts)
                    .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, oldTx.toAccountID))
                    .get();
                const isDestCreditCard = currentOldDest
                    ? isCreditCard(currentOldDest.type, currentOldDest.tag)
                    : false;
                const revertedSource = isOldCreditCard
                    ? (currentOldSource.amount ?? 0) - oldTx.amount
                    : (currentOldSource.amount ?? 0) + oldTx.amount;
                await tx
                    .update(accounts_schema_1.accounts)
                    .set({
                    amount: revertedSource,
                    updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
                })
                    .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, oldTx.accountID));
                if (currentOldDest) {
                    const revertedDest = isDestCreditCard
                        ? (currentOldDest.amount ?? 0) + oldTx.amount
                        : (currentOldDest.amount ?? 0) - oldTx.amount;
                    await tx
                        .update(accounts_schema_1.accounts)
                        .set({
                        amount: revertedDest,
                        updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
                    })
                        .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, oldTx.toAccountID));
                }
            }
            // 2. VALIDAR Y APLICAR NUEVA TRANSACCIÓN
            const newSourceAccount = await tx
                .select()
                .from(accounts_schema_1.accounts)
                .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, targetAccountID))
                .get();
            if (!newSourceAccount) {
                throw new AppError_1.AppError("Cuenta origen no encontrada", 404);
            }
            if (newSourceAccount.status === "Inactive") {
                throw new AppError_1.AppError("No se pueden asociar transacciones a una cuenta inactiva", 400, "INACTIVE_ACCOUNT");
            }
            const isNewCreditCard = isCreditCard(newSourceAccount.type, newSourceAccount.tag);
            let newDestAccount = null;
            if (targetType === "Transfer" && targetToAccountID) {
                newDestAccount = await tx
                    .select()
                    .from(accounts_schema_1.accounts)
                    .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, targetToAccountID))
                    .get();
                if (!newDestAccount) {
                    throw new AppError_1.AppError("Cuenta destino no encontrada", 404);
                }
                if (newDestAccount.status === "Inactive") {
                    throw new AppError_1.AppError("La cuenta destino seleccionada se encuentra inactiva", 400, "INACTIVE_ACCOUNT");
                }
            }
            if (targetType === "Expense" || targetType === "Transfer") {
                const currentBal = newSourceAccount.amount ?? 0;
                if (!isNewCreditCard && targetAmount > currentBal) {
                    throw new AppError_1.AppError("Saldo insuficiente en la cuenta origen", 400, "INSUFFICIENT_FUNDS");
                }
            }
            const updateInstallmentsCount = data.installments ?? 1;
            if (updateInstallmentsCount > 1) {
                if (!isNewCreditCard) {
                    throw new AppError_1.AppError("Solo se pueden registrar cuotas con tarjetas de crédito", 400, "CREDIT_CARD_REQUIRED");
                }
                if (targetType !== "Expense") {
                    throw new AppError_1.AppError("Las cuotas solo aplican para transacciones de tipo Egreso", 400, "EXPENSE_REQUIRED_FOR_INSTALLMENTS");
                }
                const installmentAmount = Math.floor(targetAmount / updateInstallmentsCount);
                const remainder = targetAmount - installmentAmount * updateInstallmentsCount;
                const baseDescription = (targetDescription || "").replace(/\s*\(Cuota \d+\/\d+\)\s*$/i, "").trim();
                // Actualizar la transacción actual como Cuota 1
                await tx
                    .update(transactions_schema_1.transactions)
                    .set({
                    type: targetType,
                    amount: installmentAmount + remainder,
                    accountID: targetAccountID,
                    toAccountID: null,
                    categoryID: targetCategoryID,
                    entityID: targetEntityID,
                    date: targetDate,
                    description: `${baseDescription} (Cuota 1/${updateInstallmentsCount})`,
                    updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
                })
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(transactions_schema_1.transactions.id, id), (0, drizzle_orm_1.eq)(transactions_schema_1.transactions.userID, userID)));
                // Generar e insertar las cuotas restantes
                const extraInstallments = [];
                for (let i = 2; i <= updateInstallmentsCount; i++) {
                    extraInstallments.push({
                        id: crypto_1.default.randomUUID(),
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
                    await tx.insert(transactions_schema_1.transactions).values(extraInstallments);
                }
                // Actualizar deuda de la tarjeta con el monto total
                const newBalance = (newSourceAccount.amount ?? 0) + targetAmount;
                await tx
                    .update(accounts_schema_1.accounts)
                    .set({ amount: newBalance, updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP` })
                    .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, newSourceAccount.id));
            }
            else {
                // Actualización normal (1 cuota)
                await tx
                    .update(transactions_schema_1.transactions)
                    .set({
                    type: targetType,
                    amount: targetAmount,
                    accountID: targetAccountID,
                    toAccountID: targetToAccountID,
                    categoryID: targetCategoryID,
                    entityID: targetEntityID,
                    date: targetDate,
                    description: targetDescription,
                    updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
                })
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(transactions_schema_1.transactions.id, id), (0, drizzle_orm_1.eq)(transactions_schema_1.transactions.userID, userID)));
                if (targetType === "Income") {
                    const newBalance = isNewCreditCard
                        ? (newSourceAccount.amount ?? 0) - targetAmount
                        : (newSourceAccount.amount ?? 0) + targetAmount;
                    await tx
                        .update(accounts_schema_1.accounts)
                        .set({ amount: newBalance, updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP` })
                        .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, newSourceAccount.id));
                }
                else if (targetType === "Expense") {
                    const newBalance = isNewCreditCard
                        ? (newSourceAccount.amount ?? 0) + targetAmount
                        : (newSourceAccount.amount ?? 0) - targetAmount;
                    await tx
                        .update(accounts_schema_1.accounts)
                        .set({ amount: newBalance, updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP` })
                        .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, newSourceAccount.id));
                }
                else if (targetType === "Transfer" && newDestAccount) {
                    const isDestCreditCard = isCreditCard(newDestAccount.type, newDestAccount.tag);
                    const newSourceBalance = isNewCreditCard
                        ? (newSourceAccount.amount ?? 0) + targetAmount
                        : (newSourceAccount.amount ?? 0) - targetAmount;
                    const newDestBalance = isDestCreditCard
                        ? (newDestAccount.amount ?? 0) - targetAmount
                        : (newDestAccount.amount ?? 0) + targetAmount;
                    await tx
                        .update(accounts_schema_1.accounts)
                        .set({ amount: newSourceBalance, updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP` })
                        .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, newSourceAccount.id));
                    await tx
                        .update(accounts_schema_1.accounts)
                        .set({ amount: newDestBalance, updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP` })
                        .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, newDestAccount.id));
                }
            }
            // Si la transacción está vinculada a un pago de deuda, sincronizar el pago y recalcular el estado de la deuda
            const linkedPayments = await tx
                .select()
                .from(debts_schema_1.debtPayments)
                .where((0, drizzle_orm_1.eq)(debts_schema_1.debtPayments.transactionID, id))
                .all();
            for (const linked of linkedPayments) {
                await tx
                    .update(debts_schema_1.debtPayments)
                    .set({
                    amount: targetAmount,
                    date: targetDate,
                })
                    .where((0, drizzle_orm_1.eq)(debts_schema_1.debtPayments.id, linked.id));
                const debt = await tx
                    .select()
                    .from(debts_schema_1.debts)
                    .where((0, drizzle_orm_1.eq)(debts_schema_1.debts.id, linked.debtID))
                    .get();
                if (debt) {
                    const paymentsSum = await tx
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
                    await tx
                        .update(debts_schema_1.debts)
                        .set({
                        status: newStatus,
                        updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
                    })
                        .where((0, drizzle_orm_1.eq)(debts_schema_1.debts.id, debt.id));
                }
            }
        });
        return await exports.transactionService.getTransactionById(id, userID);
    },
    deleteTransaction: async (id, userID) => {
        const txToDelete = await exports.transactionService.getTransactionById(id, userID);
        await db_1.db.transaction(async (tx) => {
            // Revertir impacto en cuentas
            const sourceAccount = await tx
                .select()
                .from(accounts_schema_1.accounts)
                .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, txToDelete.accountID))
                .get();
            if (sourceAccount) {
                const isSourceCreditCard = isCreditCard(sourceAccount.type, sourceAccount.tag);
                if (txToDelete.type === "Income") {
                    const restoredBalance = isSourceCreditCard
                        ? (sourceAccount.amount ?? 0) + txToDelete.amount
                        : (sourceAccount.amount ?? 0) - txToDelete.amount;
                    await tx
                        .update(accounts_schema_1.accounts)
                        .set({
                        amount: restoredBalance,
                        updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
                    })
                        .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, sourceAccount.id));
                }
                else if (txToDelete.type === "Expense") {
                    const restoredBalance = isSourceCreditCard
                        ? (sourceAccount.amount ?? 0) - txToDelete.amount
                        : (sourceAccount.amount ?? 0) + txToDelete.amount;
                    await tx
                        .update(accounts_schema_1.accounts)
                        .set({
                        amount: restoredBalance,
                        updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
                    })
                        .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, sourceAccount.id));
                }
                else if (txToDelete.type === "Transfer" && txToDelete.toAccountID) {
                    const destAccount = await tx
                        .select()
                        .from(accounts_schema_1.accounts)
                        .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, txToDelete.toAccountID))
                        .get();
                    const isDestCreditCard = destAccount
                        ? isCreditCard(destAccount.type, destAccount.tag)
                        : false;
                    const restoredSource = isSourceCreditCard
                        ? (sourceAccount.amount ?? 0) - txToDelete.amount
                        : (sourceAccount.amount ?? 0) + txToDelete.amount;
                    await tx
                        .update(accounts_schema_1.accounts)
                        .set({
                        amount: restoredSource,
                        updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
                    })
                        .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, sourceAccount.id));
                    if (destAccount) {
                        const restoredDest = isDestCreditCard
                            ? (destAccount.amount ?? 0) + txToDelete.amount
                            : (destAccount.amount ?? 0) - txToDelete.amount;
                        await tx
                            .update(accounts_schema_1.accounts)
                            .set({
                            amount: restoredDest,
                            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
                        })
                            .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.id, destAccount.id));
                    }
                }
            }
            // Revertir y eliminar pago de deuda vinculado si existía
            const linkedPayments = await tx
                .select()
                .from(debts_schema_1.debtPayments)
                .where((0, drizzle_orm_1.eq)(debts_schema_1.debtPayments.transactionID, id))
                .all();
            for (const linked of linkedPayments) {
                await tx
                    .delete(debts_schema_1.debtPayments)
                    .where((0, drizzle_orm_1.eq)(debts_schema_1.debtPayments.id, linked.id));
                const debt = await tx
                    .select()
                    .from(debts_schema_1.debts)
                    .where((0, drizzle_orm_1.eq)(debts_schema_1.debts.id, linked.debtID))
                    .get();
                if (debt) {
                    const paymentsSum = await tx
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
                    await tx
                        .update(debts_schema_1.debts)
                        .set({
                        status: newStatus,
                        updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
                    })
                        .where((0, drizzle_orm_1.eq)(debts_schema_1.debts.id, debt.id));
                }
            }
            await tx
                .delete(transactions_schema_1.transactions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(transactions_schema_1.transactions.id, id), (0, drizzle_orm_1.eq)(transactions_schema_1.transactions.userID, userID)));
        });
    },
};
