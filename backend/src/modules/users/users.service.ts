import { eq, sql } from 'drizzle-orm';
import { db } from '@core/db/db';
import { User, UpdateUserInput, NewUser } from './users.types';
import { AppError } from '@core/utils/AppError';
import { users } from './users.schema';
import crypto from 'crypto';

export const userService = {
  // Busca un usuario por ID. Si no existe, corta la ejecución con un 404.
  getUserById: async (id: string): Promise<User> => {
    const user = await db.select().from(users).where(eq(users.id, id)).get();

    if (!user) {
      throw new AppError("Usuario no encontrado", 404, "USER_NOT_FOUND");
    }

    return user;
  },

  // Busca por email. Devuelve el usuario o undefined (no lanza error).
  findByEmail: async (email: string): Promise<User | undefined> => {
    const user = await db.select().from(users).where(eq(users.email, email)).get();
    return user;
  },

  createUser: async (data: NewUser): Promise<User> => {
    const newUser = await db.insert(users).values({
      ...data,
      createdAt: sql`CURRENT_TIMESTAMP`,
      updatedAt: sql`CURRENT_TIMESTAMP`,
      id: crypto.randomUUID(),
    }).returning().get();

    if (!newUser) {
      throw new AppError("No se pudo crear el usuario", 500, "USER_CREATION_FAILED");
    }

    return newUser;
  },

  // Actualiza datos parciales y retorna el registro actualizado.
  updateUser: async (id: string, data: UpdateUserInput): Promise<User> => {
    const updatedUser = await db
      .update(users)
      .set({ 
        ...data, 
        updatedAt: sql`CURRENT_TIMESTAMP` 
      }).where(eq(users.id, id)).returning().get();

    if (!updatedUser) {
      throw new AppError("No se pudo actualizar: Usuario no encontrado", 404, "USER_NOT_FOUND");
    }

    return updatedUser;
  },

  // Borra el registro de la DB
  deleteUser: async (id: string): Promise<void> => {
    const deletedUser = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning().get();

    if (!deletedUser) {
      throw new AppError("No se pudo eliminar: Usuario no encontrado", 404, "USER_NOT_FOUND");
    }
  }
};