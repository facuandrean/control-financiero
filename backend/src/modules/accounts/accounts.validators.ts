import z from "zod";

const VALID_ACCOUNT_TYPES = [
  "Efectivo",
  "Billetera virtual",
  "Caja de ahorro",
  "Cuenta corriente",
  "Tarjeta de Crédito",
] as const;

const VALID_ACCOUNT_TAGS = [
  "efectivo",
  "billetera",
  "ahorro",
  "corriente",
  "crédito",
] as const;

const accountTypeSchema = z.preprocess(
  (val) => {
    if (typeof val === "string") {
      const match = VALID_ACCOUNT_TYPES.find(
        (t) => t.toLowerCase() === val.trim().toLowerCase()
      );
      if (match) return match;
    }
    return val;
  },
  z.enum(VALID_ACCOUNT_TYPES, {
    message: "El tipo de cuenta debe ser uno de los valores válidos",
  })
);

const accountTagSchema = z.preprocess(
  (val) => {
    if (typeof val === "string") {
      const normalized = val.trim().toLowerCase();
      if (normalized === "credito") return "crédito";
      const match = VALID_ACCOUNT_TAGS.find((t) => t.toLowerCase() === normalized);
      if (match) return match;
    }
    return val;
  },
  z.enum(VALID_ACCOUNT_TAGS, {
    message: "La etiqueta de cuenta no es válida",
  })
);

export const createAccountSchema = z.object({
  name: z
    .string({ message: "El nombre debe ser un texto" })
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(255, "Máximo 255 caracteres"),
  bank: z
    .string({ message: "El banco o entidad es obligatorio" })
    .min(3, "El banco o entidad es obligatorio")
    .max(255, "Máximo 255 caracteres"),
  type: accountTypeSchema,
  tag: accountTagSchema,
  amount: z
    .number({ message: "El saldo inicial debe ser un número válido" })
    .int("El saldo debe ser un número entero")
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
    .int("El límite de crédito debe ser un número entero")
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
  type: accountTypeSchema.optional(),
  tag: accountTagSchema.optional(),
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
    .int("El saldo debe ser un número entero")
    .max(1000000000, "Monto máximo superado")
    .optional()
    .nullable(),

  dueDate: z.number().int().min(1).max(31).optional().nullable(),
  closingDay: z.number().int().min(1).max(31).optional().nullable(),
  creditLimit: z
    .number({ message: "El límite de crédito debe ser un número positivo" })
    .int("El límite de crédito debe ser un número entero")
    .positive("El límite de crédito debe ser mayor a 0")
    .max(1000000000, "Límite máximo superado")
    .optional()
    .nullable(),
});
