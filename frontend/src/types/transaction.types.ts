import type { Account } from './account.types';
import type { Category } from './category.types';
import type { Entity } from './entity.types';

export type TransactionType = 'Income' | 'Expense' | 'Transfer';

export interface Transaction {
  id: string;
  userID?: string;
  type: TransactionType;
  amount: number;
  accountID: string;
  toAccountID?: string | null;
  categoryID?: string | null;
  entityID?: string | null;
  date: string;
  description: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;

  // Populated fields
  account?: Account | null;
  toAccount?: Account | null;
  category?: Category | null;
  entity?: Entity | null;
}

export interface CreateTransactionDTO {
  type: TransactionType;
  amount: number;
  accountID: string;
  toAccountID?: string | null;
  categoryID?: string | null;
  entityID?: string | null;
  date: string;
  description: string;
  installments?: number;
}

export interface UpdateTransactionDTO {
  type?: TransactionType;
  amount?: number;
  accountID?: string;
  toAccountID?: string | null;
  categoryID?: string | null;
  entityID?: string | null;
  date?: string;
  description?: string;
  installments?: number;
}

export interface TransactionFilters {
  month?: string | number;
  year?: string | number;
  accountID?: string;
  type?: string;
}
