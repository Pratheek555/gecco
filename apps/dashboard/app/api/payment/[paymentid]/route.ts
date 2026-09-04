import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { requirePermission } from "@/app/api/auth/authorization";

export const runtime = "nodejs";

function parseDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}
type PaymentBody = {
  paidOn?: unknown;
  paymentModeId?: unknown;
  recipientId?: unknown;
  reference?: unknown;
  voidReason?: unknown;
};

export async function PATCH(request: Request, context: RouteContext<"/api/payment/[paymentid]">) {
  const auth = await requirePermission("payments:record");
  if (!auth.ok) return auth.response;
  const { paymentid: paymentId } = await context.params;
  let body: PaymentBody;
  try {
    body = (await request.json()) as PaymentBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, gymId: auth.session.activeGym.id },
    select: { id: true, status: true },
  });
  if (!payment) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  if (payment.status !== "SUCCEEDED")
    return NextResponse.json({ error: "Only successful payments can be edited." }, { status: 409 });
  const paidOn = parseDate(body.paidOn);
  if (!paidOn || typeof body.paymentModeId !== "string" || typeof body.recipientId !== "string")
    return NextResponse.json(
      { error: "paidOn, paymentModeId, and recipientId are required." },
      { status: 400 },
    );
  const [mode, recipient] = await Promise.all([
    prisma.paymentMode.findFirst({
      where: { id: body.paymentModeId, gymId: auth.session.activeGym.id, isActive: true },
      select: { id: true },
    }),
    prisma.paymentRecipient.findFirst({
      where: { id: body.recipientId, gymId: auth.session.activeGym.id, isActive: true },
      select: { id: true },
    }),
  ]);
  if (!mode || !recipient)
    return NextResponse.json(
      { error: "Active payment method and recipient are required." },
      { status: 404 },
    );
  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      paidOn,
      paymentModeId: mode.id,
      recipientId: recipient.id,
      reference: typeof body.reference === "string" ? body.reference.trim() || null : null,
    },
    select: { id: true, paidOn: true, paymentModeId: true, recipientId: true, reference: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request, context: RouteContext<"/api/payment/[paymentid]">) {
  const auth = await requirePermission("payments:record");
  if (!auth.ok) return auth.response;
  const { paymentid: paymentId } = await context.params;
  let reason = "Voided from dashboard";
  try {
    const body = (await request.json()) as PaymentBody;
    if (typeof body.voidReason === "string" && body.voidReason.trim())
      reason = body.voidReason.trim().slice(0, 500);
  } catch {
    /* empty body is valid */
  }
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, gymId: auth.session.activeGym.id },
    select: { id: true, status: true },
  });
  if (!payment) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  if (payment.status !== "SUCCEEDED")
    return NextResponse.json({ error: "Payment is already voided or refunded." }, { status: 409 });
  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "VOIDED", voidedAt: new Date(), voidReason: reason },
    select: { id: true, status: true, voidedAt: true, voidReason: true },
  });
  return NextResponse.json({
    ...updated,
    message: "Payment voided and excluded from member balances.",
  });
}
