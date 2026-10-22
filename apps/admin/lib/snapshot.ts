/**
 * One read of everything Gecco HQ shows. It is loaded from the database (lib/load.ts) or from the
 * sample set (lib/sample.ts), and every figure on every screen is derived from these rows (lib/derive.ts),
 * so a total and the rows it sums can never disagree.
 *
 * Time is bucketed by week (Monday 00:00 UTC, as Postgres `date_trunc('week')` does). The last bucket is the
 * current, unfinished week. "Last 4 full weeks" excludes that last bucket. Growth charts include the current week.
 */

export type Role = "OWNER" | "STAFF" | "TRAINER";

export type GymRow = {
  id: string;
  name: string;
  timezone: string;
  seatLimit: number;
  isActive: boolean;
  createdAt: string;
  owner: { id: string; name: string; email: string } | null;
  membersTotal: number;
  /** Members whose record is ACTIVE. */
  membersActive: number;
  firstMemberAt: string | null;
  firstPaymentAt: string | null;
  /** The first trainer or staff account, or invite, whichever came first. */
  firstTeamAt: string | null;
  /** Active non-owner accounts. */
  teamActive: number;
  /** Team invites still waiting to be accepted; each holds a seat. */
  teamPending: number;
  /** The latest payment, member or sign-in recorded for this gym. */
  lastActivityAt: string | null;
  /** Aligned to Snapshot.weekStarts. Payments are rupees recorded as succeeded, by the date they were paid. */
  weekly: { payments: number[]; members: number[] };
  signupLink: { createdAt: string; createdBy: string } | null;
};

export type AccountRow = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  roles: { gymId: string; gymName: string; role: Role; isActive: boolean }[];
};

export type LinkRow = {
  id: string;
  gymName: string | null;
  email: string | null;
  seatLimit: number;
  note: string | null;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  revokedAt: string | null;
  createdBy: string;
  gym: { id: string; name: string } | null;
};

export type Snapshot = {
  source: "database" | "sample";
  now: string;
  /** Oldest first; the last entry is the current week. */
  weekStarts: string[];
  gyms: GymRow[];
  accounts: AccountRow[];
  links: LinkRow[];
};

export const WEEKS = 52;
