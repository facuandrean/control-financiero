import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { config } from "./config";
import { globalErrorHandler } from "./core/middlewares/error.middleware";

const app: Application = express();

app.use(express.json());
app.use(cookieParser());

app.get("/s", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.use(globalErrorHandler);

app.listen(config.port, () => {
  console.log(`Server is running on port http://localhost:${config.port}`);
});

export default app;