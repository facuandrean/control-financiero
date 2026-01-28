import z from 'zod';
import { users } from './users.schema';
import { updateUserSchema, changePasswordSchema } from './users.validators';

export type User = typeof users.$inferSelect;
export type NewUser = Omit<typeof users.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export type UserPublicProfile = Omit<User, 'password'>;