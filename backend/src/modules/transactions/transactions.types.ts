import { transactions } from "./transactions.schema";
import { createTransactionSchema, updateTransactionSchema } from "./transactions.validators";
import z from "zod";

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

