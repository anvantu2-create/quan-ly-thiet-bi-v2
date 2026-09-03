import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { db } from "../config/firebase.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import { validateEntity } from "../validation/entities.js";
const requestSchema = z.object({
  operationId: z.string().min(8),
  rows: z.array(z.record(z.string(), z.unknown())).min(1).max(200),
});
export const importRouter = Router();
importRouter.use(requireAuth, requirePermission("IMPORT"));
importRouter.post("/devices", async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ error: "INVALID_IMPORT", details: parsed.error.flatten() });
  const operation = db
      .collection("idempotencyKeys")
      .doc(parsed.data.operationId),
    old = await operation.get();
  if (old.exists) return res.json(old.data()?.result);
  const validated = parsed.data.rows.map((row, index) => ({
      index,
      result: validateEntity("devices", row),
    })),
    invalid = validated.filter((x) => !x.result.success);
  if (invalid.length)
    return res
      .status(400)
      .json({ error: "INVALID_ROWS", rows: invalid.map((x) => x.index + 2) });
  const rows = validated.flatMap((x) =>
      x.result.success ? [x.result.data] : [],
    ),
    codes = rows.map((x) => String(x.code)),
    duplicates = codes.filter((code, index) => codes.indexOf(code) !== index);
  if (duplicates.length)
    return res
      .status(409)
      .json({
        error: "DUPLICATE_CODES_IN_FILE",
        codes: [...new Set(duplicates)],
      });
  const existing: string[] = [];
  for (let i = 0; i < codes.length; i += 30) {
    const snap = await db
      .collection("devices")
      .where("code", "in", codes.slice(i, i + 30))
      .where("isDeleted", "==", false)
      .get();
    existing.push(...snap.docs.map((x) => String(x.data().code)));
  }
  if (existing.length)
    return res
      .status(409)
      .json({ error: "DUPLICATE_DEVICE_CODE", codes: existing });
  const batch = db.batch(),
    now = FieldValue.serverTimestamp();
  for (const row of rows) {
    batch.create(db.collection("devices").doc(), {
      ...row,
      version: 1,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      createdBy: req.user!.uid,
      updatedBy: req.user!.uid,
    });
  }
  const result = { created: rows.length };
  batch.create(operation, { result, createdAt: now, uid: req.user!.uid });
  batch.create(db.collection("auditLogs").doc(), {
    action: "IMPORT_DEVICES",
    count: rows.length,
    uid: req.user!.uid,
    createdAt: now,
  });
  await batch.commit();
  console.info("[FIREBASE WRITE] devices import", rows.length);
  res.status(201).json(result);
});
