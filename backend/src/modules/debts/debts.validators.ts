import z from "zod";

export const createDebtSchema = z.object({
  entityID: z.string().uuid("ID de entidad inválido"),
  type: z.enum(["Payable", "Receivable"], { message: "El tipo debe ser Payable o Receivable" }),
  initialAmount: z
    .number({ message: "El monto debe ser un número" })
    .int("El monto debe ser un número entero")
    .min(0, "El monto inicial debe ser 0 o mayor")
    .max(1000000000, "El monto no puede superar 1.000.000.000")
    .optional()
    .default(0),
});

export const updateDebtSchema = z.object({
  status: z.enum(["Pending", "Settled"], { message: "Estado inválido" }).optional(),
  initialAmount: z
    .number({ message: "El monto debe ser un número" })
    .int("El monto debe ser un número entero")
    .min(0, "El monto inicial debe ser 0 o mayor")
    .max(1000000000, "El monto no puede superar 1.000.000.000")
    .optional(),
});

export const createMovementSchema = z.object({
  type: z.enum(["CHARGE", "PAYMENT"], { message: "El tipo debe ser CHARGE o PAYMENT" }),
  amount: z
    .number({ message: "El monto debe ser un número" })
    .int("El monto debe ser un número entero")
    .positive("El monto debe ser mayor a 0")
    .max(1000000000, "El monto no puede superar 1.000.000.000"),
  description: z
    .string({ message: "La descripción es obligatoria" })
    .min(1, "La descripción es obligatoria")
    .max(255, "Máximo 255 caracteres"),
  date: z
    .string({ message: "La fecha es obligatoria" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD"),
  accountID: z
    .string()
    .uuid("ID de cuenta inválido")
    .optional()
    .nullable()
    .or(z.literal("").transform(() => undefined)),
});

export const updateMovementSchema = z.object({
  description: z.string().min(1, "La descripción no puede estar vacía").max(255, "Máximo 255 caracteres").optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD")
    .optional(),
  amount: z
    .number()
    .int("El monto debe ser un número entero")
    .positive("El monto debe ser mayor a 0")
    .max(1000000000)
    .optional(),
});

// Legacy schema for backward compatibility if any client calls /:id/payments
export const createDebtPaymentSchema = z.object({
  amount: z
    .number({ message: "El monto debe ser un número" })
    .int("El monto debe ser un número entero")
    .positive("El monto a pagar debe ser mayor a 0")
    .max(1000000000, "El monto no puede superar 1.000.000.000"),
  accountID: z
    .string()
    .uuid("ID de cuenta inválido")
    .optional()
    .nullable()
    .or(z.literal("").transform(() => undefined)),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD")
    .optional(),
  notes: z.string().max(255, "Máximo 255 caracteres").nullable().optional(),
});
