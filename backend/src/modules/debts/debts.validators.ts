import z from "zod";

export const createDebtSchema = z.object({
  entityID: z.string().min(1, "La entidad es obligatoria"),
  type: z.enum(["Payable", "Receivable"]),
  description: z.string().min(1, "La descripción es obligatoria"),
  totalAmount: z
    .number()
    .int("El monto debe ser un número entero")
    .positive("El monto total debe ser mayor a 0"),
  dueDate: z.string().nullable().optional(),
});

export const updateDebtSchema = z.object({
  entityID: z.string().min(1, "La entidad no puede estar vacía").optional(),
  type: z.enum(["Payable", "Receivable"]).optional(),
  description: z.string().min(1, "La descripción no puede estar vacía").optional(),
  totalAmount: z
    .number()
    .int("El monto debe ser un número entero")
    .positive("El monto total debe ser mayor a 0")
    .optional(),
  dueDate: z.string().nullable().optional(),
});

export const createDebtPaymentSchema = z.object({
  amount: z
    .number()
    .int("El monto debe ser un número entero")
    .positive("El monto a pagar debe ser mayor a 0"),
  date: z.string().optional(),
  notes: z.string().nullable().optional(),
});
