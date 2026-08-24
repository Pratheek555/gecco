import type { ReactNode } from "react";
import { requireSession } from "../auth-guard";

export default async function TrainersLayout({ children }: { children: ReactNode }) {
  await requireSession();
  return children;
}
