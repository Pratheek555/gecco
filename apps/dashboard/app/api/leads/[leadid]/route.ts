import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { requirePermission } from "@/app/api/auth/authorization";
import {
  leadListSelect,
  leadStatuses,
  parseLeadInput,
  serializeLead,
  type LeadStatus,
} from "../shared";

const statusLabels: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  TRIAL_BOOKED: "Trial booked",
  TRIAL_COMPLETED: "Trial completed",
  WON: "Won",
  LOST: "Lost",
};

async function scopedLead(leadId: string, gymId: string) {
  return prisma.lead.findFirst({
    where: { id: leadId, gymId },
    select: {
      id: true,
      status: true,
      nextFollowUpAt: true,
      convertedMemberId: true,
    },
  });
}

export async function GET(_request: Request, context: RouteContext<"/api/leads/[leadid]">) {
  const auth = await requirePermission("leads:read");
  if (!auth.ok) return auth.response;

  const { leadid: leadId } = await context.params;
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, gymId: auth.session.activeGym.id },
    select: {
      ...leadListSelect,
      activities: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          body: true,
          createdAt: true,
          createdBy: { select: { fullName: true } },
        },
      },
    },
  });

  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });

  return NextResponse.json({
    ...serializeLead(lead),
    activities: lead.activities.map((activity) => ({
      ...activity,
      createdAt: activity.createdAt.toISOString(),
    })),
  });
}

export async function PATCH(request: Request, context: RouteContext<"/api/leads/[leadid]">) {
  const auth = await requirePermission("leads:write");
  if (!auth.ok) return auth.response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = parseLeadInput(payload);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const body = payload as Record<string, unknown>;
  if (typeof body.status !== "string" || !leadStatuses.includes(body.status as LeadStatus)) {
    return NextResponse.json({ error: "Select a valid lead status." }, { status: 400 });
  }
  const status = body.status as LeadStatus;
  if (status === "WON") {
    return NextResponse.json(
      { error: "Convert this lead to a member to mark it as won." },
      { status: 400 },
    );
  }

  const { leadid: leadId } = await context.params;
  const existing = await scopedLead(leadId, auth.session.activeGym.id);
  if (!existing) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  if (existing.convertedMemberId) {
    return NextResponse.json({ error: "Converted leads cannot be edited." }, { status: 409 });
  }

  const statusChanged = existing.status !== status;
  const followUpChanged =
    existing.nextFollowUpAt?.toISOString() !== parsed.data.nextFollowUpAt?.toISOString();

  const updated = await prisma.$transaction(async (tx) => {
    const lead = await tx.lead.update({
      where: { id: existing.id },
      data: {
        ...parsed.data,
        status,
        lostReason: status === "LOST" ? parsed.data.lostReason : null,
        lastContactedAt:
          statusChanged && status !== "NEW" && status !== "LOST" ? new Date() : undefined,
      },
      select: leadListSelect,
    });

    const activities = [];
    if (statusChanged) {
      activities.push({
        leadId: existing.id,
        type: "STATUS_CHANGE" as const,
        body: `Status changed from ${statusLabels[existing.status]} to ${statusLabels[status]}.`,
        createdByUserId: auth.session.user.id,
      });
    }
    if (followUpChanged) {
      activities.push({
        leadId: existing.id,
        type: "FOLLOW_UP" as const,
        body: parsed.data.nextFollowUpAt
          ? `Follow-up scheduled for ${parsed.data.nextFollowUpAt.toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: auth.session.activeGym.timezone,
            })}.`
          : "Follow-up reminder cleared.",
        createdByUserId: auth.session.user.id,
      });
    }
    if (activities.length) await tx.leadActivity.createMany({ data: activities });
    return lead;
  });

  return NextResponse.json(serializeLead(updated));
}
