import type { ReactNode } from "react";
import { requireSession } from "../auth-guard";

export default async function AutomationsLayout({ children }: { children: ReactNode }) {
  await requireSession();
  return children;
}
