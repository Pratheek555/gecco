import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { requirePermission } from "@/app/api/auth/authorization";

export const runtime = "nodejs";

const recipientTypes = ["GYM", "TRAINER", "OTHER"] as const;
type RecipientType = (typeof recipientTypes)[number];

type CreatePaymentRecipientBody = {
  displayName?: unknown;
  recipientType?: unknown;
  isActive?: unknown;
};

function isRecipientType(value: unknown): value is RecipientType {
  return typeof value === "string" && recipientTypes.includes(value as RecipientType);
}

export async function POST(request: Request) {
  const auth = await requirePermission("gym:manage");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  let body: CreatePaymentRecipientBody;
  try {
    const payload: unknown = await request.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
    }
    body = payload as CreatePaymentRecipientBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
  const isActive = body.isActive ?? true;

  if (!displayName || !isRecipientType(body.recipientType)) {
    return NextResponse.json(
      { error: "displayName and recipientType (GYM, TRAINER, or OTHER) are required." },
      { status: 400 },
    );
  }

  if (typeof isActive !== "boolean") {
    return NextResponse.json({ error: "isActive must be a boolean." }, { status: 400 });
  }

  const recipient = await prisma.paymentRecipient.create({
    data: {
      gymId: session.activeGym.id,
      displayName,
      recipientType: body.recipientType,
      isActive,
    },
  });

  return NextResponse.json(recipient, { status: 201 });
}
