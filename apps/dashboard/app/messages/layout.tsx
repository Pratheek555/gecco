import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages | Gymwise",
  description: "Manage member conversations, campaigns, and message templates in Gymwise.",
};

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
