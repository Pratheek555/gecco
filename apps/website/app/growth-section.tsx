"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import {
  Camera,
  CreditCard,
  FileSpreadsheet,
  Footprints,
  Globe,
  IndianRupee,
  MessageCircle,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import styles from "./growth.module.css";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/** `inView` gates loops to when someone can see them; `seen` latches the one-time entrance. */
function useInView(ref: RefObject<Element | null>, threshold = 0.25) {
  const [state, setState] = useState({ inView: false, seen: false });
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setState((previous) => ({
          inView: entry.isIntersecting,
          seen: previous.seen || entry.isIntersecting,
        })),
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, threshold]);
  return state;
}

/* Collections meter: each month fills further than the last. */

const months = [
  { label: "August", amount: 451200, previous: { label: "Jul", amount: 390000 } },
  { label: "September", amount: 530600, previous: { label: "Aug", amount: 451200 } },
  { label: "October", amount: 624800, previous: { label: "Sep", amount: 530600 } },
];
const changeText = (index: number) => {
  const { amount, previous } = months[index];
  return `+${(((amount - previous.amount) / previous.amount) * 100).toFixed(1)}% vs ${previous.label}`;
};
const METER_BARS = 44;
const METER_MAX = 760000;
const FILL_MS = 2600;
const HOLD_MS = 1900;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function CollectionsMeter({ active }: { active: boolean }) {
  const meterRef = useRef<HTMLDivElement>(null);
  const amountRef = useRef<HTMLElement>(null);
  const changeRef = useRef<HTMLElement>(null);
  const monthRef = useRef<HTMLSpanElement>(null);
  const prevRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const meter = meterRef.current;
    if (!meter) return;
    const render = (index: number, progress: number) => {
      const { amount } = months[index];
      meter.style.setProperty("--p", String((amount / METER_MAX) * progress));
      // Once this month passes last month's total, the marker lights up.
      meter.dataset.beaten = String(amount * progress > months[index].previous.amount);
      if (amountRef.current)
        amountRef.current.textContent = inr.format(Math.round((amount * progress) / 100) * 100);
    };

    const showMonth = (index: number, animate = true) => {
      const { label, previous } = months[index];
      meter.style.setProperty("--prev", String(previous.amount / METER_MAX));
      if (prevRef.current) prevRef.current.textContent = previous.label;
      if (changeRef.current) changeRef.current.textContent = changeText(index);
      if (!monthRef.current) return;
      monthRef.current.textContent = label;
      if (animate) {
        for (const node of [monthRef.current, changeRef.current]) {
          node?.animate(
            [
              { opacity: 0, transform: "translateY(6px)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: 500, easing: "ease-out" },
          );
        }
      }
    };

    if (!active) {
      showMonth(months.length - 1, false);
      render(months.length - 1, 1);
      return;
    }

    let frame = 0;
    let index = 0;
    let start = performance.now();
    showMonth(0);
    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed > FILL_MS + HOLD_MS) {
        index = (index + 1) % months.length;
        start = now;
        showMonth(index);
      }
      render(index, easeOut(Math.min(1, (now - start) / FILL_MS)));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return (
    <>
      <div className={styles.meterHead}>
        <div>
          <span ref={monthRef} className={styles.monthLabel}>
            {months[2].label}
          </span>
          <strong ref={amountRef} className={styles.bigNumber}>
            {inr.format(months[2].amount)}
          </strong>
        </div>
        <em ref={changeRef} className={styles.delta}>
          {changeText(months.length - 1)}
        </em>
      </div>
      <div ref={meterRef} className={styles.meter} aria-hidden="true">
        {Array.from({ length: METER_BARS }, (_, index) => (
          <i key={index} style={{ "--i": index } as CSSProperties} />
        ))}
        <span className={styles.prevMarker}>
          <span ref={prevRef}>{months[2].previous.label}</span>
        </span>
        <span className={styles.meterGlow} />
      </div>
    </>
  );
}

/* Lead stack: enquiries arrive and work their way to "Joined". */

const leadPool = [
  { name: "Priya Nair", source: "Instagram" },
  { name: "Rahul Verma", source: "Walk-in" },
  { name: "Sneha Rao", source: "Google" },
  { name: "Karthik Bhat", source: "Referral" },
  { name: "Meera Kapoor", source: "Website" },
  { name: "Arjun Iyer", source: "Instagram" },
  { name: "Diya Menon", source: "Walk-in" },
  { name: "Nikhil Gowda", source: "Google" },
];
const stages = [
  { label: "New enquiry", tone: "new" },
  { label: "Replied on WhatsApp", tone: "replied" },
  { label: "Trial booked", tone: "trial" },
  { label: "Joined", tone: "joined" },
] as const;
const LEAD_TICK_MS = 1500;
const VISIBLE_LEADS = 6;

function LeadStack({ active, reduced }: { active: boolean; reduced: boolean }) {
  const [tick, setTick] = useState(6);

  useEffect(() => {
    if (!active || reduced) return;
    const timer = window.setInterval(() => setTick((value) => value + 1), LEAD_TICK_MS);
    return () => window.clearInterval(timer);
  }, [active, reduced]);

  // Lead n arrives on tick n and advances one stage per tick.
  const leads = Array.from({ length: VISIBLE_LEADS }, (_, offset) => {
    const id = tick - offset;
    const stage = stages[Math.min(offset, stages.length - 1)];
    return { id, ...leadPool[((id % leadPool.length) + leadPool.length) % leadPool.length], stage };
  });
  const joined = 12 + Math.max(0, tick - 6);

  return (
    <>
      <div className={styles.joinedCount}>
        <span>Joined this month</span>
        <strong key={joined}>{joined}</strong>
      </div>
      <div className={styles.leadStack}>
        <ul aria-hidden="true">
          {leads.map((lead) => (
            <li key={lead.id} className={styles.leadCard}>
              <i className={styles.leadAvatar}>
                {lead.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </i>
              <span>
                <b>{lead.name}</b>
                <small>{lead.source}</small>
              </span>
              <em data-tone={lead.stage.tone}>{lead.stage.label}</em>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

/* Drifting channel chips. */

const chips = [
  { label: "Instagram", icon: Camera, tone: "#f472b6" },
  { label: "WhatsApp", icon: MessageCircle, tone: "#34d399" },
  { label: "UPI", icon: IndianRupee, tone: "#a998ff" },
  { label: "Google", icon: Search, tone: "#60a5fa" },
  { label: "Walk-ins", icon: Footprints, tone: "#fbbf24" },
  { label: "Card", icon: CreditCard, tone: "#a998ff" },
  { label: "CSV import", icon: FileSpreadsheet, tone: "#34d399" },
  { label: "Referrals", icon: Users, tone: "#f472b6" },
  { label: "Cash", icon: Wallet, tone: "#fbbf24" },
  { label: "Website", icon: Globe, tone: "#60a5fa" },
];

function ChipColumn({ items, offset }: { items: typeof chips; offset: number }) {
  return (
    <div className={styles.chipColumn} style={{ "--offset": `${offset}s` } as CSSProperties}>
      {[0, 1].map((copy) => (
        <ul key={copy} aria-hidden={copy === 1 || undefined}>
          {items.map(({ label, icon: Icon, tone }) => (
            <li key={label} className={styles.chip} style={{ "--tone": tone } as CSSProperties}>
              <Icon /> {label}
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

/* Big member number with marquee pills. */

function useCountUp(target: number, run: boolean, duration = 1800) {
  const [value, setValue] = useState(target);
  useEffect(() => {
    if (!run) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = easeOut(Math.min(1, (now - start) / duration));
      setValue(Math.round(target * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, run, duration]);
  return value;
}

const pillRows = [
  [
    "140 active plans",
    "9 renewals this week",
    "83% collected",
    "₹6.2L this month",
    "22 follow-ups today",
  ],
  ["63% trial win rate", "0 missed expiries", "6 trials booked", "24 dues chased", "3 trainers"],
];

/* Active members curve. */

const curve = [
  96, 99, 97, 104, 108, 106, 113, 118, 116, 124, 129, 127, 134, 140, 138, 146, 151, 149, 157, 164,
];

function curvePath(width: number, height: number) {
  const min = 86;
  const max = 172;
  const points = curve.map((value, index) => [
    (index / (curve.length - 1)) * width,
    height - ((value - min) / (max - min)) * height,
  ]);
  return points
    .map(([x, y], index) => {
      if (index === 0) return `M${x.toFixed(1)} ${y.toFixed(1)}`;
      const [px, py] = points[index - 1];
      const cx = (px + x) / 2;
      return `C${cx.toFixed(1)} ${py.toFixed(1)} ${cx.toFixed(1)} ${y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

const CHART_W = 760;
const CHART_H = 150;
const linePath = curvePath(CHART_W, CHART_H);

export default function GrowthSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const { inView, seen } = useInView(sectionRef, 0.15);
  const active = inView && !reduced;

  const members = useCountUp(164, seen && !reduced);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      data-seen={seen || reduced}
      data-paused={!active}
      aria-labelledby="growth-title"
    >
      <div className={styles.intro}>
        <span className={styles.eyebrow}>Growth</span>
        <h2 id="growth-title">
          A bigger gym,
          <br />
          <em>every single month.</em>
        </h2>
        <p>
          Gecco turns the busywork — follow-ups, renewals, dues — into a system that keeps enquiries
          converting, members renewing and money coming in.
        </p>
      </div>

      <div className={styles.bento}>
        <article className={`${styles.tile} ${styles.revenue}`}>
          <header>
            <span className={styles.eyebrow}>Collections</span>
            <h3>Watch every month close higher</h3>
            <p>
              Renewals, UPI and cash land in one ledger, so you see the month build as it happens.
            </p>
          </header>
          <CollectionsMeter active={active} />
        </article>

        <article className={`${styles.tile} ${styles.leads}`}>
          <LeadStack active={active} reduced={reduced} />
          <footer>
            <span className={styles.eyebrow}>Leads</span>
            <h3>Every enquiry, walked to the front desk</h3>
            <p>
              Reply first on WhatsApp, book the trial, and see who joined — before they try the gym
              down the road.
            </p>
          </footer>
        </article>

        <article className={`${styles.tile} ${styles.channels}`}>
          <div className={styles.chipField} aria-hidden="true">
            <ChipColumn items={chips.slice(0, 5)} offset={0} />
            <ChipColumn items={chips.slice(5)} offset={-7} />
          </div>
          <footer>
            <span className={styles.eyebrow}>Fits right in</span>
            <h3>Works the way you already do</h3>
            <p>
              Leads from Instagram, Google and walk-ins. Payments by UPI, cash or card. Your old
              member sheet, imported.
            </p>
          </footer>
        </article>

        <article className={`${styles.tile} ${styles.feature}`}>
          <div className={styles.featureNumber}>
            <strong>{members}</strong>
            <span>members and counting</span>
          </div>
          <div className={styles.pillRows} aria-hidden="true">
            {pillRows.map((row, rowIndex) => (
              <div key={rowIndex} className={styles.pillTrack} data-reverse={rowIndex === 1}>
                {[0, 1].map((copy) => (
                  <ul key={copy}>
                    {row.map((pill) => (
                      <li key={pill}>{pill}</li>
                    ))}
                  </ul>
                ))}
              </div>
            ))}
          </div>
        </article>

        <article className={`${styles.tile} ${styles.chart}`}>
          <div className={styles.chartArea} aria-hidden="true">
            <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="growth-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#8a75f6" stopOpacity="0.38" />
                  <stop offset="1" stopColor="#8a75f6" stopOpacity="0" />
                </linearGradient>
                <filter id="growth-glow" x="-20%" y="-200%" width="140%" height="500%">
                  <feGaussianBlur stdDeviation="5" />
                </filter>
              </defs>
              <path
                className={styles.chartFill}
                d={`${linePath} L${CHART_W} ${CHART_H} L0 ${CHART_H} Z`}
                fill="url(#growth-area)"
              />
              <path className={styles.chartLine} d={linePath} pathLength={100} />
              <path
                className={styles.chartComet}
                d={linePath}
                pathLength={100}
                filter="url(#growth-glow)"
              />
              <path className={styles.chartCometCore} d={linePath} pathLength={100} />
            </svg>
            <span className={styles.marker} style={{ left: "8%", top: "70%" }}>
              <b>Jan</b> 96 active
            </span>
            <span
              className={`${styles.marker} ${styles.markerUp}`}
              style={{ left: "88%", top: "6%" }}
            >
              <b>Today</b> 164 active
            </span>
          </div>
          <footer>
            <span className={styles.eyebrow}>Retention</span>
            <h3>Growth that compounds</h3>
            <p>
              Expiries are flagged before they lapse, so fewer members slip away — and every new
              join adds to the base.
            </p>
          </footer>
        </article>
      </div>
    </section>
  );
}
