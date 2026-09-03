import { Router } from "express";
import { db } from "../config/firebase.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";
export const reportsRouter = Router();
reportsRouter.use(requireAuth, requirePermission("VIEW"));
reportsRouter.get("/summary", async (_req, res) => {
  const collections = ["substations", "feeders", "devices", "loops"] as const;
  const values = await Promise.all(
    collections.map(async (name) => {
      const snap = await db
        .collection(name)
        .where("isDeleted", "==", false)
        .count()
        .get();
      return [name, snap.data().count] as const;
    }),
  );
  console.info("[FIREBASE READ] aggregate summary", collections.length);
  res.json(Object.fromEntries(values));
});
