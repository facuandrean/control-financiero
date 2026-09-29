import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config";
import { globalErrorHandler } from "./core/middlewares/error.middleware";
import { AppError } from "./core/utils/AppError";

import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import categoryRoutes from './modules/categories/categories.routes';
import accountRoutes from './modules/accounts/accounts.routes';
import transactionRoutes from './modules/transactions/transactions.routes';
import entityRoutes from './modules/entities/entities.routes';
import debtRoutes from './modules/debts/debts.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';


const app: Application = express();

const allowedOrigins = [
  config.frontendUrl?.replace(/\/$/, ''),
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalized = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(normalized) || normalized.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS no permitido para el origen: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Control Financiero API - OK');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/entities', entityRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/dashboard', dashboardRoutes);

app.use(globalErrorHandler);

if (!process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`Server is running on port http://localhost:${config.port}`);
  });
}

export default app;