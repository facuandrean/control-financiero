import { db } from '../../core/db/db';
import { config } from '../../config';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { sessions } from './auth.schema';
import { eq, sql } from 'drizzle-orm';
import { AppError } from '../../core/utils/AppError';
import { userService } from '../users/users.service';
import { seedDefaultCategories } from '../categories/categories.seed';

export const authService = {
  // Registro tradicional de usuario con inicialización de categorías por defecto
  register: async (data: { name: string; lastName: string; email: string; password: string }) => {
    const existingUser = await userService.findByEmail(data.email);

    if (existingUser) {
      throw new AppError("El email ya está registrado", 409, "AUTH_EMAIL_EXISTS");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await userService.createUser({
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
    });

    await seedDefaultCategories(newUser.id);

    const { password: _, ...publicUser } = newUser;
    return publicUser;
  },

  // Genera un string aleatorio que será el Refresh Token
  generateRefreshToken: (): string => {
    return crypto.randomBytes(40).toString('hex');
  },

  // Hasheamos el token para guardarlo en la base de datos
  hashToken: (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
  },

  // Creamos la sesión y devolvemos los tokens al controlador
  createSession: async (userID: string, userAgent: string, ipAddress: string) => {
    const accessToken = jwt.sign(
      { id: userID }, 
      config.accessTokenSecret!, 
      { expiresIn: "15m" }
    );

    const refreshToken = authService.generateRefreshToken();
    const tokenHashed = authService.hashToken(refreshToken);

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

    await db.insert(sessions).values({
      id: crypto.randomUUID(),
      userID: userID,
      tokenHashed,
      userAgent,
      ipAddress,
      expiresAt,
      createdAt: sql`datetime('now', '-3 hours')`,
    });

    return { accessToken, refreshToken };
  },

  // Validamos el refresh token y creamos un nuevo access token
  validateRefreshToken: async (refreshToken: string) => {
    const hashed = authService.hashToken(refreshToken);

    const sessionData = await db.select().from(sessions).where(eq(sessions.tokenHashed, hashed)).get();

    if (!sessionData) {
      throw new AppError("Sesión no válida o expirada", 401, "INVALID_REFRESH_TOKEN");
    }

    if (new Date(sessionData.expiresAt) < new Date()) {
      await db.delete(sessions).where(eq(sessions.id, sessionData.id));
      throw new AppError("Sesión no válida o expirada", 401, "INVALID_REFRESH_TOKEN");
    }

    const accessToken = jwt.sign({ id: sessionData.userID }, config.accessTokenSecret!, { expiresIn: "15m" });

    return { accessToken };
  },

  googleLogin: async (googleToken: string, userAgent = 'unknown', ipAddress = 'unknown') => {
    const clientId = config.googleClientId || '867079303651-jstcsunru0h51bo1t6a2ej601sgapmaf.apps.googleusercontent.com';
    const client = new OAuth2Client(clientId);

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: clientId,
      });
    } catch {
      throw new AppError("Token de Google inválido o expirado", 401, "AUTH_INVALID_GOOGLE_TOKEN");
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new AppError("No se pudo obtener la información de la cuenta de Google", 400, "AUTH_GOOGLE_PAYLOAD_ERROR");
    }

    const email = payload.email;
    const name = payload.given_name || payload.name || "Usuario";
    const lastName = payload.family_name || "";

    let user = await userService.findByEmail(email);

    if (!user) {
      const randomPassword = crypto.randomUUID();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await userService.createUser({
        name,
        lastName,
        email,
        password: hashedPassword,
      });

      await seedDefaultCategories(user.id);
    }

    const { accessToken, refreshToken } = await authService.createSession(user.id, userAgent, ipAddress);

    const { password: _, ...publicUser } = user;

    return {
      user: publicUser,
      accessToken,
      refreshToken,
      sessionToken: accessToken,
    };
  }
};