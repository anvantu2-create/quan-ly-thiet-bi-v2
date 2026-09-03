import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { entityRouter } from "./routes/entities.js";
import { usersRouter } from "./routes/users.js";
import { workflowRouter } from "./routes/workflows.js";
import { mediaRouter } from "./routes/media.js";
import { importRouter } from "./routes/import.js";
import { reportsRouter } from "./routes/reports.js";
import { realtimeRouter } from "./routes/realtime.js";
import { isOriginAllowed } from "./config/security.js";
import { errorHandler } from "./middleware/error.js";
export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(
    cors({
      origin: (origin, done) =>
        done(null, isOriginAllowed(origin) ? (origin ?? true) : false),
      credentials: true,
    }),
  );
  app.use((_req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
      "Permissions-Policy": "camera=(self), geolocation=(self)",
    });
    next();
  });
  app.use(express.json({ limit: "1mb" }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api/auth", authRouter);
  app.use("/api/entities", entityRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/workflows", workflowRouter);
  app.use("/api/media", mediaRouter);
  app.use("/api/import", importRouter);
  app.use("/api/reports", reportsRouter);
  app.use("/api/realtime", realtimeRouter);
  app.use(errorHandler);
  return app;
}
