import { debts, debtPayments } from "./debts.schema";
import { z } from "zod";
import {
  createDebtSchema,
  updateDebtSchema,
  createDebtPaymentSchema,
} from "./debts.validators";
import { Entity } from "../entities/entities.types";

export type Debt = typeof debts.$inferSelect;
export type NewDebt = typeof debts.$inferInsert;

export type DebtPayment = typeof debtPayments.$inferSelect;
export type NewDebtPayment = typeof debtPayments.$inferInsert;

export type CreateDebtDTO = z.infer<typeof createDebtSchema>;
export type UpdateDebtDTO = z.infer<typeof updateDebtSchema>;
export type CreateDebtPaymentDTO = z.infer<typeof createDebtPaymentSchema>;

export interface DebtWithDetails extends Debt {
  entity?: Entity | null;
  totalPaid: number;
  remainingAmount: number;
  payments?: DebtPayment[];
}

export interface DebtDetailResponse extends DebtWithDetails {
  payments: DebtPayment[];
}
