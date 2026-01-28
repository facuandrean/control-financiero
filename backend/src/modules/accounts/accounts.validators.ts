import z from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().trim().optional(),
  lastDigits: z.string().trim().optional(),
  type: z.string().trim(),
});

export const updateAccountSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").optional(),
  description: z.string().trim().optional(),
  lastDigits: z.string().trim().optional(),
  type: z.string().trim().optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
});

