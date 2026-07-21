import z from "zod";

export const createDebtAccountSchema = z.object({
  personName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  type: z.enum(["Cobrar", "Pagar"], "El tipo debe ser 'Cobrar' o 'Pagar'"),
});

export const updateDebtAccountSchema = z.object({
  personName: z.string().min(3, "El nombre debe tener al menos 3 caracteres").optional(),
  type: z.enum(["Cobrar", "Pagar"], "El tipo debe ser 'Cobrar' o 'Pagar'").optional(),
  status: z.enum(["Open", "Settled"]).optional(),
});

