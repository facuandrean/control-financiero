import { db } from "../../core/db/db";
import { transactions } from "../transactions/transactions.schema";
import { accounts } from "../accounts/accounts.schema";
import { categories } from "../categories/categories.schema";
import { entities } from "../entities/entities.schema";
import { and, desc, eq, like, aliasedTable } from "drizzle-orm";
import { debtService } from "../debts/debts.service";
import { DashboardSummary } from "./dashboard.types";

const toAccounts = aliasedTable(accounts, "to_accounts");

export const dashboardService = {
  getSummary: async (
    userID: string,
    month?: number | string,
    year?: number | string
  ): Promise<DashboardSummary> => {
    const now = new Date();
    const currentYear = year ? Number(year) : now.getFullYear();
    const currentMonth = month ? Number(month) : now.getMonth() + 1;
    const formattedMonth = String(currentMonth).padStart(2, "0");

    // 1. & 2. Income and Expense transactions for the given month
    const monthTransactions = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        amount: transactions.amount,
        categoryID: transactions.categoryID,
        categoryName: categories.name,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryID, categories.id))
      .where(
        and(
          eq(transactions.userID, userID),
          like(transactions.date, `${currentYear}-${formattedMonth}%`)
        )
      )
      .all();

    let monthlyIncome = 0;
    let monthlyExpense = 0;
    const expenseByCategory: Record<
      string,
      { id: string | null; name: string; totalAmount: number }
    > = {};

    for (const tx of monthTransactions) {
      if (tx.type === "Income") {
        monthlyIncome += tx.amount;
      } else if (tx.type === "Expense") {
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
    const userAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userID, userID))
      .all();

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

    const totalAccountsBalance = userAccounts
      .filter((acc) => acc.status === "Active" || (acc.amount !== null && acc.amount !== 0))
      .reduce((sum, acc) => {
        if (isCreditCard(acc.type, acc.tag)) {
          return sum - (acc.amount || 0);
        }
        return sum + (acc.amount || 0);
      }, 0);

    // Menos la suma del saldo pendiente de deudas activas tipo 'Payable', más las deudas activas tipo 'Receivable'
    const allDebts = await debtService.getDebts(userID);
    const totalPendingPayableDebts = allDebts
      .filter((debt) => debt.type === "Payable" && debt.status !== "Settled")
      .reduce((sum, debt) => sum + (debt.remainingAmount || 0), 0);

    const totalPendingReceivableDebts = allDebts
      .filter((debt) => debt.type === "Receivable" && debt.status !== "Settled")
      .reduce((sum, debt) => sum + (debt.remainingAmount || 0), 0);

    const netWorth = totalAccountsBalance - totalPendingPayableDebts + totalPendingReceivableDebts;

    // 5. Top Categories (3 o 4 categorías en las que más se gastó en el mes)
    const sortedCategories = Object.values(expenseByCategory).sort(
      (a, b) => b.totalAmount - a.totalAmount
    );

    const topCategories = sortedCategories.slice(0, 4).map((cat) => ({
      ...cat,
      percentage:
        monthlyExpense > 0
          ? Math.round((cat.totalAmount / monthlyExpense) * 100)
          : 0,
    }));

    // 6. Recent Transactions (Últimas 5 transacciones)
    const recentRows = await db
      .select({
        id: transactions.id,
        date: transactions.date,
        amount: transactions.amount,
        description: transactions.description,
        type: transactions.type,
        createdAt: transactions.createdAt,
        accountName: accounts.name,
        toAccountName: toAccounts.name,
        categoryName: categories.name,
        entityName: entities.name,
      })
      .from(transactions)
      .leftJoin(accounts, eq(transactions.accountID, accounts.id))
      .leftJoin(toAccounts, eq(transactions.toAccountID, toAccounts.id))
      .leftJoin(categories, eq(transactions.categoryID, categories.id))
      .leftJoin(entities, eq(transactions.entityID, entities.id))
      .where(eq(transactions.userID, userID))
      .orderBy(desc(transactions.date), desc(transactions.createdAt))
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
      toAccountName: tx.toAccountName || null,
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
