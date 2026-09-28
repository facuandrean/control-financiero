import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  dbUrl: process.env.DB_URL,
  dbToken: process.env.DB_TOKEN,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '867079303651-jstcsunru0h51bo1t6a2ej601sgapmaf.apps.googleusercontent.com',
};