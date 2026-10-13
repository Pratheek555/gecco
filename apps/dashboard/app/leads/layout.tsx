import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requirePageAccess } from "../lib/dal";

export const metadata: Metadata = {
  title: "Leads | Gecco",
  description: "Capture, follow up, and convert gym leads in one place.",
};

export default async function LeadsLayout({ children }: { children: ReactNode }) {
  await requirePageAccess("leads:read");
  return children;
}
