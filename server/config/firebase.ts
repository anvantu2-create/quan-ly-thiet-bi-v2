import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
const projectId = process.env.FIREBASE_PROJECT_ID;
const credential = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
  : applicationDefault();
const app =
  getApps()[0] ??
  initializeApp({
    credential,
    projectId,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
export const auth = getAuth(app);
export const db = getFirestore(app);
export const bucket = getStorage(app).bucket();
