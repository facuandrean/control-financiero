import z from "zod";

const optionalUuid = z
  .string()
  .uuid("Formato de ID inválido")
  .nullable()
  .optional()
  .or(z.literal("").transform(() => null));

export const createTransactionSchema = z.object({
  type: z.enum(["Income", "Expense", "Transfer"]),
  amount: z
    .number({ message: "El monto debe ser un número" })
    .positive("El monto debe ser positivo y mayor a 0")
    .max(1000000000, "El monto no puede superar 1.000.000.000"),
  accountID: z.string().uuid("ID de cuenta inválido"),
  toAccountID: optionalUuid,
  categoryID: optionalUuid,
  entityID: optionalUuid,
  date: z.string().min(1, "La fecha es obligatoria").max(50, "Fecha inválida"),
  description: z.string().min(1, "La descripción es obligatoria").max(255, "Máximo 255 caracteres"),
  installments: z.number().int().min(1).max(72).optional().default(1),
});

export const updateTransactionSchema = z.object({
  type: z.enum(["Income", "Expense", "Transfer"]).optional(),
  amount: z
    .number({ message: "El monto debe ser un número" })
    .positive("El monto debe ser positivo y mayor a 0")
    .max(1000000000, "El monto no puede superar 1.000.000.000")
    .optional(),
  accountID: z.string().uuid("ID de cuenta inválido").optional(),
  toAccountID: optionalUuid,
  categoryID: optionalUuid,
  entityID: optionalUuid,
  date: z.string().min(1, "La fecha no puede estar vacía").max(50, "Fecha inválida").optional(),
  description: z.string().min(1, "La descripción no puede estar vacía").max(255, "Máximo 255 caracteres").optional(),
  installments: z.number().int().min(1).max(72).optional(),
});
