import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { requirePermission } from "@/app/api/auth/authorization";

export const runtime = "nodejs";
const recipientTypes = ["GYM", "TRAINER", "OTHER"] as const;
type RecipientBody = { displayName?: unknown; recipientType?: unknown; isActive?: unknown };

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/payment/paymentRecipients/[recipientid]">,
) {
  const auth = await requirePermission("gym:manage");
  if (!auth.ok) return auth.response;
  const { recipientid: recipientId } = await context.params;
  let body: RecipientBody;
  try {
    body = (await request.json()) as RecipientBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const data: {
    displayName?: string;
    recipientType?: (typeof recipientTypes)[number];
    isActive?: boolean;
  } = {};
  if (body.displayName !== undefined) {
    if (
      typeof body.displayName !== "string" ||
      !body.displayName.trim() ||
      body.displayName.trim().length > 100
    )
      return NextResponse.json(
        { error: "displayName must be between 1 and 100 characters." },
        { status: 400 },
      );
    data.displayName = body.displayName.trim();
  }
  if (body.recipientType !== undefined) {
    if (
      typeof body.recipientType !== "string" ||
      !recipientTypes.includes(body.recipientType as (typeof recipientTypes)[number])
    )
      return NextResponse.json(
        { error: "recipientType must be GYM, TRAINER, or OTHER." },
        { status: 400 },
      );
    data.recipientType = body.recipientType as (typeof recipientTypes)[number];
  }
  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean")
      return NextResponse.json({ error: "isActive must be a boolean." }, { status: 400 });
    data.isActive = body.isActive;
  }
  const recipient = await prisma.paymentRecipient.findFirst({
    where: { id: recipientId, gymId: auth.session.activeGym.id },
    select: { id: true },
  });
  if (!recipient)
    return NextResponse.json({ error: "Payment recipient not found." }, { status: 404 });
  return NextResponse.json(
    await prisma.paymentRecipient.update({
      where: { id: recipient.id },
      data,
      select: { id: true, displayName: true, recipientType: true, isActive: true },
    }),
  );
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/payment/paymentRecipients/[recipientid]">,
) {
  const auth = await requirePermission("gym:manage");
  if (!auth.ok) return auth.response;
  const { recipientid: recipientId } = await context.params;
  const recipient = await prisma.paymentRecipient.findFirst({
    where: { id: recipientId, gymId: auth.session.activeGym.id },
    select: { id: true },
  });
  if (!recipient)
    return NextResponse.json({ error: "Payment recipient not found." }, { status: 404 });
  return NextResponse.json(
    await prisma.paymentRecipient.update({
      where: { id: recipient.id },
      data: { isActive: false },
      select: { id: true, isActive: true },
    }),
  );
}
