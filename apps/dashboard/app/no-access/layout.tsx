import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { verifySession } from "../lib/dal";
import { firstAllowedPath } from "../lib/navigation-access";

export default async function NoAccessLayout({ children }: { children: ReactNode }) {
  const session = await verifySession();
  const home = firstAllowedPath(session.activeGym.permissions);
  if (home !== "/no-access") redirect(home);
  return children;
}
