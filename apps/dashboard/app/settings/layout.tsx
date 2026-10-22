import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requirePageAccess } from "../lib/dal";

export const metadata: Metadata = {
  title: "Settings | Gecco",
  description: "Update your gym's name and timezone.",
};

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  await requirePageAccess("gym:manage");
  return children;
}
