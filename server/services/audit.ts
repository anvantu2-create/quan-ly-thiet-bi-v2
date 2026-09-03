import{FieldValue}from'firebase-admin/firestore';import{db}from'../config/firebase.js';
export async function writeAudit(uid:string,action:string,entityType:string,entityId:string){await db.collection('auditLogs').add({uid,action,entityType,entityId,createdAt:FieldValue.serverTimestamp()});console.info('[FIREBASE WRITE] auditLogs',action)}
