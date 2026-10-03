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
  accountName?: string | null;
  categoryName?: string | null;
  entityName?: string | null;
}

export interface DashboardSummary {
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyBalance: number;
  netWorth: number;
  topCategories: TopCategoryItem[];
  recentTransactions: RecentTransactionItem[];
}
