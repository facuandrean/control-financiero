import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { authService } from './auth.service';
import { userService } from '../users/users.service';
import { sendSuccess } from '../../core/utils/responses';
import { AppError } from '../../core/utils/AppError';
import { sessions } from './auth.schema';
import { db } from '../../core/db/db';
import { eq } from 'drizzle-orm';

export const authController = {
  // POST /register
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name, lastName } = req.body;

      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        throw new AppError("El email ya está registrado", 409, "AUTH_EMAIL_EXISTS");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await userService.createUser({ 
        name, 
        lastName,
        email, 
        password: hashedPassword 
      });

      const { password: _, ...publicUser } = newUser;
      return sendSuccess(res, publicUser, "Usuario registrado con éxito", 201);
    } catch (error) {
      next(error);
    }
  },

  // POST /login
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Validar credenciales
      const user = await userService.findByEmail(email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new AppError("Email o contraseña incorrectos", 401, "AUTH_INVALID_CREDENTIALS");
      }

      // Capturar contexto de la sesión
      const userAgent = req.headers['user-agent'] || 'unknown';
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

      // Crear sesión en DB y generar tokens
      const { accessToken, refreshToken } = await authService.createSession(user.id, userAgent, ipAddress);

      // Enviamos el Refresh Token en una cookie HttpOnly por seguridad
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
      });

      const { password: _, ...publicUser } = user;
      return sendSuccess(res, { user: publicUser, accessToken }, "Login exitoso");
    } catch (error) {
      next(error);
    }
  },

  // POST /refresh
  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // El refresh token viene de la cookie
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        throw new AppError("No se proporcionó Refresh Token", 401, "AUTH_NO_TOKEN");
      }

      const { accessToken } = await authService.validateRefreshToken(refreshToken);

      return sendSuccess(res, { accessToken }, "Token actualizado con éxito");
    } catch (error) {
      next(error);
    }
  },

  // POST /logout
  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken) {
        const hashed = authService.hashToken(refreshToken);
        await db.delete(sessions).where(eq(sessions.tokenHashed, hashed));
      }

      res.clearCookie('refreshToken');
      return sendSuccess(res, null, "Sesión cerrada correctamente");
    } catch (error) {
      next(error);
    }
  }
};