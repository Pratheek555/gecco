import type { Permission } from "@/app/api/auth/permissions";

/** Landing order for workspace pages; the first one a person can open becomes their home. */
export const pageAccess: ReadonlyArray<{ href: string; permission: Permission }> = [
  { href: "/dashboard", permission: "overview:read" },
  { href: "/members", permission: "members:read" },
  { href: "/leads", permission: "leads:read" },
  { href: "/payments", permission: "payments:read" },
  { href: "/memberships", permission: "memberships:read" },
  { href: "/trainers", permission: "trainers:read" },
];

export function firstAllowedPath(permissions: readonly Permission[]) {
  return pageAccess.find((page) => permissions.includes(page.permission))?.href ?? "/no-access";
}
