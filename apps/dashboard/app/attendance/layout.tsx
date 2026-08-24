import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireSession } from "../auth-guard";

export const metadata: Metadata = {
  title: "Attendance | Gymwise",
  description: "Track member visits and manage gym check-ins with Gymwise.",
};

export default async function AttendanceLayout({ children }: { children: ReactNode }) {
  await requireSession();
  return children;
}
