import{applicationDefault,cert,getApps,initializeApp}from'firebase-admin/app';
import{getAuth}from'firebase-admin/auth';import{getFirestore}from'firebase-admin/firestore';
const projectId=process.env.FIREBASE_PROJECT_ID;
const credential=process.env.FIREBASE_SERVICE_ACCOUNT_JSON?cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)):applicationDefault();
const app=getApps()[0]??initializeApp({credential,projectId});
export const auth=getAuth(app);export const db=getFirestore(app);
