import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/app/api/auth/session";
import { firstAllowedPath } from "@/app/lib/navigation-access";
import type { Permission } from "@/app/api/auth/permissions";

/** Validates the database-backed session before protected UI is rendered. */
export const verifySession = cache(async () => {
  const session = await getSession();

  if (!session) redirect("/login");

  return session;
});

/** Sends people to a page they can open when the owner has not shared this one. */
export async function requirePageAccess(permission: Permission) {
  const session = await verifySession();

  if (!session.activeGym.permissions.includes(permission)) {
    redirect(firstAllowedPath(session.activeGym.permissions));
  }

  return session;
}
