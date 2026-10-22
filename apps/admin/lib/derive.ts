import { daysBetween } from "./format";
import type { AccountRow, GymRow, LinkRow, Snapshot } from "./snapshot";

/** A gym counts as live when something was recorded for it in the last week. */
export const LIVE_WITHIN_DAYS = 7;
/** Waiting longer than this on one rung puts a gym on the attention list. */
export const STUCK_AFTER_DAYS = 7;
/** A signup link this close to expiry goes on the attention list. */
export const EXPIRING_WITHIN_DAYS = 3;

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

/* ---------- the activation ladder ---------- */

export type RungKey = "link" | "signup" | "members" | "payment" | "team" | "live";

export const RUNGS: { key: RungKey; label: string; waiting: string }[] = [
  { key: "link", label: "Link sent", waiting: "Waiting to sign up" },
  { key: "signup", label: "Signed up", waiting: "Waiting to sign up" },
  { key: "members", label: "Members added", waiting: "No members yet" },
  { key: "payment", label: "First payment", waiting: "No payment recorded" },
  { key: "team", label: "Team invited", waiting: "Owner working alone" },
  { key: "live", label: "Live this week", waiting: "Nothing recorded" },
];

export type GymProgress = {
  gym: GymRow;
  /** Index into RUNGS of the highest rung reached; 5 means live. */
  reached: number;
  /** The rung the gym is waiting on, or null when live. */
  waitingOn: RungKey | null;
  /** Days since the gym reached its last rung (for "live", since its last activity). */
  waitingDays: number;
};

export function progress(gym: GymRow, now: string): GymProgress {
  const milestones: [RungKey, string | null][] = [
    ["members", gym.firstMemberAt],
    ["payment", gym.firstPaymentAt],
    ["team", gym.firstTeamAt],
  ];
  let reached = 1;
  let since = gym.createdAt;
  for (const [key, at] of milestones) {
    if (!at) return { gym, reached, waitingOn: key, waitingDays: daysBetween(since, now) };
    reached += 1;
    since = at;
  }
  const quietDays = gym.lastActivityAt ? daysBetween(gym.lastActivityAt, now) : daysBetween(since, now);
  if (quietDays <= LIVE_WITHIN_DAYS) return { gym, reached: 5, waitingOn: null, waitingDays: 0 };
  return { gym, reached, waitingOn: "live", waitingDays: quietDays };
}

export type GymState = "onboarding" | "live" | "quiet" | "deactivated";

export function gymState(p: GymProgress): GymState {
  if (!p.gym.isActive) return "deactivated";
  if (p.waitingOn === null) return "live";
  if (p.waitingOn === "live") return "quiet";
  return "onboarding";
}

export const STATE_LABELS: Record<GymState, string> = {
  onboarding: "Onboarding",
  live: "Live",
  quiet: "Gone quiet",
  deactivated: "Deactivated",
};

export function linkStatus(link: LinkRow, now: string) {
  if (link.usedAt) return "signed-up" as const;
  if (link.revokedAt) return "revoked" as const;
  if (new Date(link.expiresAt) <= new Date(now)) return "expired" as const;
  return "waiting" as const;
}

export type Ladder = {
  rungs: {
    key: RungKey;
    label: string;
    /** How many have reached this rung. */
    reached: number;
    /** Who is waiting to climb past it, longest wait first. */
    waiting: { id: string; name: string; days: number; href: string | null }[];
  }[];
  /** Everyone on the ladder: active gyms plus links still waiting. */
  total: number;
};

export function ladder(snapshot: Snapshot): Ladder {
  const { now } = snapshot;
  const gyms = snapshot.gyms.filter((gym) => gym.isActive).map((gym) => progress(gym, now));
  const pendingLinks = snapshot.links.filter((link) => linkStatus(link, now) === "waiting");
  const total = gyms.length + pendingLinks.length;

  const rungs = RUNGS.map((rung, index) => {
    if (rung.key === "link") {
      return {
        key: rung.key,
        label: rung.label,
        reached: total,
        waiting: pendingLinks
          .map((link) => ({
            id: link.id,
            name: link.gymName ?? link.email ?? "Unnamed gym",
            days: daysBetween(link.createdAt, now),
            href: "/onboarding",
          }))
          .sort((a, b) => b.days - a.days),
      };
    }
    // Gyms waiting on the next rung sit on this one.
    const next = RUNGS[index + 1]?.key ?? null;
    return {
      key: rung.key,
      label: rung.label,
      reached: gyms.filter((p) => p.reached >= index).length,
      waiting: next
        ? gyms
            .filter((p) => p.waitingOn === next)
            .map((p) => ({ id: p.gym.id, name: p.gym.name, days: p.waitingDays, href: `/gyms/${p.gym.id}` }))
            .sort((a, b) => b.days - a.days)
        : [],
    };
  });

  return { rungs, total };
}

/* ---------- headline figures ---------- */

/**
 * The last `weeks` full weeks and the same number before them. The current week is left out of both, so a
 * Thursday never compares four days against seven; these are the solid bars on the weekly charts.
 */
export function lastWeeks(snapshot: Snapshot, weeks: number) {
  // Every gym, deactivated ones included: those payments and members were really recorded.
  const all = snapshot.gyms;
  const n = snapshot.weekStarts.length;
  const since = snapshot.weekStarts[n - 1 - weeks];
  const before = snapshot.weekStarts[n - 1 - weeks * 2];
  const until = snapshot.weekStarts[n - 1];
  const inWindow = (at: string) => at >= since && at < until;
  const inPrior = (at: string) => at >= before && at < since;
  const window = (values: number[]) => sum(values.slice(n - 1 - weeks, n - 1));
  const prior = (values: number[]) => sum(values.slice(n - 1 - weeks * 2, n - 1 - weeks));
  return {
    since,
    until,
    payments: sum(all.map((gym) => window(gym.weekly.payments))),
    paymentsPrior: sum(all.map((gym) => prior(gym.weekly.payments))),
    membersAdded: sum(all.map((gym) => window(gym.weekly.members))),
    accounts: snapshot.accounts.filter((account) => inWindow(account.createdAt)),
    accountsPrior: snapshot.accounts.filter((account) => inPrior(account.createdAt)).length,
    gymsJoined: snapshot.gyms.filter((gym) => inWindow(gym.createdAt)).length,
  };
}

export function isOwner(account: AccountRow) {
  return account.roles.some((role) => role.role === "OWNER");
}

/* ---------- what needs a person ---------- */

export type Attention = {
  id: string;
  title: string;
  detail: string;
  href: string;
  action: string;
  /** Sort weight: smaller is more urgent. */
  urgency: number;
};

export function attention(snapshot: Snapshot): Attention[] {
  const { now } = snapshot;
  const items: Attention[] = [];

  for (const link of snapshot.links) {
    if (linkStatus(link, now) !== "waiting") continue;
    const left = daysBetween(now, link.expiresAt);
    if (left > EXPIRING_WITHIN_DAYS) continue;
    items.push({
      id: `link-${link.id}`,
      title: link.gymName ?? link.email ?? "Unnamed gym",
      detail: left <= 0 ? "Signup link expires today" : `Signup link expires in ${left} ${left === 1 ? "day" : "days"}`,
      href: "/onboarding",
      action: "Reissue",
      urgency: left,
    });
  }

  for (const gym of snapshot.gyms) {
    if (!gym.isActive) continue;
    const p = progress(gym, now);
    if (p.waitingOn && p.waitingDays > STUCK_AFTER_DAYS) {
      const rung = RUNGS.find((item) => item.key === p.waitingOn)!;
      items.push({
        id: `stuck-${gym.id}`,
        title: gym.name,
        detail: `${rung.waiting} for ${p.waitingDays} days`,
        href: `/gyms/${gym.id}`,
        action: "Open",
        urgency: 10 - Math.min(p.waitingDays / 10, 5),
      });
    }
    if (gym.teamActive + gym.teamPending >= gym.seatLimit && gym.seatLimit > 0) {
      items.push({
        id: `seats-${gym.id}`,
        title: gym.name,
        detail: `All ${gym.seatLimit} team seats in use`,
        href: `/gyms/${gym.id}`,
        action: "Add seats",
        urgency: 20,
      });
    }
  }

  return items.sort((a, b) => a.urgency - b.urgency);
}

/* ---------- series ---------- */

export type Series = { labels: string[]; perWeek: number[]; running: number[] };

/** Per-week values over the last `weeks` buckets and their running total, started from `baseline`. */
export function series(weekStarts: string[], perWeekAll: number[], weeks: number, baseline: number): Series {
  const perWeek = perWeekAll.slice(-weeks);
  const running: number[] = [];
  perWeek.reduce((total, value) => {
    const next = total + value;
    running.push(next);
    return next;
  }, baseline);
  return { labels: weekStarts.slice(-weeks), perWeek, running };
}

/** Counts dated events into the week buckets; anything before the first bucket is returned as `before`. */
export function bucket(weekStarts: string[], dates: string[]) {
  const counts = weekStarts.map(() => 0);
  let before = 0;
  for (const date of dates) {
    let index = -1;
    for (let i = weekStarts.length - 1; i >= 0; i -= 1) {
      if (date >= weekStarts[i]) {
        index = i;
        break;
      }
    }
    if (index < 0) before += 1;
    else counts[index] += 1;
  }
  return { counts, before };
}

export function addWeekly(gyms: GymRow[], key: "payments" | "members", length: number) {
  const totals = Array.from({ length }, () => 0);
  for (const gym of gyms) gym.weekly[key].forEach((value, index) => (totals[index] += value));
  return totals;
}

export function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
