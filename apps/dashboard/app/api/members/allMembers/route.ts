import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { memberAccessWhere, requirePermission } from "@/app/api/auth/authorization";

type Session = Extract<Awaited<ReturnType<typeof requirePermission>>, { ok: true }>["session"];

type BalanceSummary = {
  memberId: string;
  totalOutstanding: { toString(): string };
  overdueAmount: { toString(): string };
  availableCredit: { toString(): string };
  oldestDueOn: Date | null;
  paymentState: string;
};

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const QUICK_FILTERS = ["all", "dues", "expiring", "none"] as const;
type QuickFilter = (typeof QUICK_FILTERS)[number];

function currentAssignmentsWhere() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return {
    startsOn: { lte: today },
    OR: [{ endsOn: null }, { endsOn: { gte: today } }],
  };
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function membershipDuration(durationMonths: number) {
  const months = Math.max(1, durationMonths || 1);
  return `${months} ${months === 1 ? "month" : "months"}`;
}

async function loadBalanceSummaries(gymId: string, memberIds?: string[]) {
  const summaries: BalanceSummary[] = await prisma.memberBalanceSummary.findMany({
    where: { gymId, ...(memberIds ? { memberId: { in: memberIds } } : {}) },
    select: {
      memberId: true,
      totalOutstanding: true,
      overdueAmount: true,
      availableCredit: true,
      oldestDueOn: true,
      paymentState: true,
    },
  });
  return new Map(summaries.map((summary) => [summary.memberId, summary]));
}

async function loadMemberDetails(
  session: Session,
  memberIds: string[] | null,
  summaries: Map<string, BalanceSummary> | Promise<Map<string, BalanceSummary>>,
) {
  const membersQuery = prisma.member.findMany({
    where: {
      ...memberAccessWhere(session),
      status: "ACTIVE",
      ...(memberIds ? { id: { in: memberIds } } : {}),
    },
    orderBy: { fullName: "asc" },
    select: {
      id: true,
      fullName: true,
      memberNumber: true,
      joinedOn: true,
      status: true,
      memberships: {
        where: { status: "ACTIVE" },
        orderBy: { startsOn: "asc" },
        select: {
          id: true,
          planTypeSnapshot: true,
          durationMonths: true,
          agreedFee: true,
          startsOn: true,
          endsOn: true,
          status: true,
          charges: {
            where: { status: { not: "VOIDED" } },
            select: {
              amount: true,
              allocations: {
                where: { payment: { status: "SUCCEEDED" } },
                select: { amount: true },
              },
            },
          },
          trainerAssignments: {
            where: currentAssignmentsWhere(),
            orderBy: { startsOn: "desc" },
            select: { trainer: { select: { fullName: true } } },
          },
        },
      },
    },
  });
  const [members, summariesByMemberId] = await Promise.all([membersQuery, summaries]);

  return members.map((member) => ({
    id: member.id,
    fullName: member.fullName,
    memberNumber: member.memberNumber,
    joinedOn: isoDate(member.joinedOn),
    status: member.status,
    memberships: member.memberships.map((membership) => ({
      id: membership.id,
      durationMonths: membership.durationMonths,
      planTypeSnapshot: membership.planTypeSnapshot,
      agreedFee: membership.agreedFee.toString(),
      startsOn: isoDate(membership.startsOn),
      endsOn: isoDate(membership.endsOn),
      status: membership.status,
      trainers: membership.trainerAssignments.map((assignment) => assignment.trainer.fullName),
      totalAmount: membership.agreedFee.toString(),
      paidAmount: membership.charges
        .flatMap((charge) => charge.allocations)
        .reduce((total, allocation) => total + Number(allocation.amount), 0)
        .toFixed(2),
    })),
    totalAmount: member.memberships
      .reduce((total, membership) => total + Number(membership.agreedFee), 0)
      .toFixed(2),
    paidAmount: member.memberships
      .flatMap((membership) => membership.charges.flatMap((charge) => charge.allocations))
      .reduce((total, allocation) => total + Number(allocation.amount), 0)
      .toFixed(2),
    balance: summariesByMemberId.get(member.id) ?? {
      totalOutstanding: "0",
      overdueAmount: "0",
      availableCredit: "0",
      oldestDueOn: null,
      paymentState: "PAID",
    },
  }));
}

/**
 * Filters, sorts, and pages the directory using a lightweight index of every member, then loads
 * the expensive payment details only for the members on the requested page.
 */
async function loadMemberPage(session: Session, searchParams: URLSearchParams) {
  const gymId = session.activeGym.id;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: session.activeGym.timezone ?? "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const todayTime = Date.parse(`${today}T00:00:00Z`);
  const daysUntil = (date: string) =>
    Math.round((Date.parse(`${date}T00:00:00Z`) - todayTime) / 86400000);

  const search = (searchParams.get("q") ?? "").trim().toLowerCase();
  const trainerFilter = searchParams.get("trainer") ?? "all";
  const requestedFilter = searchParams.get("filter") ?? "all";
  const quickFilter: QuickFilter = (QUICK_FILTERS as readonly string[]).includes(requestedFilter)
    ? (requestedFilter as QuickFilter)
    : "all";
  const sort = searchParams.get("sort") ?? "name";
  const requestedPageSize = searchParams.get("pageSize");
  const pageSize =
    requestedPageSize === "all"
      ? null
      : Math.min(
          MAX_PAGE_SIZE,
          Math.max(1, Math.floor(Number(requestedPageSize)) || DEFAULT_PAGE_SIZE),
        );

  const [indexRows, summariesByMemberId] = await Promise.all([
    prisma.member.findMany({
      where: { ...memberAccessWhere(session), status: "ACTIVE" },
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        fullName: true,
        memberNumber: true,
        memberships: {
          where: { status: "ACTIVE" },
          select: {
            planTypeSnapshot: true,
            durationMonths: true,
            startsOn: true,
            endsOn: true,
            trainerAssignments: {
              where: currentAssignmentsWhere(),
              select: { trainer: { select: { fullName: true } } },
            },
          },
        },
      },
    }),
    loadBalanceSummaries(gymId),
  ]);

  const index = indexRows.map((member) => {
    const plans = member.memberships.map((membership) => ({
      planTypeSnapshot: membership.planTypeSnapshot,
      durationMonths: membership.durationMonths,
      startsOn: isoDate(membership.startsOn),
      endsOn: isoDate(membership.endsOn),
    }));
    const balance = summariesByMemberId.get(member.id);
    return {
      id: member.id,
      fullName: member.fullName,
      searchText: `${member.fullName} ${member.memberNumber} ${plans
        .map(
          (plan) =>
            `${plan.planTypeSnapshot} ${plan.planTypeSnapshot === "GT" ? "Group Gym Training" : "Personal Training"} ${membershipDuration(plan.durationMonths)}`,
        )
        .join(" ")}`.toLowerCase(),
      plans,
      trainers: member.memberships.flatMap((membership) =>
        membership.trainerAssignments.map((assignment) => assignment.trainer.fullName),
      ),
      outstanding: Number(balance?.totalOutstanding ?? 0),
      overdue: Number(balance?.overdueAmount ?? 0),
    };
  });
  type IndexedMember = (typeof index)[number];

  const matchesQuickFilter = (member: IndexedMember, filter: QuickFilter) => {
    if (filter === "dues") return member.outstanding > 0;
    if (filter === "expiring")
      return member.plans.some((plan) => {
        const days = daysUntil(plan.endsOn);
        return days >= 0 && days <= 30;
      });
    if (filter === "none")
      return !member.plans.some((plan) => plan.startsOn <= today && plan.endsOn >= today);
    return true;
  };
  const nextExpiry = (member: IndexedMember) =>
    Math.min(
      ...member.plans.filter((plan) => plan.endsOn >= today).map((plan) => Date.parse(plan.endsOn)),
      Infinity,
    );

  const filtered = index
    .filter((member) => {
      const matchesSearch = !search || member.searchText.includes(search);
      const matchesTrainer =
        trainerFilter === "all" ||
        (trainerFilter === "unassigned" && member.trainers.length === 0) ||
        member.trainers.includes(trainerFilter);
      return matchesSearch && matchesTrainer && matchesQuickFilter(member, quickFilter);
    })
    .sort((a, b) => {
      if (sort === "dues") return b.outstanding - a.outstanding || a.fullName.localeCompare(b.fullName);
      if (sort === "expiry") {
        const difference = nextExpiry(a) - nextExpiry(b);
        if (difference && !Number.isNaN(difference)) return difference;
      }
      return a.fullName.localeCompare(b.fullName);
    });

  const total = filtered.length;
  const totalPages = pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const page = Math.min(totalPages, Math.max(1, Math.floor(Number(searchParams.get("page"))) || 1));
  const pageRows = pageSize ? filtered.slice((page - 1) * pageSize, page * pageSize) : filtered;
  const pageIds = pageRows.map((member) => member.id);

  const details = pageIds.length
    ? await loadMemberDetails(session, pageIds, summariesByMemberId)
    : [];
  const detailsById = new Map(details.map((member) => [member.id, member]));

  return {
    gymId,
    members: pageIds.flatMap((id) => detailsById.get(id) ?? []),
    page,
    pageSize: pageSize ?? total,
    total,
    totalPages,
    stats: {
      totalMembers: index.length,
      activeMemberships: index.reduce((count, member) => count + member.plans.length, 0),
      outstanding: index.reduce((sum, member) => sum + member.outstanding, 0),
      overdueMembers: index.filter((member) => member.overdue > 0).length,
    },
    filterCounts: Object.fromEntries(
      QUICK_FILTERS.map((filter) => [
        filter,
        index.filter((member) => matchesQuickFilter(member, filter)).length,
      ]),
    ) as Record<QuickFilter, number>,
    trainerOptions: [...new Set(index.flatMap((member) => member.trainers))].sort(),
  };
}

export async function GET(request: Request) {
  const auth = await requirePermission("members:read");
  if (!auth.ok) return auth.response;
  const { session } = auth;
  const gymId = session.activeGym.id;
  const searchParams = new URL(request.url).searchParams;

  // Paged directory view for the members page.
  if (searchParams.has("page") || searchParams.has("pageSize")) {
    return NextResponse.json(await loadMemberPage(session, searchParams));
  }

  // A single member, e.g. when deep-linking to /members?member=<id>.
  const memberId = searchParams.get("memberId");
  if (memberId) {
    if (!UUID_PATTERN.test(memberId)) return NextResponse.json({ gymId, members: [] });
    const members = await loadMemberDetails(
      session,
      [memberId],
      loadBalanceSummaries(gymId, [memberId]),
    );
    return NextResponse.json({ gymId, members });
  }

  // Full list, used by member pickers on other pages.
  return NextResponse.json({
    gymId,
    members: await loadMemberDetails(session, null, loadBalanceSummaries(gymId)),
  });
}
