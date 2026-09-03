import type{Permission,Role}from'../types.js';
export const ROLE_PERMISSIONS:Readonly<Record<Role,readonly Permission[]>>={
  ADMIN:['VIEW','CREATE','UPDATE','DELETE','IMPORT','EXPORT','ASSIGN','APPROVE','MANAGE_USER','MANAGE_SYSTEM'],
  MANAGER:['VIEW','CREATE','UPDATE','EXPORT','ASSIGN','APPROVE'],
  STAFF:['VIEW','CREATE','UPDATE','EXPORT'],
  VIEWER:['VIEW'],
};
export function can(role:Role,permission:Permission){return ROLE_PERMISSIONS[role].includes(permission)}
