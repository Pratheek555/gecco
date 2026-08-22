import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { getSession } from "@/app/api/auth/session";

export const runtime = "nodejs";

const periods = ["THIS_MONTH", "LAST_MONTH", "LAST_3_MONTHS"] as const;
type Period = (typeof periods)[number];

function startOfMonth(date: Date, offset: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1));
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildRange(period: Period, now: Date) {
  const monthCount = period === "LAST_3_MONTHS" ? 3 : 1;
  const offset = period === "LAST_MONTH" ? -1 : period === "LAST_3_MONTHS" ? -2 : 0;
  const start = startOfMonth(now, offset);
  const end = startOfMonth(start, monthCount);
  const previousStart = startOfMonth(start, -monthCount);

  return { start, end, previousStart, previousEnd: start };
}

function bucketPayments(payments: { amount: { toString(): string }; paidOn: Date }[], start: Date, end: Date) {
  const bucketCount = 12;
  const duration = end.getTime() - start.getTime();
  const amounts = Array.from({ length: bucketCount }, () => 0);

  for (const payment of payments) {
    const index = Math.min(Math.floor((payment.paidOn.getTime() - start.getTime()) / duration * bucketCount), bucketCount - 1);
    amounts[Math.max(index, 0)] += Number(payment.amount);
  }

  return amounts.map((amount, index) => ({
    date: dateKey(new Date(start.getTime() + duration / bucketCount * index)),
    amount: amount.toFixed(2),
  }));
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const periodValue = new URL(request.url).searchParams.get("period") ?? "THIS_MONTH";
  const period = periods.find((candidate) => candidate === periodValue);
  if (!period) return NextResponse.json({ error: "period must be THIS_MONTH, LAST_MONTH, or LAST_3_MONTHS." }, { status: 400 });

  const gymId = session.activeGym.id;
  const { start, end, previousStart, previousEnd } = buildRange(period, new Date());
  const [currentPayments, previousPayments, voidedPayments, balances] = await Promise.all([
    prisma.payment.findMany({
      where: { gymId, status: "SUCCEEDED", paidOn: { gte: start, lt: end } },
      select: { amount: true, paidOn: true, paymentMode: { select: { id: true, name: true } } },
    }),
    prisma.payment.findMany({
      where: { gymId, status: "SUCCEEDED", paidOn: { gte: previousStart, lt: previousEnd } },
      select: { amount: true, paidOn: true },
    }),
    prisma.payment.findMany({
      where: { gymId, status: "VOIDED", paidOn: { gte: start, lt: end } },
      select: { amount: true },
    }),
    prisma.memberBalanceSummary.findMany({
      where: { gymId },
      select: { totalOutstanding: true },
    }),
  ]);

  const totalCollected = currentPayments.reduce((total, payment) => total + Number(payment.amount), 0);
  const previousCollected = previousPayments.reduce((total, payment) => total + Number(payment.amount), 0);
  const totalOutstanding = balances.reduce((total, balance) => total + Number(balance.totalOutstanding), 0);
  const failedAmount = voidedPayments.reduce((total, payment) => total + Number(payment.amount), 0);
  const collectionRate = totalCollected + totalOutstanding === 0 ? 0 : totalCollected / (totalCollected + totalOutstanding) * 100;
  const methods = new Map<string, { id: string; name: string; amount: number; count: number }>();

  for (const payment of currentPayments) {
    const existing = methods.get(payment.paymentMode.id) ?? { id: payment.paymentMode.id, name: payment.paymentMode.name, amount: 0, count: 0 };
    existing.amount += Number(payment.amount);
    existing.count += 1;
    methods.set(payment.paymentMode.id, existing);
  }

  return NextResponse.json({
    period: { start: dateKey(start), end: dateKey(new Date(end.getTime() - 1)) },
    summary: {
      totalCollected: totalCollected.toFixed(2),
      totalCollectedChange: previousCollected === 0 ? null : ((totalCollected - previousCollected) / previousCollected * 100).toFixed(1),
      successfulPaymentCount: currentPayments.length,
      outstandingAmount: totalOutstanding.toFixed(2),
      voidedAmount: failedAmount.toFixed(2),
      voidedPaymentCount: voidedPayments.length,
      collectionRate: collectionRate.toFixed(1),
    },
    chart: {
      current: bucketPayments(currentPayments, start, end),
      previous: bucketPayments(previousPayments, previousStart, previousEnd),
    },
    paymentMethods: [...methods.values()].sort((first, second) => second.amount - first.amount).map((method) => ({
      ...method,
      amount: method.amount.toFixed(2),
      share: totalCollected === 0 ? 0 : Number((method.amount / totalCollected * 100).toFixed(1)),
    })),
  });
}
