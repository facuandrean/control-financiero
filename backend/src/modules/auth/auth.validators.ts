import { z } from "zod";

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

export const registerSchema = z.object({
  email: z.string().email("Email inválido").min(1, "El email es requerido"),
  password: z.string()
    .min(8, "Mínimo 8 caracteres")
    .regex(passwordRegex, "Debe contener letra y número"),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});