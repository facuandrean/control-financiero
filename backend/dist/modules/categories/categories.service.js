"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryService = void 0;
const db_1 = require("../../core/db/db");
const categories_schema_1 = require("./categories.schema");
const AppError_1 = require("../../core/utils/AppError");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
exports.categoryService = {
    getAllCategories: async (userID) => {
        const allCategories = await db_1.db.select().from(categories_schema_1.categories).where((0, drizzle_orm_1.eq)(categories_schema_1.categories.userID, userID)).all();
        if (!allCategories) {
            throw new AppError_1.AppError("No se encontraron categorías", 404, "CATEGORIES_NOT_FOUND");
        }
        return allCategories;
    },
    getCategoryById: async (id, userID) => {
        const category = await db_1.db.select().from(categories_schema_1.categories).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(categories_schema_1.categories.id, id), (0, drizzle_orm_1.eq)(categories_schema_1.categories.userID, userID))).get();
        if (!category) {
            throw new AppError_1.AppError("Categoría no encontrada", 404, "CATEGORY_NOT_FOUND");
        }
        return category;
    },
    createCategory: async (data) => {
        const newCategory = await db_1.db.insert(categories_schema_1.categories).values({
            ...data,
            userID: data.userID,
            id: crypto_1.default.randomUUID(),
            status: "Active",
            createdAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        }).returning().get();
        if (!newCategory) {
            throw new AppError_1.AppError("No se pudo crear la categoría", 500, "CATEGORY_CREATION_FAILED");
        }
        return newCategory;
    },
    updateCategory: async (id, userID, data) => {
        const updatedCategory = await db_1.db
            .update(categories_schema_1.categories)
            .set({
            ...data,
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(categories_schema_1.categories.id, id), (0, drizzle_orm_1.eq)(categories_schema_1.categories.userID, userID)))
            .returning()
            .get();
        if (!updatedCategory) {
            throw new AppError_1.AppError("No se pudo actualizar la categoría", 500, "CATEGORY_UPDATE_FAILED");
        }
        return updatedCategory;
    },
    deactivateCategory: async (id, userID) => {
        const deactivatedCategory = await db_1.db
            .update(categories_schema_1.categories)
            .set({
            status: "Inactive",
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(categories_schema_1.categories.id, id), (0, drizzle_orm_1.eq)(categories_schema_1.categories.userID, userID)))
            .returning()
            .get();
        if (!deactivatedCategory) {
            throw new AppError_1.AppError("No se pudo desactivar la categoría", 500, "CATEGORY_DEACTIVATION_FAILED");
        }
        return deactivatedCategory;
    },
    deleteCategory: async (id, userID) => {
        const deletedCategory = await db_1.db
            .delete(categories_schema_1.categories)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(categories_schema_1.categories.id, id), (0, drizzle_orm_1.eq)(categories_schema_1.categories.userID, userID)))
            .returning()
            .get();
        if (!deletedCategory) {
            throw new AppError_1.AppError("No se pudo eliminar la categoría", 500, "CATEGORY_DELETION_FAILED");
        }
    },
};
