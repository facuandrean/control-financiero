import z from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().trim().optional()
});

export const updateCategorySchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").optional(),
  description: z.string().trim().optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
});