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

      const user = await userService.findByEmail(email);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new AppError("Email o contraseña incorrectos", 401, "AUTH_INVALID_CREDENTIALS");
      }

      const userAgent = req.headers['user-agent'] || 'unknown';
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

      const { accessToken, refreshToken } = await authService.createSession(user.id, userAgent, ipAddress);

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
      };

      res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000 // 15 minutos
      });

      res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
      });

      const { password: _, ...publicUser } = user;

      return sendSuccess(res, { user: publicUser }, "Login exitoso");
    } catch (error) {
      next(error);
    }
  },

  // POST /refresh
  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        throw new AppError("No se proporcionó Refresh Token", 401, "AUTH_NO_TOKEN");
      }

      const { accessToken } = await authService.validateRefreshToken(refreshToken);

      // Actualizamos la cookie del Access Token
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
      });

      return sendSuccess(res, null, "Token actualizado con éxito");
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

      // Limpiamos AMBAS cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      
      return sendSuccess(res, null, "Sesión cerrada correctamente");
    } catch (error) {
      next(error);
    }
  }
};