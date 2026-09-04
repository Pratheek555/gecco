export type GymRole = "OWNER" | "STAFF" | "TRAINER";

export type Permission =
  | "members:read"
  | "members:write"
  | "overview:read"
  | "memberships:read"
  | "memberships:write"
  | "memberships:cancel"
  | "payments:read"
  | "payments:record"
  | "plans:read"
  | "plans:manage"
  | "trainers:read"
  | "trainers:manage"
  | "gym:manage";

export const permissionRoles: Record<Permission, readonly GymRole[]> = {
  // The current list endpoint returns every member in the gym, so trainers
  // must not receive this permission until an assigned-members query exists.
  "members:read": ["OWNER", "STAFF"],
  "members:write": ["OWNER", "STAFF"],
  "overview:read": ["OWNER", "STAFF"],
  "memberships:read": ["OWNER", "STAFF"],
  "memberships:write": ["OWNER", "STAFF"],
  "memberships:cancel": ["OWNER", "STAFF"],
  "payments:read": ["OWNER", "STAFF"],
  "payments:record": ["OWNER", "STAFF"],
  "plans:read": ["OWNER", "STAFF"],
  "plans:manage": ["OWNER"],
  "trainers:read": ["OWNER", "STAFF"],
  "trainers:manage": ["OWNER", "STAFF"],
  "gym:manage": ["OWNER"],
};

export function hasPermission(role: string, permission: Permission) {
  return permissionRoles[permission].includes(role as GymRole);
}
