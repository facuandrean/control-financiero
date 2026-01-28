import { db } from "../../core/db/db"
import { categories } from "./categories.schema"
import { Category, CreateCategoryInput, NewCategory, UpdateCategoryInput } from "./categories.types"
import { AppError } from "../../core/utils/AppError";
import { and, eq, sql } from "drizzle-orm";
import crypto from "crypto";

export const categoryService = {
  getAllCategories: async (userID: string): Promise<Category[]> => {
    const allCategories = await db.select().from(categories).where(eq(categories.userID, userID)).all();
    if (!allCategories) {
      throw new AppError("No se encontraron categorías", 404, "CATEGORIES_NOT_FOUND");
    }
    return allCategories;
  },

  getCategoryById: async (id: string, userID: string): Promise<Category> => {
    const category = await db.select().from(categories).where(and(eq(categories.id, id), eq(categories.userID, userID))).get();
    if (!category) {
      throw new AppError("Categoría no encontrada", 404, "CATEGORY_NOT_FOUND");
    }
    return category;
  },

  createCategory: async (data: CreateCategoryInput & { userID: string }): Promise<NewCategory> => {
    const newCategory = await db.insert(categories).values({
      ...data,
      userID: data.userID,
      id: crypto.randomUUID(),
      status: "Active",
      createdAt: sql`CURRENT_TIMESTAMP`,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).returning().get();

    if (!newCategory) {
      throw new AppError("No se pudo crear la categoría", 500, "CATEGORY_CREATION_FAILED");
    }

    return newCategory;
  },

  updateCategory: async (id: string, data: UpdateCategoryInput): Promise<Category> => {
    const updatedCategory = await db.update(categories).set({
      ...data,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).where(eq(categories.id, id)).returning().get();

    if (!updatedCategory) {
      throw new AppError("No se pudo actualizar la categoría", 500, "CATEGORY_UPDATE_FAILED");
    }

    return updatedCategory;
  },

  deactivateCategory: async (id: string): Promise<Category> => {
    const deactivatedCategory = await db.update(categories).set({
      status: "Inactive",
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).where(eq(categories.id, id)).returning().get();

    if (!deactivatedCategory) {
      throw new AppError("No se pudo desactivar la categoría", 500, "CATEGORY_DEACTIVATION_FAILED");
    }

    return deactivatedCategory;
  },

  deleteCategory: async (id: string): Promise<void> => {
    const deletedCategory = await db.delete(categories).where(eq(categories.id, id)).returning().get();
    if (!deletedCategory) {
      throw new AppError("No se pudo eliminar la categoría", 500, "CATEGORY_DELETION_FAILED");
    }
  },
}