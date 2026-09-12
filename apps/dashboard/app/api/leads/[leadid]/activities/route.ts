import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { requirePermission } from "@/app/api/auth/authorization";
import type { LeadActivityType } from "../../shared";

const allowedTypes = ["NOTE", "CALL", "WHATSAPP", "EMAIL"] as const;
type UserActivityType = (typeof allowedTypes)[number];

export async function POST(
  request: Request,
  context: RouteContext<"/api/leads/[leadid]/activities">,
) {
  const auth = await requirePermission("leads:write");
  if (!auth.ok) return auth.response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const type = body.type;
  const note = typeof body.body === "string" ? body.body.trim() : "";
  if (typeof type !== "string" || !allowedTypes.includes(type as UserActivityType)) {
    return NextResponse.json({ error: "Select a valid activity type." }, { status: 400 });
  }
  if (!note || note.length > 2_000) {
    return NextResponse.json(
      { error: "Activity note must be between 1 and 2,000 characters." },
      { status: 400 },
    );
  }

  const { leadid: leadId } = await context.params;
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, gymId: auth.session.activeGym.id },
    select: { id: true, convertedMemberId: true },
  });
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });

  const activity = await prisma.$transaction(async (tx) => {
    const created = await tx.leadActivity.create({
      data: {
        leadId: lead.id,
        type: type as LeadActivityType,
        body: note,
        createdByUserId: auth.session.user.id,
      },
      select: {
        id: true,
        type: true,
        body: true,
        createdAt: true,
        createdBy: { select: { fullName: true } },
      },
    });
    if (type !== "NOTE") {
      await tx.lead.update({ where: { id: lead.id }, data: { lastContactedAt: new Date() } });
    }
    return created;
  });

  return NextResponse.json(
    { ...activity, createdAt: activity.createdAt.toISOString() },
    { status: 201 },
  );
}
