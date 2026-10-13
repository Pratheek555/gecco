import type { ReactNode } from "react";
import { requirePageAccess } from "../lib/dal";

export default async function MembershipsLayout({ children }: { children: ReactNode }) {
  await requirePageAccess("memberships:read");
  return children;
}
