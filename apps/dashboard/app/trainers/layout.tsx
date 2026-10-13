import type { ReactNode } from "react";
import { requirePageAccess } from "../lib/dal";

export default async function TrainersLayout({ children }: { children: ReactNode }) {
  await requirePageAccess("trainers:read");
  return children;
}
