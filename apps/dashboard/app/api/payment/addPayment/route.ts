import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { getSession } from "@/app/api/auth/session";

export const runtime = "nodejs";

type CreatePaymentBody = {
  memberId?: unknown;
  membershipId?: unknown;
  amount?: unknown;
  paidOn?: unknown;
  paymentModeId?: unknown;
  recipientId?: unknown;
  chargeId?: unknown;
  reference?: unknown;
};

function parseAmount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value.toString();
  if (typeof value === "string" && /^\d+(?:\.\d{1,2})?$/.test(value.trim()) && Number(value) > 0) return value.trim();

  return null;
}

function parseDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

function isId(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let body: CreatePaymentBody;
  try {
    const payload: unknown = await request.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
    }
    body = payload as CreatePaymentBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const amount = parseAmount(body.amount);
  const paidOn = parseDate(body.paidOn);
  const reference = typeof body.reference === "string" ? body.reference.trim() || null : null;

  if (
    !isId(body.memberId) ||
    !isId(body.membershipId) ||
    !isId(body.paymentModeId) ||
    !isId(body.recipientId) ||
    !isId(body.chargeId) ||
    !amount ||
    !paidOn
  ) {
    return NextResponse.json(
      { error: "memberId, membershipId, paymentModeId, recipientId, chargeId, a positive amount, and paidOn (YYYY-MM-DD) are required." },
      { status: 400 },
    );
  }

  const { memberId, membershipId, paymentModeId, recipientId, chargeId } = body;
  const gymId = session.activeGym.id;
  const [membership, charge, paymentMode, recipient] = await Promise.all([
    prisma.membership.findFirst({
      where: { id: membershipId, memberId, member: { gymId } },
      select: { id: true },
    }),
    prisma.membershipCharge.findFirst({
      where: { id: chargeId, membershipId, memberId, gymId, status: { not: "VOIDED" } },
      select: { id: true },
    }),
    prisma.paymentMode.findFirst({ where: { id: paymentModeId, gymId, isActive: true }, select: { id: true } }),
    prisma.paymentRecipient.findFirst({ where: { id: recipientId, gymId, isActive: true }, select: { id: true } }),
  ]);

  if (!membership) return NextResponse.json({ error: "Membership not found for this member." }, { status: 404 });
  if (!charge) return NextResponse.json({ error: "Open charge not found for this membership." }, { status: 404 });
  if (!paymentMode) return NextResponse.json({ error: "Active payment mode not found." }, { status: 404 });
  if (!recipient) return NextResponse.json({ error: "Active payment recipient not found." }, { status: 404 });

  try {
    const payment = await prisma.$transaction(async (tx) => {
      const createdPayment = await tx.payment.create({
        data: {
          gymId,
          memberId,
          membershipId,
          amount,
          paidOn,
          paymentModeId,
          recipientId,
          reference,
          recordedByUserId: session.user.id,
        },
      });

      await tx.paymentAllocation.create({
        data: { paymentId: createdPayment.id, chargeId, amount },
      });

      return createdPayment;
    });

    return NextResponse.json(payment, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Payment could not be applied. Ensure the amount does not exceed the outstanding charge balance." },
      { status: 400 },
    );
  }
}
