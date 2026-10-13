import type { Metadata } from "next";
import { requirePageAccess } from "../lib/dal";

export const metadata: Metadata = {
  title: "Members | Gymwise",
  description: "Manage gym members, memberships, renewals, and attendance.",
};

export default async function MembersLayout({ children }: { children: React.ReactNode }) {
  await requirePageAccess("members:read");
  return children;
}
