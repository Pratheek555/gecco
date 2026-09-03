import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/app/api/auth/session";

/** Validates the database-backed session before protected UI is rendered. */
export const verifySession = cache(async () => {
  const session = await getSession();

  if (!session) redirect("/login");

  return session;
});
