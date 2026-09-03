import type { ReactNode } from "react";
import { verifySession } from "../lib/dal";

export default async function PaymentsLayout({ children }: { children: ReactNode }) {
  await verifySession();
  return children;
}
