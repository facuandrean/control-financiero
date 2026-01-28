import { db } from "@core/db/db";
import { entities } from "./entities.schema";
import { AppError } from "@core/utils/AppError";
import { Entity, CreateEntityInput, NewEntity, UpdateEntityInput } from "./entities.types";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";

export const entityService = {
  getAllEntities: async (): Promise<Entity[]> => {
    const allEntities = await db.select().from(entities).all();
    if (!allEntities) {
      throw new AppError("No se encontraron entidades", 404, "ENTITIES_NOT_FOUND");
    }
    return allEntities;
  },

  getEntityById: async (id: string): Promise<Entity> => {
    const entity = await db.select().from(entities).where(eq(entities.id, id)).get();
    if (!entity) {
      throw new AppError("Entidad no encontrada", 404, "ENTITY_NOT_FOUND");
    }
    return entity;
  },

  createEntity: async (data: CreateEntityInput & { userID: string }): Promise<NewEntity> => {
    const newEntity = await db.insert(entities).values({
      ...data,
      userID: data.userID,
      id: crypto.randomUUID(),
      status: "Active",
      createdAt: sql`CURRENT_TIMESTAMP`,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).returning().get();

    if (!newEntity) {
      throw new AppError("No se pudo crear la entidad", 500, "ENTITY_CREATION_FAILED");
    }

    return newEntity;
  },

  updateEntity: async (id: string, data: UpdateEntityInput): Promise<Entity> => {
    const updatedEntity = await db.update(entities).set({
      ...data,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).where(eq(entities.id, id)).returning().get();

    if (!updatedEntity) {
      throw new AppError("No se pudo actualizar la entidad", 500, "ENTITY_UPDATE_FAILED");
    }

    return updatedEntity;
  },

  deactivateEntity: async (id: string): Promise<Entity> => {
    const deactivatedEntity = await db.update(entities).set({
      status: "Inactive",
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).where(eq(entities.id, id)).returning().get();

    if (!deactivatedEntity) {
      throw new AppError("No se pudo desactivar la entidad", 500, "ENTITY_DEACTIVATION_FAILED");
    }

    return deactivatedEntity;
  },

  deleteEntity: async (id: string): Promise<void> => {
    const deletedEntity = await db.delete(entities).where(eq(entities.id, id)).returning().get();
    if (!deletedEntity) {
      throw new AppError("No se pudo eliminar la entidad", 500, "ENTITY_DELETION_FAILED");
    }
  },
};

