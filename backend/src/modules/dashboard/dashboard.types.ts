export interface TopCategoryItem {
  id: string | null;
  name: string;
  totalAmount: number;
  percentage: number;
}

export interface RecentTransactionItem {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: string;
  createdAt?: string;
  status?: string;
  installments?: number | null;
  installmentGroupId?: string | null;
  payingAccountID?: string | null;
  accountName?: string | null;
  toAccountName?: string | null;
  categoryName?: string | null;
  entityName?: string | null;
}

export interface PendingInstallmentItem {
  id: string;
  description: string;
  amount: number;
  date: string;
  cardName: string;
  accountID: string;
  status: string;
  installmentGroupId?: string | null;
}

export interface DashboardSummary {
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyBalance: number;
  netWorth: number;
  topCategories: TopCategoryItem[];
  recentTransactions: RecentTransactionItem[];
  pendingInstallments: PendingInstallmentItem[];
}
