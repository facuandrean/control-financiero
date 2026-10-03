"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = void 0;
const db_1 = require("../../core/db/db");
const transactions_schema_1 = require("../transactions/transactions.schema");
const accounts_schema_1 = require("../accounts/accounts.schema");
const categories_schema_1 = require("../categories/categories.schema");
const entities_schema_1 = require("../entities/entities.schema");
const drizzle_orm_1 = require("drizzle-orm");
const debts_service_1 = require("../debts/debts.service");
exports.dashboardService = {
    getSummary: async (userID, month, year) => {
        const now = new Date();
        const currentYear = year ? Number(year) : now.getFullYear();
        const currentMonth = month ? Number(month) : now.getMonth() + 1;
        const formattedMonth = String(currentMonth).padStart(2, "0");
        // 1. & 2. Income and Expense transactions for the given month
        const monthTransactions = await db_1.db
            .select({
            id: transactions_schema_1.transactions.id,
            type: transactions_schema_1.transactions.type,
            amount: transactions_schema_1.transactions.amount,
            categoryID: transactions_schema_1.transactions.categoryID,
            categoryName: categories_schema_1.categories.name,
        })
            .from(transactions_schema_1.transactions)
            .leftJoin(categories_schema_1.categories, (0, drizzle_orm_1.eq)(transactions_schema_1.transactions.categoryID, categories_schema_1.categories.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(transactions_schema_1.transactions.userID, userID), (0, drizzle_orm_1.like)(transactions_schema_1.transactions.date, `${currentYear}-${formattedMonth}%`)))
            .all();
        let monthlyIncome = 0;
        let monthlyExpense = 0;
        const expenseByCategory = {};
        for (const tx of monthTransactions) {
            if (tx.type === "Income") {
                monthlyIncome += tx.amount;
            }
            else if (tx.type === "Expense") {
                monthlyExpense += tx.amount;
                const catKey = tx.categoryID || "sin_categoria";
                const catName = tx.categoryName || "Sin categoría";
                if (!expenseByCategory[catKey]) {
                    expenseByCategory[catKey] = {
                        id: tx.categoryID || null,
                        name: catName,
                        totalAmount: 0,
                    };
                }
                expenseByCategory[catKey].totalAmount += tx.amount;
            }
        }
        // 3. Monthly Balance
        const monthlyBalance = monthlyIncome - monthlyExpense;
        // 4. Net Worth (Patrimonio)
        // Suma balance actual de todas las cuentas activas e inactivas que mantengan saldo distinto de cero
        const userAccounts = await db_1.db
            .select()
            .from(accounts_schema_1.accounts)
            .where((0, drizzle_orm_1.eq)(accounts_schema_1.accounts.userID, userID))
            .all();
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
        const totalAccountsBalance = userAccounts
            .filter((acc) => acc.status === "Active" || (acc.amount !== null && acc.amount !== 0))
            .reduce((sum, acc) => {
            if (isCreditCard(acc.type, acc.tag)) {
                return sum - (acc.amount || 0);
            }
            return sum + (acc.amount || 0);
        }, 0);
        // Menos la suma del saldo pendiente (totalAmount - paidAmount) de todas las deudas activas tipo 'Payable'
        const allDebts = await debts_service_1.debtService.getDebts(userID);
        const totalPendingPayableDebts = allDebts
            .filter((debt) => debt.type === "Payable" && debt.status !== "Settled")
            .reduce((sum, debt) => sum + (debt.remainingAmount || 0), 0);
        const netWorth = totalAccountsBalance - totalPendingPayableDebts;
        // 5. Top Categories (3 o 4 categorías en las que más se gastó en el mes)
        const sortedCategories = Object.values(expenseByCategory).sort((a, b) => b.totalAmount - a.totalAmount);
        const topCategories = sortedCategories.slice(0, 4).map((cat) => ({
            ...cat,
            percentage: monthlyExpense > 0
                ? Math.round((cat.totalAmount / monthlyExpense) * 100)
                : 0,
        }));
        // 6. Recent Transactions (Últimas 5 transacciones)
        const recentRows = await db_1.db
            .select({
            id: transactions_schema_1.transactions.id,
            date: transactions_schema_1.transactions.date,
            amount: transactions_schema_1.transactions.amount,
            description: transactions_schema_1.transactions.description,
            type: transactions_schema_1.transactions.type,
            createdAt: transactions_schema_1.transactions.createdAt,
            accountName: accounts_schema_1.accounts.name,
            categoryName: categories_schema_1.categories.name,
            entityName: entities_schema_1.entities.name,
        })
            .from(transactions_schema_1.transactions)
            .leftJoin(accounts_schema_1.accounts, (0, drizzle_orm_1.eq)(transactions_schema_1.transactions.accountID, accounts_schema_1.accounts.id))
            .leftJoin(categories_schema_1.categories, (0, drizzle_orm_1.eq)(transactions_schema_1.transactions.categoryID, categories_schema_1.categories.id))
            .leftJoin(entities_schema_1.entities, (0, drizzle_orm_1.eq)(transactions_schema_1.transactions.entityID, entities_schema_1.entities.id))
            .where((0, drizzle_orm_1.eq)(transactions_schema_1.transactions.userID, userID))
            .orderBy((0, drizzle_orm_1.desc)(transactions_schema_1.transactions.date), (0, drizzle_orm_1.desc)(transactions_schema_1.transactions.createdAt))
            .limit(5)
            .all();
        const recentTransactions = recentRows.map((tx) => ({
            id: tx.id,
            date: tx.date,
            amount: tx.amount,
            description: tx.description || "",
            type: tx.type,
            createdAt: tx.createdAt,
            accountName: tx.accountName || null,
            categoryName: tx.categoryName || null,
            entityName: tx.entityName || null,
        }));
        return {
            monthlyIncome,
            monthlyExpense,
            monthlyBalance,
            netWorth,
            topCategories,
            recentTransactions,
        };
    },
};
