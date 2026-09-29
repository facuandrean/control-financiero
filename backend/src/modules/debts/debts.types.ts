import { debts, debtMovements } from "./debts.schema";
import { z } from "zod";
import {
  createDebtSchema,
  updateDebtSchema,
  createMovementSchema,
  updateMovementSchema,
  createDebtPaymentSchema,
} from "./debts.validators";
import { Entity } from "../entities/entities.types";

export type Debt = typeof debts.$inferSelect;
export type NewDebt = typeof debts.$inferInsert;

export type DebtMovement = typeof debtMovements.$inferSelect;
export type NewDebtMovement = typeof debtMovements.$inferInsert;

export type CreateDebtDTO = z.infer<typeof createDebtSchema>;
export type UpdateDebtDTO = z.infer<typeof updateDebtSchema>;
export type CreateMovementDTO = z.infer<typeof createMovementSchema>;
export type UpdateMovementDTO = z.infer<typeof updateMovementSchema>;

// Aliases for backward compatibility
export type DebtPayment = DebtMovement;
export type CreateDebtPaymentDTO = z.infer<typeof createDebtPaymentSchema>;

export interface DebtWithDetails extends Debt {
  entity?: Entity | null;
  balance: number;
  totalCharges: number;
  totalPayments: number;
  remainingAmount: number;
  totalAmount: number; // Backward compatibility: initialAmount + totalCharges
  totalPaid: number;   // Backward compatibility: totalPayments
  paidAmount: number;  // Backward compatibility: totalPayments
  movements?: DebtMovement[];
  payments?: DebtMovement[]; // Backward compatibility
}

export interface DebtDetailResponse extends DebtWithDetails {
  movements: DebtMovement[];
  payments: DebtMovement[];
}
