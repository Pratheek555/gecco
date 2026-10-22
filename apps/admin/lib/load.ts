import "server-only";

import { cache } from "react";
import { prisma } from "db/client";
import { sampleSnapshot } from "./sample";
import { requireAdmin } from "./auth";
import { isSampleMode } from "./mode";
import { WEEKS, type AccountRow, type GymRow, type LinkRow, type Role, type Snapshot } from "./snapshot";

const DAY = 86_400_000;

/** Sample data is for local design work only and is never served by a production build. */
export { isSampleMode } from "./mode";

function weekStartsEnding(now: Date) {
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  return Array.from({ length: WEEKS }, (_, i) => new Date(monday.getTime() - (WEEKS - 1 - i) * 7 * DAY));
}

const iso = (date: Date | null | undefined) => (date ? date.toISOString() : null);
const latest = (...dates: (Date | null | undefined)[]) =>
  dates.reduce<Date | null>((max, date) => (date && (!max || date > max) ? date : max), null);
const earliest = (...dates: (Date | null | undefined)[]) =>
  dates.reduce<Date | null>((min, date) => (date && (!min || date < min) ? date : min), null);

type WeeklyRow = { gym_id: string; week: Date; value: number };

/** One read of the whole platform. Cached per request, so every block on a screen sees the same moment. */
export const loadSnapshot = cache(async (): Promise<Snapshot> => {
  await requireAdmin();
  if (isSampleMode) return sampleSnapshot();

  const now = new Date();
  const weekStarts = weekStartsEnding(now);
  const windowStart = weekStarts[0];

  const [
    gyms,
    memberStats,
    activeMembers,
    paymentStats,
    teamStats,
    inviteStats,
    pendingInvites,
    sessionStats,
    weeklyPayments,
    weeklyMembers,
    users,
    links,
  ] = await Promise.all([
    prisma.gym.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        timezone: true,
        seatLimit: true,
        isActive: true,
        createdAt: true,
        users: {
          where: { role: "OWNER" },
          orderBy: { createdAt: "asc" },
          take: 1,
          select: { user: { select: { id: true, fullName: true, email: true } } },
        },
        signupInvite: { select: { createdAt: true, createdBy: { select: { fullName: true } } } },
      },
    }),
    prisma.member.groupBy({ by: ["gymId"], _count: { _all: true }, _min: { createdAt: true }, _max: { createdAt: true } }),
    prisma.member.groupBy({ by: ["gymId"], where: { status: "ACTIVE" }, _count: { _all: true } }),
    prisma.payment.groupBy({ by: ["gymId"], where: { status: "SUCCEEDED" }, _min: { createdAt: true }, _max: { createdAt: true } }),
    prisma.gymUser.groupBy({ by: ["gymId", "isActive"], where: { role: { not: "OWNER" } }, _count: { _all: true }, _min: { createdAt: true } }),
    prisma.gymInvite.groupBy({ by: ["gymId"], _min: { createdAt: true } }),
    prisma.gymInvite.groupBy({
      by: ["gymId"],
      where: { acceptedAt: null, revokedAt: null, expiresAt: { gt: now } },
      _count: { _all: true },
    }),
    prisma.session.groupBy({ by: ["activeGymId"], _max: { createdAt: true } }),
    prisma.$queryRaw<WeeklyRow[]>`
      SELECT gym_id::text, date_trunc('week', paid_on) AS week, SUM(amount)::float8 AS value
      FROM payments
      WHERE status = 'SUCCEEDED' AND paid_on >= ${windowStart}
      GROUP BY 1, 2`,
    prisma.$queryRaw<WeeklyRow[]>`
      SELECT gym_id::text, date_trunc('week', created_at) AS week, COUNT(*)::float8 AS value
      FROM members
      WHERE created_at >= ${windowStart}
      GROUP BY 1, 2`,
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
        gymUsers: { select: { role: true, isActive: true, gym: { select: { id: true, name: true } } } },
        sessions: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
      },
    }),
    prisma.gymSignupInvite.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
      select: {
        id: true,
        gymName: true,
        email: true,
        seatLimit: true,
        note: true,
        createdAt: true,
        expiresAt: true,
        usedAt: true,
        revokedAt: true,
        createdBy: { select: { fullName: true } },
        gym: { select: { id: true, name: true } },
      },
    }),
  ]);

  const byGym = <T extends { gymId: string }>(rows: T[]) => new Map(rows.map((row) => [row.gymId, row]));
  const members = byGym(memberStats);
  const active = byGym(activeMembers);
  const payments = byGym(paymentStats);
  const invites = byGym(inviteStats);
  const pending = byGym(pendingInvites);
  const sessions = new Map(sessionStats.map((row) => [row.activeGymId, row._max.createdAt]));

  const weekIndex = new Map(weekStarts.map((date, i) => [date.getTime(), i]));
  const weekly = (rows: WeeklyRow[]) => {
    const out = new Map<string, number[]>();
    for (const row of rows) {
      const index = weekIndex.get(new Date(row.week).getTime());
      if (index === undefined) continue;
      const values = out.get(row.gym_id) ?? Array.from({ length: WEEKS }, () => 0);
      values[index] += Number(row.value);
      out.set(row.gym_id, values);
    }
    return out;
  };
  const paymentWeeks = weekly(weeklyPayments);
  const memberWeeks = weekly(weeklyMembers);
  const empty = () => Array.from({ length: WEEKS }, () => 0);

  const gymRows: GymRow[] = gyms.map((gym) => {
    const team = teamStats.filter((row) => row.gymId === gym.id);
    const owner = gym.users[0]?.user ?? null;
    const firstTeam = earliest(...team.map((row) => row._min.createdAt), invites.get(gym.id)?._min.createdAt);
    return {
      id: gym.id,
      name: gym.name,
      timezone: gym.timezone,
      seatLimit: gym.seatLimit,
      isActive: gym.isActive,
      createdAt: gym.createdAt.toISOString(),
      owner: owner ? { id: owner.id, name: owner.fullName, email: owner.email } : null,
      membersTotal: members.get(gym.id)?._count._all ?? 0,
      membersActive: active.get(gym.id)?._count._all ?? 0,
      firstMemberAt: iso(members.get(gym.id)?._min.createdAt),
      firstPaymentAt: iso(payments.get(gym.id)?._min.createdAt),
      firstTeamAt: iso(firstTeam),
      teamActive: team.find((row) => row.isActive)?._count._all ?? 0,
      teamPending: pending.get(gym.id)?._count._all ?? 0,
      lastActivityAt: iso(latest(payments.get(gym.id)?._max.createdAt, members.get(gym.id)?._max.createdAt, sessions.get(gym.id))),
      weekly: { payments: paymentWeeks.get(gym.id) ?? empty(), members: memberWeeks.get(gym.id) ?? empty() },
      signupLink: gym.signupInvite
        ? { createdAt: gym.signupInvite.createdAt.toISOString(), createdBy: gym.signupInvite.createdBy.fullName }
        : null,
    };
  });

  const accountRows: AccountRow[] = users.map((user) => ({
    id: user.id,
    name: user.fullName,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    lastSignInAt: iso(user.sessions[0]?.createdAt),
    roles: user.gymUsers.map((gymUser) => ({
      gymId: gymUser.gym.id,
      gymName: gymUser.gym.name,
      role: gymUser.role as Role,
      isActive: gymUser.isActive,
    })),
  }));

  const linkRows: LinkRow[] = links.map((link) => ({
    id: link.id,
    gymName: link.gymName,
    email: link.email,
    seatLimit: link.seatLimit,
    note: link.note,
    createdAt: link.createdAt.toISOString(),
    expiresAt: link.expiresAt.toISOString(),
    usedAt: iso(link.usedAt),
    revokedAt: iso(link.revokedAt),
    createdBy: link.createdBy.fullName,
    gym: link.gym,
  }));

  return {
    source: "database",
    now: now.toISOString(),
    weekStarts: weekStarts.map((date) => date.toISOString()),
    gyms: gymRows,
    accounts: accountRows,
    links: linkRows,
  };
});
