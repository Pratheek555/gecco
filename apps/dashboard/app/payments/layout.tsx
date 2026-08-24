import type { ReactNode } from "react";
import { requireSession } from "../auth-guard";

export default async function PaymentsLayout({ children }: { children: ReactNode }) {
  await requireSession();
  return children;
}
