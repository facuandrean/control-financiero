import { accounts } from "./accounts.schema";
import { createAccountSchema, updateAccountSchema } from "./accounts.validators";
import z from "zod";

export type Account = typeof accounts.$inferSelect;
export type NewAccount = Omit<typeof accounts.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type CreateAccountInput = z.infer<typeof createAccountSchema>;

