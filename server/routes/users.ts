import { Router } from "express";
import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "../config/firebase.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import { writeAudit } from "../services/audit.js";
const updateSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "STAFF", "VIEWER"]),
  status: z.enum(["ACTIVE", "PENDING", "DISABLED", "LOCKED"]),
  expectedVersion: z.number().int().positive(),
});
export const usersRouter = Router();
usersRouter.use(requireAuth, requirePermission("MANAGE_USER"));
usersRouter.get("/", async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 50);
  let query = db
    .collection("users")
    .where("deletedAt", "==", null)
    .orderBy("updatedAt", "desc")
    .limit(limit);
  if (typeof req.query.cursor === "string") {
    const cursor = await db.collection("users").doc(req.query.cursor).get();
    if (cursor.exists) query = query.startAfter(cursor);
  }
  const snap = await query.get();
  console.info("[FIREBASE READ] users", snap.size);
  res.json({
    items: snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() })),
    nextCursor: snap.size === limit ? snap.docs.at(-1)?.id : null,
  });
});
usersRouter.patch("/:uid", async (req, res) => {
  const uid = String(req.params.uid);
  if (uid === req.user!.uid)
    return res.status(403).json({ error: "SELF_ACCOUNT_PROTECTED" });
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ error: "INVALID_INPUT", details: parsed.error.flatten() });
  try {
    const result = await db.runTransaction(async (tx) => {
      const ref = db.collection("users").doc(uid),
        snap = await tx.get(ref);
      if (!snap.exists) throw new Error("NOT_FOUND");
      const current = snap.data()!;
      if ((current.version ?? 1) !== parsed.data.expectedVersion)
        throw new Error("VERSION_CONFLICT");
      const version = parsed.data.expectedVersion + 1;
      tx.update(ref, {
        role: parsed.data.role,
        status: parsed.data.status,
        version,
        updatedAt: Timestamp.now(),
        updatedBy: req.user!.uid,
      });
      return { uid, version };
    });
    await writeAudit(req.user!.uid, "UPDATE_USER", "users", uid);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "NOT_FOUND")
      return res.status(404).json({ error: "NOT_FOUND" });
    if (message === "VERSION_CONFLICT")
      return res.status(409).json({ error: "VERSION_CONFLICT" });
    throw error;
  }
});
