import { debtAccounts } from "./debts-accounts.schema";
import { createDebtAccountSchema, updateDebtAccountSchema } from "./debts-accounts.validators";
import z from "zod";

export type DebtAccount = typeof debtAccounts.$inferSelect;
export type NewDebtAccount = Omit<typeof debtAccounts.$inferInsert, 'id' | 'status' | 'createdAt' | 'updatedAt'>; 

export type CreateDebtAccountInput = z.infer<typeof createDebtAccountSchema>;
export type UpdateDebtAccountInput = z.infer<typeof updateDebtAccountSchema>;

