import type { Metadata } from "next";
import { requireSession } from "../auth-guard";

export const metadata: Metadata = {
  title: "Messages | Gymwise",
  description: "Manage member conversations, campaigns, and message templates in Gymwise.",
};

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return children;
}
