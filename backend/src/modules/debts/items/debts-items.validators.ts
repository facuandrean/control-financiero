import z from "zod";

export const createDebtItemSchema = z.object({
  debtAccountID: z.string().uuid("El ID de la cuenta de deuda debe ser un UUID válido"),
  description: z.string().min(3, "La descripción debe tener al menos 3 caracteres"),
  amount: z.number().int("El monto debe ser un número entero").positive("El monto debe ser mayor a 0"),
});

export const updateDebtItemSchema = z.object({
  description: z.string().min(3, "La descripción debe tener al menos 3 caracteres").optional(),
  amount: z.number().int("El monto debe ser un número entero").positive("El monto debe ser mayor a 0").optional(),
  status: z.enum(["Pending", "Paid"], "El estado debe ser 'Pending' o 'Paid'").optional(),
});