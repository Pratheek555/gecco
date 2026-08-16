import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Members | Gymwise",
  description: "Manage gym members, memberships, renewals, and attendance.",
};

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
