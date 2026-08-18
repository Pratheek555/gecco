import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Attendance | Gymwise",
  description: "Track member visits and manage gym check-ins with Gymwise.",
};

export default function AttendanceLayout({ children }: { children: ReactNode }) {
  return children;
}
