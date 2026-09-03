import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { requirePermission } from "@/app/api/auth/authorization";

export const runtime = "nodejs";

const paymentStatuses = ["SUCCEEDED", "VOIDED", "REFUNDED"] as const;

function parseDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

export async function GET(request: Request) {
  const auth = await requirePermission("payments:read");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const searchParams = new URL(request.url).searchParams;
  const start = parseDate(searchParams.get("start"));
  const end = parseDate(searchParams.get("end"));
  if ((searchParams.has("start") || searchParams.has("end")) && (!start || !end || end < start)) {
    return NextResponse.json({ error: "start and end must be YYYY-MM-DD dates, with end on or after start." }, { status: 400 });
  }
  const exclusiveEnd = end ? new Date(end.getTime() + 24 * 60 * 60 * 1000) : null;
  const statusValue = searchParams.get("status");
  const status = paymentStatuses.find((candidate) => candidate === statusValue);
  if (statusValue && !status) {
    return NextResponse.json({ error: "status must be SUCCEEDED, VOIDED, or REFUNDED." }, { status: 400 });
  }

  const requestedLimit = Number(searchParams.get("limit") ?? "50");
  const take = Number.isInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 100) : 50;
  const payments = await prisma.payment.findMany({
    where: { gymId: session.activeGym.id, ...(status ? { status } : {}), ...(start && exclusiveEnd ? { paidOn: { gte: start, lt: exclusiveEnd } } : {}) },
    orderBy: [{ paidOn: "desc" }, { createdAt: "desc" }],
    take,
    select: {
      id: true,
      amount: true,
      paidOn: true,
      status: true,
      reference: true,
      member: { select: { id: true, fullName: true } },
      membership: { select: { id: true, plan: { select: { name: true } } } },
      paymentMode: { select: { id: true, name: true } },
      recipient: { select: { id: true, displayName: true, recipientType: true } },
    },
  });

  return NextResponse.json({
    payments: payments.map((payment) => ({
      ...payment,
      amount: payment.amount.toString(),
      paidOn: payment.paidOn.toISOString().slice(0, 10),
      membership: payment.membership && {
        id: payment.membership.id,
        planName: payment.membership.plan.name,
      },
    })),
  });
}
