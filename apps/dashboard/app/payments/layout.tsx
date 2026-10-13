import type { ReactNode } from "react";
import { requirePageAccess } from "../lib/dal";

export default async function PaymentsLayout({ children }: { children: ReactNode }) {
  await requirePageAccess("payments:read");
  return children;
}
