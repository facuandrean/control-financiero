import z from "zod";

export const createDebtSchema = z.object({
  entityID: z.string().uuid("ID de entidad inválido"),
  type: z.enum(["Payable", "Receivable"]),
  description: z.string().min(1, "La descripción es obligatoria").max(255, "Máximo 255 caracteres"),
  totalAmount: z
    .number({ message: "El monto debe ser un número" })
    .positive("El monto total debe ser mayor a 0")
    .max(1000000000, "El monto no puede superar 1.000.000.000"),
  dueDate: z.string().max(50, "Fecha inválida").nullable().optional().or(z.literal("").transform(() => null)),
});

export const updateDebtSchema = z.object({
  entityID: z.string().uuid("ID de entidad inválido").optional(),
  type: z.enum(["Payable", "Receivable"]).optional(),
  description: z.string().min(1, "La descripción no puede estar vacía").max(255, "Máximo 255 caracteres").optional(),
  totalAmount: z
    .number({ message: "El monto debe ser un número" })
    .positive("El monto total debe ser mayor a 0")
    .max(1000000000, "El monto no puede superar 1.000.000.000")
    .optional(),
  dueDate: z.string().max(50, "Fecha inválida").nullable().optional().or(z.literal("").transform(() => null)),
});

export const createDebtPaymentSchema = z.object({
  amount: z
    .number({ message: "El monto debe ser un número" })
    .positive("El monto a pagar debe ser mayor a 0")
    .max(1000000000, "El monto no puede superar 1.000.000.000"),
  accountID: z.string().uuid("ID de cuenta inválido"),
  date: z.string().max(50, "Fecha inválida").optional(),
  notes: z.string().max(255, "Máximo 255 caracteres").nullable().optional(),
});
