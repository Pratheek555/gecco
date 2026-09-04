import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { requirePermission } from "@/app/api/auth/authorization";

export const runtime = "nodejs";

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || dateKey(date) !== value ? null : date;
}

function buildRange(start: Date, endInclusive: Date) {
  const end = new Date(endInclusive);
  end.setUTCDate(end.getUTCDate() + 1);
  const duration = end.getTime() - start.getTime();
  const previousStart = new Date(start.getTime() - duration);

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
  const auth = await requirePermission("payments:read");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const searchParams = new URL(request.url).searchParams;
  const start = parseDate(searchParams.get("start"));
  const end = parseDate(searchParams.get("end"));
  if (!start || !end || end < start) {
    return NextResponse.json({ error: "start and end must be YYYY-MM-DD dates, with end on or after start." }, { status: 400 });
  }

  const gymId = session.activeGym.id;
  const { end: exclusiveEnd, previousStart, previousEnd } = buildRange(start, end);
  const [currentPayments, previousPayments, voidedPayments, balances] = await Promise.all([
    prisma.payment.findMany({
      where: { gymId, status: "SUCCEEDED", paidOn: { gte: start, lt: exclusiveEnd } },
      select: { amount: true, paidOn: true, paymentMode: { select: { id: true, name: true } } },
    }),
    prisma.payment.findMany({
      where: { gymId, status: "SUCCEEDED", paidOn: { gte: previousStart, lt: previousEnd } },
      select: { amount: true, paidOn: true },
    }),
    prisma.payment.findMany({
      where: { gymId, status: "VOIDED", paidOn: { gte: start, lt: exclusiveEnd } },
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
    period: { start: dateKey(start), end: dateKey(end) },
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
      current: bucketPayments(currentPayments, start, exclusiveEnd),
      previous: bucketPayments(previousPayments, previousStart, previousEnd),
    },
    paymentMethods: [...methods.values()].sort((first, second) => second.amount - first.amount).map((method) => ({
      ...method,
      amount: method.amount.toFixed(2),
      share: totalCollected === 0 ? 0 : Number((method.amount / totalCollected * 100).toFixed(1)),
    })),
  });
}
