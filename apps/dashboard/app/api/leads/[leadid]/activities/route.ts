import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { requirePermission } from "@/app/api/auth/authorization";
import { optionalDate, type LeadActivityType } from "../../shared";

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

  // Optional: logging an outreach can also reschedule the next follow-up in one step.
  const rescheduling = body.nextFollowUpAt !== undefined;
  const nextFollowUpAt = optionalDate(body.nextFollowUpAt);
  if (nextFollowUpAt === undefined) {
    return NextResponse.json(
      { error: "Follow-up must be a valid date and time." },
      { status: 400 },
    );
  }

  const { leadid: leadId } = await context.params;
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, gymId: auth.session.activeGym.id },
    select: { id: true, status: true, firstContactedAt: true, convertedMemberId: true },
  });
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  const isOpen = lead.status !== "WON" && lead.status !== "LOST";
  if (rescheduling && isOpen && !nextFollowUpAt) {
    return NextResponse.json(
      { error: "Schedule the next follow-up so this lead is not forgotten." },
      { status: 400 },
    );
  }

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
    const outreach = type !== "NOTE";
    const now = new Date();
    const advance = outreach && lead.status === "NEW";
    if (outreach || (rescheduling && isOpen)) {
      await tx.lead.update({
        where: { id: lead.id },
        data: {
          lastContactedAt: outreach ? now : undefined,
          firstContactedAt: outreach && !lead.firstContactedAt ? now : undefined,
          status: advance ? "CONTACTED" : undefined,
          nextFollowUpAt: rescheduling && isOpen ? nextFollowUpAt : undefined,
        },
      });
    }
    const followUps = [];
    if (advance) {
      followUps.push({
        leadId: lead.id,
        type: "STATUS_CHANGE" as const,
        body: "Status changed from New to Contacted.",
        createdByUserId: auth.session.user.id,
      });
    }
    if (rescheduling && isOpen && nextFollowUpAt) {
      followUps.push({
        leadId: lead.id,
        type: "FOLLOW_UP" as const,
        body: `Follow-up scheduled for ${nextFollowUpAt.toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: auth.session.activeGym.timezone,
        })}.`,
        createdByUserId: auth.session.user.id,
      });
    }
    if (followUps.length) await tx.leadActivity.createMany({ data: followUps });
    return created;
  });

  return NextResponse.json(
    { ...activity, createdAt: activity.createdAt.toISOString() },
    { status: 201 },
  );
}
