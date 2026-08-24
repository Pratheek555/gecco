import type { Metadata } from "next";
import { requireSession } from "../auth-guard";

export const metadata: Metadata = {
  title: "Members | Gymwise",
  description: "Manage gym members, memberships, renewals, and attendance.",
};

export default async function MembersLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return children;
}
