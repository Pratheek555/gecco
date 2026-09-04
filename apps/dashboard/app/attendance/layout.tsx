import type { Metadata } from "next";
import type { ReactNode } from "react";
import { verifySession } from "../lib/dal";

export const metadata: Metadata = {
  title: "Attendance | Gymwise",
  description: "Track member visits and manage gym check-ins with Gymwise.",
};

export default async function AttendanceLayout({ children }: { children: ReactNode }) {
  await verifySession();
  return children;
}
