import { entities } from "./entities.schema";
import { createEntitySchema, updateEntitySchema } from "./entities.validators";
import z from "zod";

export type Entity = typeof entities.$inferSelect;
export type NewEntity = Omit<typeof entities.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateEntityInput = z.infer<typeof updateEntitySchema>;
export type CreateEntityInput = z.infer<typeof createEntitySchema>;

