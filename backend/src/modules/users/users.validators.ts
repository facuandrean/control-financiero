import { z } from "zod";

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

export const updateUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8).regex(passwordRegex).optional(), 
}).partial();

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string().min(8).regex(passwordRegex),
  confirmPassword: z.string().min(1)
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas nuevas no coinciden",
  path: ["confirmPassword"],
});