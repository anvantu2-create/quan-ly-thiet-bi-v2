import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { db } from "../config/firebase.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import { writeAudit } from "../services/audit.js";
import {
  createEntity,
  deleteEntity,
  listEntities,
  updateEntity,
  type CollectionName,
} from "../services/entityService.js";
import { validateEntity } from "../validation/entities.js";
const bodySchema = z.object({
  data: z.record(z.string(), z.unknown()),
  expectedVersion: z.number().int().positive().optional(),
  operationId: z.string().min(8).max(128),
});
export const entityRouter = Router();
entityRouter.use(requireAuth);
entityRouter.get(
  "/:collection",
  requirePermission("VIEW"),
  async (req, res) => {
    const collection = asCollection(String(req.params.collection));
    if (!collection)
      return res.status(404).json({ error: "UNKNOWN_COLLECTION" });
    const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 50);
    const filters: Array<{ field: string; value: string }> = [];
    const addFilter = (field: string, value: unknown) => {
      if (typeof value === "string") filters.push({ field, value });
    };
    addFilter("substationId", req.query.substationId);
    addFilter("feederId", req.query.feederId);
    addFilter("deviceType", req.query.deviceType);
    addFilter("status", req.query.status);
    addFilter("workingStatus", req.query.workingStatus);
    res.json(
      await listEntities(
        collection,
        limit,
        typeof req.query.cursor === "string" ? req.query.cursor : undefined,
        filters,
      ),
    );
  },
);
entityRouter.post(
  "/:collection",
  requirePermission("CREATE"),
  async (req, res) => mutate(req, res, "CREATE"),
);
entityRouter.patch(
  "/:collection/:id",
  requirePermission("UPDATE"),
  async (req, res) => mutate(req, res, "UPDATE"),
);
entityRouter.delete(
  "/:collection/:id",
  requirePermission("DELETE"),
  async (req, res) => mutate(req, res, "DELETE"),
);
function asCollection(value: string): CollectionName | undefined {
  return (["substations", "feeders", "devices", "loops"] as const).find(
    (item) => item === value,
  );
}
async function mutate(
  req: Request,
  res: Response,
  action: "CREATE" | "UPDATE" | "DELETE",
) {
  try {
    const collection = asCollection(String(req.params.collection));
    if (!collection)
      return res.status(404).json({ error: "UNKNOWN_COLLECTION" });
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "INVALID_INPUT", details: parsed.error.flatten() });
    const { data, expectedVersion, operationId } = parsed.data;
    const validated = validateEntity(collection, data, action !== "CREATE");
    if (!validated.success)
      return res
        .status(400)
        .json({ error: "INVALID_ENTITY", details: validated.error.flatten() });
    const opRef = db.collection("idempotencyKeys").doc(operationId),
      existing = await opRef.get();
    if (existing.exists) return res.status(200).json(existing.data()?.result);
    if (action !== "CREATE" && !expectedVersion)
      return res.status(400).json({ error: "EXPECTED_VERSION_REQUIRED" });
    const id = String(req.params.id);
    const result =
      action === "CREATE"
        ? await createEntity(collection, validated.data, req.user!.uid)
        : action === "UPDATE"
          ? await updateEntity(
              collection,
              id,
              validated.data,
              expectedVersion!,
              req.user!.uid,
            )
          : await deleteEntity(collection, id, expectedVersion!, req.user!.uid);
    if ("skipped" in result && result.skipped)
      return res.status(200).json(result);
    await opRef.create({
      result,
      uid: req.user!.uid,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 86400000),
    });
    await writeAudit(req.user!.uid, action, collection, result.id);
    return res.status(action === "CREATE" ? 201 : 200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "VERSION_CONFLICT")
      return res.status(409).json({ error: "VERSION_CONFLICT" });
    if (message === "NOT_FOUND")
      return res.status(404).json({ error: "NOT_FOUND" });
    if (message === "DUPLICATE_DEVICE_CODE")
      return res.status(409).json({ error: "DUPLICATE_DEVICE_CODE" });
    throw error;
  }
}
