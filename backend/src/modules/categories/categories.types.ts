import { categories } from "./categories.schema";
import { createCategorySchema, updateCategorySchema } from "./categories.validators";
import z from "zod";

export type Category = typeof categories.$inferSelect;
export type NewCategory = Omit<typeof categories.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;