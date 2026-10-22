import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requirePlatformAdminPage } from "@/app/lib/platform-admin";

export const metadata: Metadata = {
  title: "Onboard gyms | Gecco",
  description: "Issue private signup links for new gym owners.",
};

export default async function AdminGymsLayout({ children }: { children: ReactNode }) {
  await requirePlatformAdminPage();
  return children;
}
