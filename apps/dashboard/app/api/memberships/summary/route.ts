import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { getSession } from "@/app/api/auth/session";

export const runtime = "nodejs";

function dateKeyInTimezone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function monthBoundaries(key: string) {
  const [year, month] = key.split("-").map(Number);
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
    previousStart: new Date(Date.UTC(year, month - 2, 1)),
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const todayKey = dateKeyInTimezone(new Date(), session.activeGym.timezone);
  const today = new Date(`${todayKey}T00:00:00.000Z`);
  const { start: monthStart, end: monthEnd, previousStart } = monthBoundaries(todayKey);
  const gymId = session.activeGym.id;
  const activeWhere = { member: { gymId, status: "ACTIVE" as const }, status: "ACTIVE" as const, startsOn: { lte: today }, endsOn: { gte: today } };

  const [activeMemberships, renewingThisMonth, currentPayments, previousPayments, balances, newMemberships, cancelledMemberships] = await Promise.all([
    prisma.membership.findMany({
      where: activeWhere,
      select: {
        id: true, member: { select: { id: true } }, endsOn: true, agreedFee: true, plan: { select: { id: true, name: true } },
        trainerAssignments: { where: { OR: [{ endsOn: null }, { endsOn: { gte: today } }] }, select: { id: true }, take: 1 },
      },
    }),
    prisma.membership.count({ where: { ...activeWhere, endsOn: { gte: monthStart, lt: monthEnd } } }),
    prisma.payment.findMany({ where: { gymId, status: "SUCCEEDED", paidOn: { gte: monthStart, lt: monthEnd } }, select: { amount: true } }),
    prisma.payment.findMany({ where: { gymId, status: "SUCCEEDED", paidOn: { gte: previousStart, lt: monthStart } }, select: { amount: true } }),
    prisma.memberBalanceSummary.findMany({ where: { gymId }, select: { totalOutstanding: true, overdueAmount: true } }),
    prisma.membership.count({ where: { member: { gymId }, createdAt: { gte: monthStart, lt: monthEnd } } }),
    prisma.membership.count({ where: { member: { gymId }, status: "CANCELLED", updatedAt: { gte: monthStart, lt: monthEnd } } }),
  ]);

  const totalCollected = currentPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const previousCollected = previousPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const outstandingAmount = balances.reduce((sum, balance) => sum + Number(balance.totalOutstanding), 0);
  const overdueMembers = balances.filter(balance => Number(balance.overdueAmount) > 0).length;
  const collectionRate = totalCollected + outstandingAmount === 0 ? 0 : totalCollected / (totalCollected + outstandingAmount) * 100;
  const monthlyRecurringRevenue = activeMemberships.reduce((sum, membership) => sum + Number(membership.agreedFee), 0);
  const renewalValueAtRisk = activeMemberships.filter(membership => membership.endsOn >= monthStart && membership.endsOn < monthEnd).reduce((sum, membership) => sum + Number(membership.agreedFee), 0);
  const planMap = new Map<string, { planId: string; planName: string; activeMemberships: number; revenue: number }>();
  for (const membership of activeMemberships) {
    const current = planMap.get(membership.plan.id) ?? { planId: membership.plan.id, planName: membership.plan.name, activeMemberships: 0, revenue: 0 };
    current.activeMemberships += 1;
    current.revenue += Number(membership.agreedFee);
    planMap.set(membership.plan.id, current);
  }

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    period: { start: todayKey.slice(0, 7) + "-01", end: monthEnd.toISOString().slice(0, 10) },
    summary: {
      activeMemberships: activeMemberships.length,
      activeMembers: new Set(activeMemberships.map(membership => membership.member.id)).size,
      monthlyRecurringRevenue: monthlyRecurringRevenue.toFixed(2),
      renewingThisMonth,
      renewalValueAtRisk: renewalValueAtRisk.toFixed(2),
      collectionRate: collectionRate.toFixed(1),
      outstandingAmount: outstandingAmount.toFixed(2),
      overdueMembers,
      newMemberships,
      cancelledMemberships,
      netGrowth: newMemberships - cancelledMemberships,
      trainerCoverage: activeMemberships.length ? (activeMemberships.filter(membership => membership.trainerAssignments.length > 0).length / activeMemberships.length * 100).toFixed(1) : "0.0",
      averageMembershipValue: activeMemberships.length ? (monthlyRecurringRevenue / activeMemberships.length).toFixed(2) : "0.00",
      totalCollected: totalCollected.toFixed(2),
      totalCollectedChange: previousCollected === 0 ? null : ((totalCollected - previousCollected) / previousCollected * 100).toFixed(1),
    },
    planBreakdown: [...planMap.values()].map(plan => ({ ...plan, revenue: plan.revenue.toFixed(2) })),
  });
}
