import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { requirePermission } from "@/app/api/auth/authorization";

export const runtime = "nodejs";

const validWindows = [7, 14, 30] as const;

function dateKeyInTimezone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";

  return `${value("year")}-${value("month")}-${value("day")}`;
}

function dateFromKey(key: string) {
  return new Date(`${key}T00:00:00.000Z`);
}

function addUtcDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function monthBoundaries(key: string) {
  const [year, month] = key.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  const previousStart = new Date(Date.UTC(year, month - 2, 1));

  return { start, end, previousStart };
}

export async function GET(request: Request) {
  const auth = await requirePermission("overview:read");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const requestedWindow = Number(new URL(request.url).searchParams.get("days") ?? "7");
  const days = validWindows.find((candidate) => candidate === requestedWindow);
  if (!days) return NextResponse.json({ error: "days must be 7, 14, or 30." }, { status: 400 });

  const gymId = session.activeGym.id;
  const todayKey = dateKeyInTimezone(new Date(), session.activeGym.timezone);
  const today = dateFromKey(todayKey);
  const expiringBefore = addUtcDays(today, days);
  const { start: monthStart, end: monthEnd, previousStart } = monthBoundaries(todayKey);

  const [
    totalMembers,
    activeMemberships,
    expiringMemberships,
    balances,
    currentPayments,
    previousPayments,
    recentPayments,
  ] = await Promise.all([
    prisma.member.count({ where: { gymId, status: "ACTIVE" } }),
    prisma.membership.count({
      where: { member: { gymId, status: "ACTIVE" }, status: "ACTIVE", startsOn: { lte: today }, endsOn: { gte: today } },
    }),
    prisma.membership.findMany({
      where: {
        member: { gymId, status: "ACTIVE" },
        status: "ACTIVE",
        endsOn: { gte: today, lt: expiringBefore },
      },
      orderBy: [{ endsOn: "asc" }, { member: { fullName: "asc" } }],
      select: {
        id: true,
        agreedFee: true,
        endsOn: true,
        member: { select: { id: true, fullName: true } },
        plan: { select: { name: true } },
      },
    }),
    prisma.memberBalanceSummary.findMany({
      where: { gymId },
      select: { memberId: true, totalOutstanding: true, overdueAmount: true, oldestDueOn: true },
    }),
    prisma.payment.findMany({
      where: { gymId, status: "SUCCEEDED", paidOn: { gte: monthStart, lt: monthEnd } },
      select: { amount: true },
    }),
    prisma.payment.findMany({
      where: { gymId, status: "SUCCEEDED", paidOn: { gte: previousStart, lt: monthStart } },
      select: { amount: true },
    }),
    prisma.payment.findMany({
      where: { gymId },
      orderBy: [{ paidOn: "desc" }, { createdAt: "desc" }],
      take: 5,
      select: {
        id: true,
        amount: true,
        paidOn: true,
        status: true,
        member: { select: { id: true, fullName: true } },
        membership: { select: { id: true, plan: { select: { name: true } } } },
        paymentMode: { select: { name: true } },
      },
    }),
  ]);

  const balanceByMemberId = new Map(balances.map((balance) => [balance.memberId, balance]));
  const totalCollected = currentPayments.reduce((total, payment) => total + Number(payment.amount), 0);
  const previousCollected = previousPayments.reduce((total, payment) => total + Number(payment.amount), 0);
  const totalOutstanding = balances.reduce((total, balance) => total + Number(balance.totalOutstanding), 0);
  const totalOverdue = balances.reduce((total, balance) => total + Number(balance.overdueAmount), 0);
  const overdueMembers = balances.filter((balance) => Number(balance.overdueAmount) > 0).length;
  const collectionRate = totalCollected + totalOutstanding === 0
    ? 0
    : totalCollected / (totalCollected + totalOutstanding) * 100;
  const expiringValue = expiringMemberships.reduce((total, membership) => total + Number(membership.agreedFee), 0);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    today: todayKey,
    windowDays: days,
    user: { firstName: session.user.fullName.trim().split(/\s+/)[0] || session.user.fullName },
    gym: { name: session.activeGym.name, timezone: session.activeGym.timezone },
    summary: {
      activeMemberships,
      totalMembers,
      expiringCount: expiringMemberships.length,
      expiringValue: expiringValue.toFixed(2),
      totalCollected: totalCollected.toFixed(2),
      totalCollectedChange: previousCollected === 0
        ? null
        : ((totalCollected - previousCollected) / previousCollected * 100).toFixed(1),
      outstandingAmount: totalOutstanding.toFixed(2),
      overdueAmount: totalOverdue.toFixed(2),
      overdueMembers,
      collectionRate: collectionRate.toFixed(1),
    },
    expiringMemberships: expiringMemberships.map((membership) => {
      const balance = balanceByMemberId.get(membership.member.id);

      return {
        id: membership.id,
        member: membership.member,
        planName: membership.plan.name,
        endsOn: membership.endsOn.toISOString().slice(0, 10),
        agreedFee: membership.agreedFee.toString(),
        outstandingAmount: balance?.totalOutstanding.toString() ?? "0",
        overdueAmount: balance?.overdueAmount.toString() ?? "0",
      };
    }),
    recentPayments: recentPayments.map((payment) => ({
      id: payment.id,
      amount: payment.amount.toString(),
      paidOn: payment.paidOn.toISOString().slice(0, 10),
      status: payment.status,
      member: payment.member,
      membership: payment.membership && { id: payment.membership.id, planName: payment.membership.plan.name },
      paymentMode: payment.paymentMode.name,
    })),
  });
}
