import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requirePageAccess } from "../lib/dal";

export const metadata: Metadata = {
  title: "Team | Gecco",
  description: "Invite trainers and staff, and control what each person can see.",
};

export default async function TeamLayout({ children }: { children: ReactNode }) {
  await requirePageAccess("team:manage");
  return children;
}
