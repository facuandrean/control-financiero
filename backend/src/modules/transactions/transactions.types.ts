import { transactions } from "./transactions.schema";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "./transactions.validators";
import { Account } from "../accounts/accounts.types";
import { Category } from "../categories/categories.types";
import { Entity } from "../entities/entities.types";
import z from "zod";

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

export type TransactionType = "Income" | "Expense" | "Transfer";

export interface TransactionWithDetails extends Transaction {
  account?: Account | null;
  toAccount?: Account | null;
  category?: Category | null;
  entity?: Entity | null;
}

export interface TransactionFilters {
  month?: string | number;
  year?: string | number;
  accountID?: string;
  type?: string;
  page?: string | number;
  pageSize?: string | number;
}
