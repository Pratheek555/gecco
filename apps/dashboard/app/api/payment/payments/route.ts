import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { getSession } from "@/app/api/auth/session";

export const runtime = "nodejs";

const paymentStatuses = ["SUCCEEDED", "VOIDED", "REFUNDED"] as const;

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const searchParams = new URL(request.url).searchParams;
  const statusValue = searchParams.get("status");
  const status = paymentStatuses.find((candidate) => candidate === statusValue);
  if (statusValue && !status) {
    return NextResponse.json({ error: "status must be SUCCEEDED, VOIDED, or REFUNDED." }, { status: 400 });
  }

  const requestedLimit = Number(searchParams.get("limit") ?? "50");
  const take = Number.isInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 100) : 50;
  const payments = await prisma.payment.findMany({
    where: { gymId: session.activeGym.id, ...(status ? { status } : {}) },
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
