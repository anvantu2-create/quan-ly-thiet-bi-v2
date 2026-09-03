import { randomUUID } from "node:crypto";
import { Router } from "express";
import multer from "multer";
import { FieldValue } from "firebase-admin/firestore";
import { bucket, db } from "../config/firebase.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import { writeAudit } from "../services/audit.js";
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, done) =>
    done(
      null,
      ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype),
    ),
});
export const mediaRouter = Router();
mediaRouter.use(requireAuth);
mediaRouter.post(
  "/devices/:id",
  requirePermission("UPDATE"),
  upload.single("image"),
  async (req, res) => {
    if (!req.file)
      return res.status(400).json({ error: "IMAGE_REQUIRED_OR_INVALID" });
    const id = String(req.params.id),
      device = await db.collection("devices").doc(id).get();
    if (!device.exists)
      return res.status(404).json({ error: "DEVICE_NOT_FOUND" });
    const token = randomUUID(),
      ext = req.file.mimetype.split("/")[1],
      path = `devices/${id}/${Date.now()}-${randomUUID()}.${ext}`,
      file = bucket.file(path);
    await file.save(req.file.buffer, {
      resumable: false,
      metadata: {
        contentType: req.file.mimetype,
        metadata: { firebaseStorageDownloadTokens: token },
      },
    });
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
    const metadata = {
      url,
      path,
      contentType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user!.uid,
      uploadedAt: new Date().toISOString(),
    };
    await db
      .collection("devices")
      .doc(id)
      .update({
        photos: FieldValue.arrayUnion(metadata),
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: req.user!.uid,
        version: FieldValue.increment(1),
      });
    await writeAudit(req.user!.uid, "UPLOAD_DEVICE_PHOTO", "devices", id);
    res.status(201).json(metadata);
  },
);
