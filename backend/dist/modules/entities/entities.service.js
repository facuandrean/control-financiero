"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.entityService = void 0;
const db_1 = require("../../core/db/db");
const entities_schema_1 = require("./entities.schema");
const AppError_1 = require("../../core/utils/AppError");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
exports.entityService = {
    getAllEntities: async (userID) => {
        const allEntities = await db_1.db.select().from(entities_schema_1.entities).where((0, drizzle_orm_1.eq)(entities_schema_1.entities.userID, userID)).all();
        if (!allEntities) {
            throw new AppError_1.AppError("No se encontraron entidades", 404, "ENTITIES_NOT_FOUND");
        }
        return allEntities;
    },
    getEntityById: async (id, userID) => {
        const entity = await db_1.db.select().from(entities_schema_1.entities).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(entities_schema_1.entities.id, id), (0, drizzle_orm_1.eq)(entities_schema_1.entities.userID, userID))).get();
        if (!entity) {
            throw new AppError_1.AppError("Entidad no encontrada", 404, "ENTITY_NOT_FOUND");
        }
        return entity;
    },
    createEntity: async (data) => {
        const newEntity = await db_1.db.insert(entities_schema_1.entities).values({
            ...data,
            userID: data.userID,
            id: crypto_1.default.randomUUID(),
            status: "Active",
            createdAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        }).returning().get();
        if (!newEntity) {
            throw new AppError_1.AppError("No se pudo crear la entidad", 500, "ENTITY_CREATION_FAILED");
        }
        return newEntity;
    },
    updateEntity: async (id, data) => {
        const updatedEntity = await db_1.db.update(entities_schema_1.entities).set({
            ...data,
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        }).where((0, drizzle_orm_1.eq)(entities_schema_1.entities.id, id)).returning().get();
        if (!updatedEntity) {
            throw new AppError_1.AppError("No se pudo actualizar la entidad", 500, "ENTITY_UPDATE_FAILED");
        }
        return updatedEntity;
    },
    deactivateEntity: async (id) => {
        const deactivatedEntity = await db_1.db.update(entities_schema_1.entities).set({
            status: "Inactive",
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        }).where((0, drizzle_orm_1.eq)(entities_schema_1.entities.id, id)).returning().get();
        if (!deactivatedEntity) {
            throw new AppError_1.AppError("No se pudo desactivar la entidad", 500, "ENTITY_DEACTIVATION_FAILED");
        }
        return deactivatedEntity;
    },
    deleteEntity: async (id) => {
        const deletedEntity = await db_1.db.delete(entities_schema_1.entities).where((0, drizzle_orm_1.eq)(entities_schema_1.entities.id, id)).returning().get();
        if (!deletedEntity) {
            throw new AppError_1.AppError("No se pudo eliminar la entidad", 500, "ENTITY_DELETION_FAILED");
        }
    },
};
