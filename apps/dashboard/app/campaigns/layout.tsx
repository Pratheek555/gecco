import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requirePageAccess } from "../lib/dal";

export const metadata: Metadata = {
  title: "Campaigns | Gecco",
  description: "Message members and leads on WhatsApp and see the revenue each campaign brings back.",
};

export default async function CampaignsLayout({ children }: { children: ReactNode }) {
  await requirePageAccess("campaigns:read");
  return children;
}
