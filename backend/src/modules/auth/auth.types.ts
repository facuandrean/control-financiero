import z from 'zod';
import { loginSchema, registerSchema } from './auth.validators';
import { sessions } from './auth.schema';

// Tipos de la base de datos (Drizzle)
export type Session = typeof sessions.$inferSelect;
export type NewSession = Omit<typeof sessions.$inferInsert, 'id' | 'createdAt'>;

// Tipos de entrada (Zod)
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// Tipo para la respuesta de tokens
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}