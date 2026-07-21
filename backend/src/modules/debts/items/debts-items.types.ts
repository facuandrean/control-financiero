import z from "zod";
import { debtItems } from "./debts-items.schema";
import { createDebtItemSchema, updateDebtItemSchema } from "./debts-items.validators";

export type DebtItem = typeof debtItems.$inferSelect;
export type InsertDebtItem = typeof debtItems.$inferInsert;

export type CreateDebtItemInput = z.infer<typeof createDebtItemSchema>;
export type UpdateDebtItemInput = z.infer<typeof updateDebtItemSchema>;