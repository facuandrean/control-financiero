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
    .int("El monto debe ser un número entero")
    .positive("El monto debe ser positivo y mayor a 0")
    .max(1000000000, "El monto no puede superar 1.000.000.000"),
  accountID: z.string().uuid("ID de cuenta inválido"),
  toAccountID: optionalUuid,
  categoryID: optionalUuid,
  entityID: optionalUuid,
  date: z
    .string({ message: "La fecha es obligatoria" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD"),
  description: z.string().min(1, "La descripción es obligatoria").max(255, "Máximo 255 caracteres"),
  installments: z.number().int().min(1).max(72).optional().default(1),
});

export const updateTransactionSchema = z.object({
  type: z.enum(["Income", "Expense", "Transfer"]).optional(),
  amount: z
    .number({ message: "El monto debe ser un número" })
    .int("El monto debe ser un número entero")
    .positive("El monto debe ser positivo y mayor a 0")
    .max(1000000000, "El monto no puede superar 1.000.000.000")
    .optional(),
  accountID: z.string().uuid("ID de cuenta inválido").optional(),
  toAccountID: optionalUuid,
  categoryID: optionalUuid,
  entityID: optionalUuid,
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD")
    .optional(),
  description: z.string().min(1, "La descripción no puede estar vacía").max(255, "Máximo 255 caracteres").optional(),
  installments: z.number().int().min(1).max(72).optional(),
});
