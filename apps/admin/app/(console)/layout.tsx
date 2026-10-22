import type { ReactNode } from "react";
import { Shell } from "@/components/shell";
import { requireAdmin } from "@/lib/auth";
import { linkStatus } from "@/lib/derive";
import { initials } from "@/lib/format";
import { isSampleMode, loadSnapshot } from "@/lib/load";

export default async function ConsoleLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const snapshot = await loadSnapshot();
  const stamp = `Updated ${new Date(snapshot.now).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  })} IST`;

  return (
    <Shell
      admin={{ name: admin.name, email: admin.email, initials: initials(admin.name) }}
      scope={{
        gyms: snapshot.gyms.filter((gym) => gym.isActive).length,
        waitingLinks: snapshot.links.filter((link) => linkStatus(link, snapshot.now) === "waiting").length,
      }}
      stamp={stamp}
      dashboardUrl={process.env.DASHBOARD_URL ?? null}
      sample={isSampleMode}
    >
      {children}
    </Shell>
  );
}
