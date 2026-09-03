import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { entityRouter } from "./routes/entities.js";
import { usersRouter } from "./routes/users.js";
import { workflowRouter } from "./routes/workflows.js";
import { mediaRouter } from "./routes/media.js";
import { importRouter } from "./routes/import.js";
import { errorHandler } from "./middleware/error.js";
export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api/auth", authRouter);
  app.use("/api/entities", entityRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/workflows", workflowRouter);
  app.use("/api/media", mediaRouter);
  app.use("/api/import", importRouter);
  app.use(errorHandler);
  return app;
}
