import z from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(255, "Máximo 255 caracteres"),
  bank: z.string().min(3, "El banco o entidad es obligatorio").max(255, "Máximo 255 caracteres"),
  type: z.enum(["Efectivo", "Billetera virtual", "Caja de ahorro", "Cuenta corriente", "Tarjeta de Crédito"], "El tipo debe ser uno de los valores válidos"),
  tag: z.enum(["efectivo", "billetera", "ahorro", "corriente", "crédito"]),
  amount: z.number().max(1000000000, "Monto máximo superado").default(0).optional(),
  description: z.string().trim().max(255, "Máximo 255 caracteres").optional(),
  lastDigits: z.string().trim().max(10, "Máximo 10 caracteres").optional(),

  // Campos de Tarjeta de Crédito
  creditLimit: z.number().positive().max(1000000000).optional(),
  closingDay: z.number().min(1).max(31).optional(),
  dueDate: z.number().min(1).max(31).optional(),
});

export const updateAccountSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(255, "Máximo 255 caracteres").optional(),
  description: z.string().trim().max(255, "Máximo 255 caracteres").optional(),
  lastDigits: z.string().trim().max(10, "Máximo 10 caracteres").optional(),
  type: z.enum(["Efectivo", "Billetera virtual", "Caja de ahorro", "Cuenta corriente", "Tarjeta de Crédito"], "El tipo debe ser uno de los valores válidos").optional(),
  tag: z.enum(["efectivo", "billetera", "ahorro", "corriente", "crédito"], "El tag debe ser uno de los valores válidos").optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
  bank: z.string().min(3, "El banco debe tener al menos 3 caracteres").max(255, "Máximo 255 caracteres").optional(),
  
  dueDate: z.number().min(1).max(31).optional(),
  closingDay: z.number().min(1).max(31).optional(),
  creditLimit: z.number().positive().max(1000000000).optional(),
});

