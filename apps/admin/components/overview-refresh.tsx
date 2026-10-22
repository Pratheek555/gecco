"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useTransition } from "react";

export function OverviewRefresh({ live }: { live: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const refresh = useCallback(() => startTransition(() => router.refresh()), [router]);

  useEffect(() => {
    if (!live) return;
    const refreshIfVisible = () => {
      // Keep forms and link results stable while staff are working in a dialog.
      if (!document.hidden && !document.querySelector("dialog[open]")) refresh();
    };
    const timer = window.setInterval(refreshIfVisible, 60_000);
    document.addEventListener("visibilitychange", refreshIfVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [live, refresh]);

  if (!live) return null;
  return (
    <button type="button" className="btn" onClick={refresh} disabled={pending} aria-label="Refresh overview data" title="Live data refreshes every minute while this page is visible">
      <RefreshCw aria-hidden="true" />
      {pending ? "Refreshing…" : "Refresh"}
    </button>
  );
}
