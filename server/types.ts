import type{DecodedIdToken}from'firebase-admin/auth';
export type Role='ADMIN'|'MANAGER'|'STAFF'|'VIEWER';
export type Permission='VIEW'|'CREATE'|'UPDATE'|'DELETE'|'IMPORT'|'EXPORT'|'ASSIGN'|'APPROVE'|'MANAGE_USER'|'MANAGE_SYSTEM';
export interface AuthUser{uid:string;email:string;role:Role;permissions:Permission[];status:'ACTIVE'|'PENDING'|'DISABLED'|'LOCKED';token:DecodedIdToken}
declare global{
  // Express uses declaration merging for authenticated request context.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express{interface Request{user?:AuthUser}}
}
