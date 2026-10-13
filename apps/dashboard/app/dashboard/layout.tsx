import type { ReactNode } from "react";
import { requirePageAccess } from "../lib/dal";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requirePageAccess("overview:read");
  return children;
}
