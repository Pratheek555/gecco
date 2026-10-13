import type { ReactNode } from "react";
import { requirePageAccess } from "../lib/dal";

export default async function ReportsLayout({ children }: { children: ReactNode }) {
  await requirePageAccess("overview:read");
  return children;
}
