import z from "zod";

export const createAccountSchema = z.object({
  name: z
    .string({ message: "El nombre debe ser un texto" })
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(255, "Máximo 255 caracteres"),
  bank: z
    .string({ message: "El banco o entidad es obligatorio" })
    .min(3, "El banco o entidad es obligatorio")
    .max(255, "Máximo 255 caracteres"),
  type: z.enum(
    ["Efectivo", "Billetera virtual", "Caja de ahorro", "Cuenta corriente", "Tarjeta de Crédito"],
    { message: "El tipo de cuenta debe ser uno de los valores válidos" }
  ),
  tag: z.enum(
    ["efectivo", "billetera", "ahorro", "corriente", "crédito"],
    { message: "La etiqueta de cuenta no es válida" }
  ),
  amount: z
    .number({ message: "El saldo inicial debe ser un número válido" })
    .max(1000000000, "Monto máximo superado (1.000.000.000)")
    .default(0)
    .optional()
    .nullable(),
  description: z
    .string({ message: "La descripción debe ser un texto" })
    .trim()
    .max(255, "Máximo 255 caracteres")
    .optional()
    .nullable(),
  lastDigits: z
    .string({ message: "Los últimos dígitos deben ser texto" })
    .trim()
    .max(10, "Máximo 10 caracteres")
    .optional()
    .nullable(),

  // Campos de Tarjeta de Crédito
  creditLimit: z
    .number({ message: "El límite de crédito debe ser un número" })
    .positive("El límite de crédito debe ser mayor a 0")
    .max(1000000000, "Límite máximo superado")
    .optional()
    .nullable(),
  closingDay: z.number().int().min(1).max(31).optional().nullable(),
  dueDate: z.number().int().min(1).max(31).optional().nullable(),
});

export const updateAccountSchema = z.object({
  name: z
    .string({ message: "El nombre debe ser un texto" })
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(255, "Máximo 255 caracteres")
    .optional(),
  description: z
    .string({ message: "La descripción debe ser un texto" })
    .trim()
    .max(255, "Máximo 255 caracteres")
    .optional()
    .nullable(),
  lastDigits: z
    .string({ message: "Los últimos dígitos deben ser texto" })
    .trim()
    .max(10, "Máximo 10 caracteres")
    .optional()
    .nullable(),
  type: z
    .enum(
      ["Efectivo", "Billetera virtual", "Caja de ahorro", "Cuenta corriente", "Tarjeta de Crédito"],
      { message: "El tipo de cuenta debe ser uno de los valores válidos" }
    )
    .optional(),
  tag: z
    .enum(
      ["efectivo", "billetera", "ahorro", "corriente", "crédito"],
      { message: "La etiqueta de cuenta no es válida" }
    )
    .optional(),
  status: z
    .enum(["Active", "Inactive"], { message: "El estado debe ser Activo o Inactivo" })
    .optional(),
  bank: z
    .string({ message: "El banco debe ser un texto" })
    .min(3, "El banco debe tener al menos 3 caracteres")
    .max(255, "Máximo 255 caracteres")
    .optional(),
  amount: z
    .number({ message: "El saldo debe ser un número válido" })
    .max(1000000000, "Monto máximo superado")
    .optional()
    .nullable(),

  dueDate: z.number().int().min(1).max(31).optional().nullable(),
  closingDay: z.number().int().min(1).max(31).optional().nullable(),
  creditLimit: z
    .number({ message: "El límite de crédito debe ser un número positivo" })
    .positive("El límite de crédito debe ser mayor a 0")
    .max(1000000000, "Límite máximo superado")
    .optional()
    .nullable(),
});
