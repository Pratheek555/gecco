import type { AccountRow, GymRow, LinkRow, Role, Snapshot } from "./snapshot";
import { WEEKS } from "./snapshot";

/**
 * Sample data for design work (ADMIN_SAMPLE_DATA=1). Fourteen gyms over nine months, the way an early Gecco
 * looks: older gyms signed up before signups were invite-only, so only the last five carry a signup link.
 * Every weekly figure is generated per gym and every total on screen is summed from these rows.
 * Replace nothing here for production: the live console reads the database (lib/load.ts).
 */

const NOW = new Date("2026-10-22T05:00:00Z"); // 10:30 in Bengaluru
const DAY = 86_400_000;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const daysAgo = (days: number, hour = 6) => {
  const date = new Date(NOW.getTime() - days * DAY);
  date.setUTCHours(hour, 0, 0, 0);
  return date;
};
const iso = (date: Date | null) => (date ? date.toISOString() : null);

function mondayOf(date: Date) {
  const monday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  return monday;
}

const currentWeek = mondayOf(NOW);
const weekStarts = Array.from({ length: WEEKS }, (_, i) => new Date(currentWeek.getTime() - (WEEKS - 1 - i) * 7 * DAY));
const weekIndex = (date: Date) => Math.floor((mondayOf(date).getTime() - weekStarts[0].getTime()) / (7 * DAY));

type GymSpec = {
  name: string;
  owner: [string, string];
  age: number;
  /** Days after signup, or null when not reached. */
  firstMember: number | null;
  firstPayment: number | null;
  firstTeam: number | null;
  members: number;
  /** Rupees a week once the gym is settled in. */
  weeklyTakings: number;
  seatLimit: number;
  team: [Role, string][];
  pendingInvites: number;
  lastActivity: number;
  deactivatedDaysAgo?: number;
  link?: { daysBeforeSignup: number; by: string };
};

const STAFF = { ananya: "Ananya Iyer", rohan: "Rohan Mehta" };

const GYMS: GymSpec[] = [
  { name: "Ironhouse Strength", owner: ["Vikram Shetty", "vikram@ironhouse.in"], age: 238, firstMember: 1, firstPayment: 3, firstTeam: 6, members: 412, weeklyTakings: 262000, seatLimit: 5, team: [["TRAINER", "Karthik Gowda"], ["TRAINER", "Divya Rao"], ["STAFF", "Manjunath K"], ["TRAINER", "Arjun Nair"]], pendingInvites: 0, lastActivity: 0 },
  { name: "Pulse Fitness Koramangala", owner: ["Neha Kapoor", "neha@pulsefitness.co.in"], age: 205, firstMember: 2, firstPayment: 4, firstTeam: 9, members: 286, weeklyTakings: 191000, seatLimit: 5, team: [["TRAINER", "Siddharth Jain"], ["TRAINER", "Pooja Menon"], ["STAFF", "Ravi Kumar"], ["TRAINER", "Faisal Ahmed"]], pendingInvites: 1, lastActivity: 0 },
  { name: "Anvil Barbell Club", owner: ["Aditya Bhat", "aditya@anvilbarbell.in"], age: 180, firstMember: 3, firstPayment: 8, firstTeam: 15, members: 164, weeklyTakings: 108000, seatLimit: 5, team: [["TRAINER", "Naveen Reddy"], ["STAFF", "Sunita Das"]], pendingInvites: 0, lastActivity: 16 },
  { name: "Shakti Women's Gym", owner: ["Lakshmi Narayan", "lakshmi@shaktigym.in"], age: 151, firstMember: 1, firstPayment: 2, firstTeam: 5, members: 198, weeklyTakings: 121000, seatLimit: 5, team: [["TRAINER", "Kavya Hegde"], ["TRAINER", "Meera Pillai"], ["STAFF", "Anjali Sharma"]], pendingInvites: 0, lastActivity: 1 },
  { name: "CrossBox HSR", owner: ["Rahul Verma", "rahul@crossboxhsr.com"], age: 133, firstMember: 4, firstPayment: 6, firstTeam: 11, members: 121, weeklyTakings: 94500, seatLimit: 5, team: [["TRAINER", "Imran Sheikh"], ["TRAINER", "Tanvi Joshi"]], pendingInvites: 0, lastActivity: 2 },
  { name: "Tribe Fitness Whitefield", owner: ["Sameer Kulkarni", "sameer@tribefitness.in"], age: 110, firstMember: 2, firstPayment: 3, firstTeam: 4, members: 240, weeklyTakings: 168000, seatLimit: 8, team: [["TRAINER", "Gaurav Singh"], ["TRAINER", "Nisha Thomas"], ["STAFF", "Prakash Murthy"], ["TRAINER", "Rekha Iyengar"]], pendingInvites: 0, lastActivity: 0 },
  { name: "The Squat Rack", owner: ["Omkar Deshpande", "omkar@thesquatrack.in"], age: 96, firstMember: 5, firstPayment: 9, firstTeam: 20, members: 88, weeklyTakings: 52000, seatLimit: 5, team: [["TRAINER", "Shreya Patil"]], pendingInvites: 0, lastActivity: 3 },
  { name: "Muscle Mantra", owner: ["Syed Abbas", "abbas@musclemantra.in"], age: 82, firstMember: 2, firstPayment: 5, firstTeam: null, members: 140, weeklyTakings: 77000, seatLimit: 5, team: [], pendingInvites: 0, lastActivity: 1 },
  { name: "Kinetic Studio", owner: ["Harish Rao", "harish@kineticstudio.in"], age: 64, firstMember: 6, firstPayment: 10, firstTeam: 12, members: 47, weeklyTakings: 26000, seatLimit: 5, team: [["TRAINER", "Deepa Krishnan"]], pendingInvites: 0, lastActivity: 21, deactivatedDaysAgo: 19 },
  { name: "Gold Standard Gym", owner: ["Manish Agarwal", "manish@goldstandardgym.in"], age: 41, firstMember: 1, firstPayment: 2, firstTeam: 7, members: 96, weeklyTakings: 71000, seatLimit: 5, team: [["TRAINER", "Rohit Bansal"], ["STAFF", "Geeta Yadav"]], pendingInvites: 0, lastActivity: 0, link: { daysBeforeSignup: 2, by: STAFF.ananya } },
  { name: "Hustle Hub", owner: ["Kiran Prasad", "kiran@hustlehub.fit"], age: 23, firstMember: 11, firstPayment: null, firstTeam: null, members: 37, weeklyTakings: 0, seatLimit: 5, team: [], pendingInvites: 0, lastActivity: 2, link: { daysBeforeSignup: 1, by: STAFF.rohan } },
  { name: "Peak Performance Pune", owner: ["Aarti Gokhale", "aarti@peakperformance.in"], age: 12, firstMember: null, firstPayment: null, firstTeam: null, members: 0, weeklyTakings: 0, seatLimit: 5, team: [], pendingInvites: 0, lastActivity: 9, link: { daysBeforeSignup: 3, by: STAFF.ananya } },
  { name: "Urban Lift Studio", owner: ["Zoya Merchant", "zoya@urbanlift.studio"], age: 4, firstMember: null, firstPayment: null, firstTeam: null, members: 0, weeklyTakings: 0, seatLimit: 3, team: [], pendingInvites: 0, lastActivity: 4, link: { daysBeforeSignup: 1, by: STAFF.rohan } },
  { name: "Forge Fitness Kochi", owner: ["Joseph Mathew", "joseph@forgefitness.in"], age: 1, firstMember: null, firstPayment: null, firstTeam: null, members: 0, weeklyTakings: 0, seatLimit: 5, team: [], pendingInvites: 0, lastActivity: 1, link: { daysBeforeSignup: 2, by: STAFF.ananya } },
];

/** Monthly memberships mostly renew in the first week of the month; January brings the resolution crowd. */
function seasonal(weekStart: Date) {
  const firstWeek = weekStart.getUTCDate() <= 7 || new Date(weekStart.getTime() + 6 * DAY).getUTCDate() <= 6;
  const january = weekStart.getUTCMonth() === 0;
  return (firstWeek ? 1.45 : 0.86) * (january ? 1.22 : 1);
}

function buildGym(spec: GymSpec, index: number): { gym: GymRow; accounts: AccountRow[]; link: LinkRow | null } {
  const random = mulberry32(1000 + index * 97);
  const id = `gym-${String(index + 1).padStart(2, "0")}-${spec.name.toLowerCase().replace(/[^a-z]+/g, "-").replace(/-$/, "")}`;
  const createdAt = daysAgo(spec.age, 5 + (index % 5));
  const after = (days: number | null) => (days === null ? null : new Date(createdAt.getTime() + days * DAY));
  const firstMemberAt = after(spec.firstMember);
  const firstPaymentAt = after(spec.firstPayment);
  const firstTeamAt = after(spec.firstTeam);
  const stoppedAt = spec.deactivatedDaysAgo ?? null;
  const lastActivityAt = daysAgo(spec.lastActivity, 8 + (index % 6));

  const members = Array.from({ length: WEEKS }, () => 0);
  if (firstMemberAt && spec.members > 0) {
    // Most gyms import their register in the first week, then add a few each week.
    const start = weekIndex(firstMemberAt);
    const end = stoppedAt !== null ? weekIndex(daysAgo(stoppedAt)) : spec.lastActivity > 7 ? weekIndex(lastActivityAt) : WEEKS - 1;
    const imported = Math.round(spec.members * (0.62 + random() * 0.12));
    members[start] = imported;
    const rest = spec.members - imported;
    const weeks = Math.max(end - start, 1);
    let placed = 0;
    for (let w = start + 1; w <= end; w += 1) {
      const share = w === end ? rest - placed : Math.round((rest / weeks) * (0.6 + random() * 0.8));
      const value = Math.max(0, Math.min(share, rest - placed));
      members[w] = value;
      placed += value;
    }
    if (placed < rest) members[start] += rest - placed;
  }

  const payments = Array.from({ length: WEEKS }, () => 0);
  if (firstPaymentAt && spec.weeklyTakings > 0) {
    const start = weekIndex(firstPaymentAt);
    const end = stoppedAt !== null ? weekIndex(daysAgo(stoppedAt)) : spec.lastActivity > 7 ? weekIndex(lastActivityAt) : WEEKS - 1;
    for (let w = start; w <= end; w += 1) {
      const ramp = Math.min(1, 0.35 + (w - start) * 0.18);
      const noise = 0.88 + random() * 0.24;
      // The current week is only four days old.
      const partial = w === WEEKS - 1 ? 0.52 : 1;
      payments[w] = Math.round((spec.weeklyTakings * ramp * noise * seasonal(weekStarts[w]) * partial) / 100) * 100;
    }
  }

  const ownerId = `${id}-owner`;
  const accounts: AccountRow[] = [
    {
      id: ownerId,
      name: spec.owner[0],
      email: spec.owner[1],
      createdAt: createdAt.toISOString(),
      lastSignInAt: iso(daysAgo(Math.min(spec.lastActivity, spec.age), 7 + (index % 4))),
      roles: [{ gymId: id, gymName: spec.name, role: "OWNER", isActive: true }],
    },
  ];
  const domain = spec.owner[1].split("@")[1];
  spec.team.forEach(([role, name], t) => {
    const joined = new Date((firstTeamAt ?? createdAt).getTime() + t * (3 + Math.floor(random() * 9)) * DAY);
    const seenDaysAgo = Math.min(Math.floor(random() * 6) + spec.lastActivity, spec.age);
    accounts.push({
      id: `${id}-team-${t + 1}`,
      name,
      email: `${name.split(" ")[0].toLowerCase()}@${domain}`,
      createdAt: joined.toISOString(),
      lastSignInAt: iso(daysAgo(seenDaysAgo, 6 + t)),
      roles: [{ gymId: id, gymName: spec.name, role, isActive: spec.deactivatedDaysAgo === undefined }],
    });
  });

  const link: LinkRow | null = spec.link
    ? {
        id: `${id}-link`,
        gymName: spec.name,
        email: spec.owner[1],
        seatLimit: spec.seatLimit,
        note: null,
        createdAt: new Date(createdAt.getTime() - spec.link.daysBeforeSignup * DAY).toISOString(),
        expiresAt: new Date(createdAt.getTime() + (14 - spec.link.daysBeforeSignup) * DAY).toISOString(),
        usedAt: createdAt.toISOString(),
        revokedAt: null,
        createdBy: spec.link.by,
        gym: { id, name: spec.name },
      }
    : null;

  const gym: GymRow = {
    id,
    name: spec.name,
    timezone: "Asia/Kolkata",
    seatLimit: spec.seatLimit,
    isActive: spec.deactivatedDaysAgo === undefined,
    createdAt: createdAt.toISOString(),
    owner: { id: ownerId, name: spec.owner[0], email: spec.owner[1] },
    membersTotal: members.reduce((a, b) => a + b, 0),
    membersActive: spec.deactivatedDaysAgo === undefined ? Math.round(spec.members * 0.84) : 0,
    firstMemberAt: iso(firstMemberAt),
    firstPaymentAt: iso(firstPaymentAt),
    firstTeamAt: iso(firstTeamAt),
    teamActive: spec.team.length,
    teamPending: spec.pendingInvites,
    lastActivityAt: lastActivityAt.toISOString(),
    weekly: { payments, members },
    signupLink: link ? { createdAt: link.createdAt, createdBy: link.createdBy } : null,
  };

  return { gym, accounts, link };
}

const PENDING_LINKS: Omit<LinkRow, "id" | "usedAt" | "revokedAt" | "gym">[] = [
  { gymName: "Bodyworks Mysuru", email: "suresh@bodyworksmysuru.in", seatLimit: 5, note: "Met at the Mysuru fitness expo", createdAt: daysAgo(12).toISOString(), expiresAt: daysAgo(-2).toISOString(), createdBy: STAFF.rohan },
  { gymName: "Elevate Gym Hyderabad", email: null, seatLimit: 5, note: null, createdAt: daysAgo(9).toISOString(), expiresAt: daysAgo(-5).toISOString(), createdBy: STAFF.ananya },
  { gymName: "Iron Temple Chennai", email: "priya@irontemple.in", seatLimit: 8, note: "Two branches; second one next quarter", createdAt: daysAgo(5).toISOString(), expiresAt: daysAgo(-9).toISOString(), createdBy: STAFF.ananya },
  { gymName: null, email: "owner@fitzonebelagavi.in", seatLimit: 5, note: "Referred by Vikram (Ironhouse)", createdAt: daysAgo(1).toISOString(), expiresAt: daysAgo(-13).toISOString(), createdBy: STAFF.rohan },
];

const CLOSED_LINKS: LinkRow[] = [
  { id: "link-core-club", gymName: "Core Club Gurugram", email: "nitin@coreclub.in", seatLimit: 5, note: null, createdAt: daysAgo(44).toISOString(), expiresAt: daysAgo(30).toISOString(), usedAt: null, revokedAt: null, createdBy: STAFF.rohan, gym: null },
  { id: "link-unnamed-expired", gymName: null, email: null, seatLimit: 5, note: "Walk-in demo", createdAt: daysAgo(33).toISOString(), expiresAt: daysAgo(19).toISOString(), usedAt: null, revokedAt: null, createdBy: STAFF.ananya, gym: null },
  { id: "link-fitlab-revoked", gymName: "FitLab Indore", email: "ops@fitlab.in", seatLimit: 5, note: "Sent to the wrong email", createdAt: daysAgo(27).toISOString(), expiresAt: daysAgo(13).toISOString(), usedAt: null, revokedAt: daysAgo(26).toISOString(), createdBy: STAFF.ananya, gym: null },
];

export function sampleSnapshot(): Snapshot {
  const built = GYMS.map(buildGym);
  const links: LinkRow[] = [
    ...PENDING_LINKS.map((link, i) => ({ ...link, id: `link-pending-${i + 1}`, usedAt: null, revokedAt: null, gym: null })),
    ...built.flatMap((item) => (item.link ? [item.link] : [])),
    ...CLOSED_LINKS,
  ];

  const snapshot: Snapshot = {
    source: "sample",
    now: NOW.toISOString(),
    weekStarts: weekStarts.map((date) => date.toISOString()),
    gyms: built.map((item) => item.gym),
    accounts: built.flatMap((item) => item.accounts),
    links,
  };

  // The figures that must agree, checked whenever the sample loads.
  for (const gym of snapshot.gyms) {
    const spec = GYMS.find((item) => item.name === gym.name)!;
    console.assert(gym.membersTotal === spec.members, `${gym.name}: weekly members sum to ${gym.membersTotal}, not ${spec.members}`);
    console.assert(gym.teamActive === snapshot.accounts.filter((a) => a.roles.some((r) => r.gymId === gym.id && r.role !== "OWNER")).length, `${gym.name}: team count`);
  }
  return snapshot;
}
