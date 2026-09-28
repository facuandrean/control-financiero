import type { Entity } from './entity.types';

export type DebtType = 'Payable' | 'Receivable';
export type DebtStatus = 'Pending' | 'Partial' | 'Settled';

export interface Debt {
  id?: string;
  userID?: string;
  entityID: string;
  type: DebtType;
  description: string;
  totalAmount: number;
  status?: DebtStatus;
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  entity?: Entity | null;
  totalPaid?: number;
  paidAmount?: number;
  remainingAmount?: number;
  payments?: DebtPayment[];
}

export interface DebtPayment {
  id?: string;
  debtID?: string;
  amount: number;
  date?: string;
  notes?: string | null;
  transactionID?: string | null;
  createdAt?: string;
}

export interface CreateDebtDTO {
  entityID: string;
  type: DebtType;
  description: string;
  totalAmount: number;
  dueDate?: string | null;
}

export interface UpdateDebtDTO {
  entityID?: string;
  type?: DebtType;
  description?: string;
  totalAmount?: number;
  dueDate?: string | null;
}

export interface CreateDebtPaymentDTO {
  amount: number;
  accountID: string;
  date?: string;
  notes?: string | null;
}
