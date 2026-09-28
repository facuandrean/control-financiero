import z from "zod";

export const createTransactionSchema = z.object({
  type: z.enum(["Income", "Expense", "Transfer"]),
  amount: z
    .number()
    .int("El monto debe ser un número entero")
    .positive("El monto debe ser positivo y mayor a 0"),
  accountID: z.string().min(1, "La cuenta origen es obligatoria"),
  toAccountID: z.string().nullable().optional(),
  categoryID: z.string().nullable().optional(),
  entityID: z.string().nullable().optional(),
  date: z.string().min(1, "La fecha es obligatoria"),
  description: z.string().min(1, "La descripción es obligatoria"),
});

export const updateTransactionSchema = z.object({
  type: z.enum(["Income", "Expense", "Transfer"]).optional(),
  amount: z
    .number()
    .int("El monto debe ser un número entero")
    .positive("El monto debe ser positivo y mayor a 0")
    .optional(),
  accountID: z.string().min(1, "La cuenta origen no puede estar vacía").optional(),
  toAccountID: z.string().nullable().optional(),
  categoryID: z.string().nullable().optional(),
  entityID: z.string().nullable().optional(),
  date: z.string().min(1, "La fecha no puede estar vacía").optional(),
  description: z.string().min(1, "La descripción no puede estar vacía").optional(),
});
