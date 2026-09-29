import type { Entity } from './entity.types';

export type DebtType = 'Payable' | 'Receivable';
export type DebtStatus = 'Pending' | 'Settled' | 'Partial';
export type MovementType = 'CHARGE' | 'PAYMENT';

export interface DebtMovement {
  id: string;
  debtID: string;
  type: MovementType;
  amount: number;
  description: string;
  date: string;
  transactionID?: string | null;
  createdAt?: string;
}

// Alias de retrocompatibilidad
export type DebtPayment = DebtMovement;

export interface Debt {
  id: string;
  userID?: string;
  entityID: string;
  type: DebtType;
  initialAmount: number;
  status: DebtStatus;
  createdAt?: string;
  updatedAt?: string;
  entity?: Entity | null;
  balance?: number;
  remainingAmount?: number;
  totalCharges?: number;
  totalPayments?: number;
  movements?: DebtMovement[];
  // Campos de compatibilidad y conveniencia
  totalAmount?: number;
  totalPaid?: number;
  paidAmount?: number;
  description?: string;
  dueDate?: string | null;
  payments?: DebtMovement[];
}

export interface CreateDebtDTO {
  entityID: string;
  type: DebtType;
  initialAmount?: number;
  description?: string;
  amount?: number;
}

export interface UpdateDebtDTO {
  status?: DebtStatus;
}

export interface CreateMovementDTO {
  type: MovementType;
  amount: number;
  description: string;
  date: string;
  accountID?: string | null;
}

export interface CreateDebtPaymentDTO {
  amount: number;
  accountID: string;
  date?: string;
  notes?: string | null;
}
