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


const app: Application = express();

app.use(cors({
  origin: config.frontendUrl || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/entities', entityRoutes);

// app.all('*', (req, res, next) => {
//   next(new AppError(`No se encontró la ruta ${req.originalUrl} en este servidor`, 404));
// });

app.use(globalErrorHandler);

app.listen(config.port, () => {
  console.log(`Server is running on port http://localhost:${config.port}`);
});

export default app;