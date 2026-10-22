"use client";

import { useEffect, useRef } from "react";

/** Formats are named rather than passed as functions, so server components can describe a chart. */
export type FormatKey = "inr" | "int";

type Annotation = { at: number; label: string; short?: string };

export type ChartSpec =
  | {
      kind: "bars";
      labels: string[];
      values: number[];
      format: FormatKey;
      highlight?: number | number[];
      dim?: number[];
      annotations?: Annotation[];
      height?: number;
    }
  | {
      kind: "line";
      labels: string[];
      series: { name: string; values: number[] }[];
      format: FormatKey;
      endLabel?: boolean;
      annotations?: Annotation[];
      height?: number;
    };

type ChartsGlobal = {
  fmt: { money: (currency: string, digits: number) => (v: number) => string; int: (v: number) => string; compact: (v: number) => string };
  bars: (el: HTMLElement, options: object) => unknown;
  line: (el: HTMLElement, options: object) => unknown;
};

declare global {
  interface Window {
    Charts?: ChartsGlobal;
  }
}

function formats(Charts: ChartsGlobal, key: FormatKey) {
  if (key === "inr") {
    return { format: Charts.fmt.money("INR", 0), tickFormat: (v: number) => (v === 0 ? "₹0" : `₹${Charts.fmt.compact(v)}`) };
  }
  return { format: Charts.fmt.int, tickFormat: Charts.fmt.int };
}

/** Draws one chart with the taste-skill helper: quiet grid, round ticks, square bars, a bare tooltip. */
export function Chart({ spec, label, className = "chart" }: { spec: ChartSpec; label: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const key = JSON.stringify(spec);

  useEffect(() => {
    let alive = true;
    // charts.js touches window, so it loads only in the browser.
    void import("./charts.js").then(() => {
      const el = ref.current;
      const Charts = window.Charts;
      if (!alive || !el || !Charts) return;
      el.replaceChildren();
      const parsed = JSON.parse(key) as ChartSpec;
      const { kind, format, ...rest } = parsed;
      const values = parsed.kind === "bars" ? parsed.values : parsed.series.flatMap((item) => item.values);
      const max = Math.max(0, ...values);
      // Small account/gym counts need whole-number axes, rather than several ticks rounded to "1".
      const step = Math.max(1, Math.ceil(max / 4));
      const yTicks = format === "int" && max <= 10
        ? Array.from({ length: Math.floor(max / step) + 2 }, (_, index) => index * step)
        : undefined;
      Charts[kind](el, { ...rest, ...formats(Charts, format), yTicks });
    });
    return () => {
      alive = false;
    };
  }, [key]);

  return <div ref={ref} className={className} role="img" aria-label={label} />;
}
