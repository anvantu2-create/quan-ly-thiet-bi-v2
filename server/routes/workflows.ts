import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { db } from "../config/firebase.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import { checklistFor } from "../domain/checklists.js";
export const workflowRouter = Router();
workflowRouter.use(requireAuth);
workflowRouter.get(
  "/proposals",
  requirePermission("VIEW"),
  async (_req, res) => {
    const snap = await db
      .collection("deviceProposals")
      .where("status", "==", "PENDING")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
    console.info("[FIREBASE READ] deviceProposals", snap.size);
    res.json({ items: snap.docs.map((x) => ({ id: x.id, ...x.data() })) });
  },
);
workflowRouter.post(
  "/proposals",
  requirePermission("CREATE"),
  async (req, res) => {
    const parsed = z
      .object({
        operationId: z.string().min(8),
        afterSnapshot: z.record(z.string(), z.unknown()),
        reason: z.string().trim().min(3),
      })
      .safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "INVALID_INPUT" });
    const op = db.collection("idempotencyKeys").doc(parsed.data.operationId);
    if ((await op.get()).exists) return res.json({ duplicate: true });
    const ref = db.collection("deviceProposals").doc();
    const data = {
      ...parsed.data,
      status: "PENDING",
      createdBy: req.user!.uid,
      createdAt: FieldValue.serverTimestamp(),
    };
    await db.runTransaction(async (tx) => {
      tx.create(ref, data);
      tx.create(op, {
        result: { id: ref.id },
        createdAt: FieldValue.serverTimestamp(),
      });
    });
    res.status(201).json({ id: ref.id });
  },
);
workflowRouter.post(
  "/proposals/:id/approve",
  requirePermission("APPROVE"),
  async (req, res) => {
    const id = String(req.params.id);
    try {
      await db.runTransaction(async (tx) => {
        const ref = db.collection("deviceProposals").doc(id),
          snap = await tx.get(ref);
        if (!snap.exists) throw new Error("NOT_FOUND");
        const proposal = snap.data()!;
        if (proposal.createdBy === req.user!.uid)
          throw new Error("SELF_APPROVAL_DENIED");
        if (proposal.status !== "PENDING") throw new Error("ALREADY_PROCESSED");
        const deviceRef = proposal.deviceId
          ? db.collection("devices").doc(proposal.deviceId)
          : db.collection("devices").doc();
        tx.set(
          deviceRef,
          {
            ...proposal.afterSnapshot,
            updatedAt: FieldValue.serverTimestamp(),
            updatedBy: req.user!.uid,
          },
          { merge: true },
        );
        tx.update(ref, {
          status: "APPROVED",
          approvedBy: req.user!.uid,
          approvedAt: FieldValue.serverTimestamp(),
        });
        tx.create(db.collection("auditLogs").doc(), {
          action: "APPROVE_PROPOSAL",
          entityId: id,
          uid: req.user!.uid,
          createdAt: FieldValue.serverTimestamp(),
        });
      });
      res.json({ id, status: "APPROVED" });
    } catch (e) {
      const code = e instanceof Error ? e.message : "UNKNOWN";
      res.status(code === "NOT_FOUND" ? 404 : 409).json({ error: code });
    }
  },
);
workflowRouter.get("/tasks", requirePermission("VIEW"), async (req, res) => {
  let query = db
    .collection("inspectionTasks")
    .where("isDeleted", "==", false)
    .orderBy("createdAt", "desc")
    .limit(50);
  if (req.user!.role === "STAFF")
    query = query.where("assigneeId", "==", req.user!.uid);
  const snap = await query.get();
  console.info("[FIREBASE READ] inspectionTasks", snap.size);
  res.json({ items: snap.docs.map((x) => ({ id: x.id, ...x.data() })) });
});
workflowRouter.post("/tasks", requirePermission("ASSIGN"), async (req, res) => {
  const parsed = z
    .object({
      deviceId: z.string().min(1),
      deviceType: z.enum(["REC", "LBS"]),
      assigneeId: z.string().min(1),
      dueDate: z.string().min(8),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "INVALID_INPUT" });
  const ref = db.collection("inspectionTasks").doc();
  await ref.create({
    ...parsed.data,
    checklist: checklistFor(parsed.data.deviceType).map((name) => ({
      name,
      status: "PENDING",
    })),
    status: "ASSIGNED",
    isDeleted: false,
    version: 1,
    createdBy: req.user!.uid,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  res.status(201).json({ id: ref.id });
});
