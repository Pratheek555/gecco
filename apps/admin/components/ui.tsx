import Link from "next/link";
import type { ReactNode } from "react";
import { STATE_LABELS, type GymState } from "@/lib/derive";
import { signed } from "@/lib/format";

export type Kpi = {
  label: string;
  value: ReactNode;
  unit?: string;
  caption?: ReactNode;
  lead?: boolean;
};

/** KPIs as one box split by dividers: a label over a number, no icons and no tiles. */
export function Kpis({ items }: { items: Kpi[] }) {
  return (
    <div className="kpis">
      {items.map((item) => (
        <div key={item.label} className={`kpi${item.lead ? " lead" : ""}`}>
          <p className="kpi-label">{item.label}</p>
          <p className="kpi-value">
            {item.value}
            {item.unit && <small>{item.unit}</small>}
          </p>
          {item.caption && <p className="delta">{item.caption}</p>}
        </div>
      ))}
    </div>
  );
}

/**
 * A change with its baseline in words. Colour says good or bad: every metric here is better when it rises,
 * so a rise is positive and a fall negative; no change is grey, and a change from nothing is "(new)".
 */
export function Change({ now, before, window, format }: { now: number; before: number; window: string; format?: (v: number) => string }) {
  const change = now - before;
  if (before === 0 && now === 0) return <>None in {window}</>;
  if (before === 0) return <><span className="good">{signed(now, format)}</span> (new) {window}</>;
  if (change === 0) return <>No change on {window}</>;
  return (
    <>
      <span className={change > 0 ? "good" : "bad"}>{signed(change, format)}</span> on {window}
    </>
  );
}

const STATE_TONE: Record<GymState, string> = { onboarding: "warn", live: "pos", quiet: "", deactivated: "" };

export function StatePill({ state }: { state: GymState }) {
  return <span className={`pill ${STATE_TONE[state]}`}>{STATE_LABELS[state]}</span>;
}

export function Tabs({ items }: { items: { href: string; label: string; count?: number; current: boolean }[] }) {
  return (
    <nav className="tabs" aria-label="Views">
      {items.map((item) => (
        <Link key={item.href} href={item.href} aria-current={item.current ? "page" : undefined}>
          {item.label}
          {item.count !== undefined && <span className="count num">{item.count}</span>}
        </Link>
      ))}
    </nav>
  );
}
