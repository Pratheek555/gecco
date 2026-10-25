"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  BellRing,
  CalendarCheck,
  IndianRupee,
  MessageCircle,
  RefreshCw,
  Sparkles,
  TrendingUp,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import styles from "./landing.module.css";

type PulseEvent = { icon: LucideIcon; tone: string; title: string; detail: string };

// Points in a 0–100 box, climbing from bottom-left to top-right. Nodes sit on every other point.
const points: Array<[number, number]> = [
  [0, 100], [12, 92], [24, 76], [37, 70], [50, 52], [63, 46], [76, 28], [88, 22], [98, 6],
];
const nodeIndexes = [2, 4, 6, 8];

// Where each node's notification sits relative to its dot.
const placements = ["start-below", "start-below", "start-below", "end"] as const;

const cycles: PulseEvent[][] = [
  [
    { icon: Sparkles, tone: "#93c5fd", title: "New enquiry", detail: "Priya Nair · Instagram" },
    { icon: CalendarCheck, tone: "#fcd34d", title: "Trial booked", detail: "Today, 6:00 pm" },
    { icon: IndianRupee, tone: "#c7b9ff", title: "Payment received", detail: "₹2,500 · UPI" },
    { icon: TrendingUp, tone: "#4ade80", title: "₹6,24,800 collected", detail: "+17.8% vs September" },
  ],
  [
    { icon: MessageCircle, tone: "#6ee7b7", title: "Replied on WhatsApp", detail: "Rahul Verma · 2 min" },
    { icon: RefreshCw, tone: "#c7b9ff", title: "Membership renewed", detail: "Diya Menon · Quarterly" },
    { icon: UserPlus, tone: "#4ade80", title: "New member joined", detail: "Sneha Rao · Gym Monthly" },
    { icon: TrendingUp, tone: "#4ade80", title: "164 active members", detail: "+6 this week" },
  ],
  [
    { icon: Sparkles, tone: "#93c5fd", title: "New enquiry", detail: "Karthik Bhat · Google" },
    { icon: BellRing, tone: "#fcd34d", title: "Expiry flagged", detail: "Arjun Iyer · in 3 days" },
    { icon: IndianRupee, tone: "#c7b9ff", title: "Payment received", detail: "₹8,000 · Card" },
    { icon: TrendingUp, tone: "#4ade80", title: "83.2% collected", detail: "Best month so far" },
  ],
];

/** Smooth path through the points, scaled to the container's pixel size so dashes stay even. */
function smoothPath(width: number, height: number) {
  const scaled = points.map(([x, y]) => [(x / 100) * width, (y / 100) * height]);
  return scaled
    .map(([x, y], index) => {
      if (index === 0) return `M${x.toFixed(1)} ${y.toFixed(1)}`;
      const [px, py] = scaled[index - 1];
      const cx = ((px + x) / 2).toFixed(1);
      return `C${cx} ${py.toFixed(1)} ${cx} ${y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}
const INTRO_MS = 1900;
const RUN_MS = 3400;
const HOLD_MS = 2600;
const FADE_MS = 700;
const COMET = 7;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function HeroPulse() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const cometRef = useRef<SVGPathElement>(null);
  const cometCoreRef = useRef<SVGPathElement>(null);
  const [cycle, setCycle] = useState(0);
  const [hits, setHits] = useState(0);
  const [fading, setFading] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [size, setSize] = useState({ width: 600, height: 560 });

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width && height) setSize({ width, height });
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  // Cursor spotlight for the hero grid.
  useEffect(() => {
    const hero = rootRef.current?.closest("section");
    if (!hero || reduced) return;
    const move = (event: PointerEvent) => {
      const box = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", `${event.clientX - box.left}px`);
      hero.style.setProperty("--my", `${event.clientY - box.top}px`);
    };
    hero.addEventListener("pointermove", move);
    return () => hero.removeEventListener("pointermove", move);
  }, [reduced]);

  useEffect(() => {
    const path = pathRef.current;
    if (!path || reduced) return;

    // Arc-length fraction of each node, so notifications fire as the comet reaches them.
    const total = path.getTotalLength();
    const fractions = nodeIndexes.map((pointIndex) => {
      const tx = (points[pointIndex][0] / 100) * size.width;
      const ty = (points[pointIndex][1] / 100) * size.height;
      let best = 0;
      let bestDistance = Infinity;
      for (let step = 0; step <= 400; step++) {
        const point = path.getPointAtLength((total * step) / 400);
        const distance = (point.x - tx) ** 2 + (point.y - ty) ** 2;
        if (distance < bestDistance) {
          bestDistance = distance;
          best = step / 400;
        }
      }
      return best;
    });

    let frame = 0;
    let start = performance.now() + INTRO_MS;
    let cycleIndex = 0;
    let lastHits = -1;
    let lastFading = false;
    const setComet = (offset: number) => {
      for (const node of [cometRef.current, cometCoreRef.current]) node?.style.setProperty("stroke-dashoffset", String(offset));
    };

    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed < 0) {
        setComet(COMET);
      } else if (elapsed > RUN_MS + HOLD_MS + FADE_MS) {
        start = now;
        cycleIndex = (cycleIndex + 1) % cycles.length;
        setCycle(cycleIndex);
      } else {
        const progress = easeInOut(Math.min(1, elapsed / RUN_MS));
        setComet(COMET - progress * (100 + COMET));
        const nextHits = fractions.filter((fraction) => progress >= fraction).length;
        const nextFading = elapsed > RUN_MS + HOLD_MS;
        if (nextHits !== lastHits) setHits((lastHits = nextHits));
        if (nextFading !== lastFading) setFading((lastFading = nextFading));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced, size]);

  const pathD = smoothPath(size.width, size.height);
  const shownHits = reduced ? nodeIndexes.length : hits;
  const events = cycles[reduced ? 0 : cycle];

  return (
    <div ref={rootRef} className={styles.pulse} data-reduced={reduced} aria-hidden="true">
      <svg viewBox={`0 0 ${size.width} ${size.height}`}>
        <defs>
          <linearGradient id="pulse-line" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#6f57e8" stopOpacity="0" />
            <stop offset="0.35" stopColor="#8a75f6" stopOpacity="0.7" />
            <stop offset="1" stopColor="#c7b9ff" />
          </linearGradient>
          <linearGradient id="pulse-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8a75f6" stopOpacity="0.18" />
            <stop offset="1" stopColor="#8a75f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className={styles.pulseFill} d={`${pathD} L${size.width} ${size.height} L0 ${size.height} Z`} fill="url(#pulse-fill)" />
        <path ref={pathRef} className={styles.pulseLine} d={pathD} pathLength={100} />
        <path ref={cometRef} className={styles.pulseComet} d={pathD} pathLength={100} />
        <path ref={cometCoreRef} className={styles.pulseCometCore} d={pathD} pathLength={100} />
      </svg>

      {nodeIndexes.map((pointIndex, index) => {
        const [x, y] = points[pointIndex];
        const event = events[index];
        const Icon = event.icon;
        const hit = index < shownHits;
        return (
          <div
            key={pointIndex}
            className={styles.pulseNode}
            style={{ left: `${x}%`, top: `${y}%` }}
            data-hit={hit}
          >
            <i className={styles.pulseDot} key={hit ? `hit-${cycle}` : "idle"} />
            <div
              key={`${cycle}-${index}`}
              className={styles.pulseToast}
              data-placement={placements[index]}
              data-visible={hit && !fading}
              style={{ "--tone": event.tone } as CSSProperties}
            >
              <b><Icon /></b>
              <span>
                <strong>{event.title}</strong>
                <small>{event.detail}</small>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
