import z from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  bank: z.string().min(3, "El banco o entidad es obligatorio"),
  type: z.enum(["Efectivo", "Billetera virtual", "Caja de ahorro", "Cuenta corriente", "Tarjeta de Crédito"], "El tipo debe ser uno de los valores válidos"),
  tag: z.enum(["efectivo", "billetera", "ahorro", "corriente", "crédito"]),
  amount: z.number().default(0).optional(),
  description: z.string().trim().optional(),
  lastDigits: z.string().trim().optional(),

  // Campos de Tarjeta de Crédito
  creditLimit: z.number().optional(),
  closingDay: z.number().min(1).max(31).optional(),
  dueDate: z.number().min(1).max(31).optional(),
});

export const updateAccountSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").optional(),
  description: z.string().trim().optional(),
  lastDigits: z.string().trim().optional(),
  type: z.enum(["Efectivo", "Billetera virtual", "Caja de ahorro", "Cuenta corriente", "Tarjeta de Crédito"], "El tipo debe ser uno de los valores válidos").optional(),
  tag: z.enum(["efectivo", "billetera", "ahorro", "corriente", "crédito"], "El tag debe ser uno de los valores válidos").optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
  bank: z.string().min(3, "El banco debe tener al menos 3 caracteres").optional(),
  amount: z.number().default(0).optional(),
  
  dueDate: z.number().optional(),
  closingDay: z.number().optional(),
  creditLimit: z.number().optional(),
});

