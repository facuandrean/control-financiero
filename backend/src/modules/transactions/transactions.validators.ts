import z from "zod";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const createTransactionSchema = z.object({
  accountID: z.string().regex(uuidRegex, "El ID de la cuenta debe ser un UUID válido"),
  categoryID: z.string().regex(uuidRegex, "El ID de la categoría debe ser un UUID válido"),
  entityID: z.string().regex(uuidRegex, "El ID de la entidad debe ser un UUID válido"),
  amount: z.number().positive("El monto debe ser mayor a 0"),
  type: z.enum(["Income", "Expense"], { message: "El tipo debe ser Income o Expense" }),
  description: z.string().trim().optional(),
});

export const updateTransactionSchema = z.object({
  status: z.enum(["Recorded", "Reverted"]),
});

