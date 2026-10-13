import type { ReactNode } from "react";
import { requirePageAccess } from "../lib/dal";

export default async function AutomationsLayout({ children }: { children: ReactNode }) {
  await requirePageAccess("gym:manage");
  return children;
}
