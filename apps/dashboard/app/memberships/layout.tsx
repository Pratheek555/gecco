import type { ReactNode } from "react";
import { requireSession } from "../auth-guard";

export default async function MembershipsLayout({ children }: { children: ReactNode }) {
  await requireSession();
  return children;
}
