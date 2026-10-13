import type { Metadata } from "next";
import { requirePageAccess } from "../lib/dal";

export const metadata: Metadata = {
  title: "Messages | Gymwise",
  description: "Manage member conversations, campaigns, and message templates in Gymwise.",
};

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  await requirePageAccess("members:read");
  return children;
}
