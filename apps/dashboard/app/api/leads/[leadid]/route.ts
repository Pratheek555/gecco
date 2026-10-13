import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { requirePermission } from "@/app/api/auth/authorization";
import { findLeadDuplicates, isLeadTeamMember } from "../server";
import { leadListSelect, leadStatusLabels, parseLeadInput, serializeLead } from "../shared";

function formatInGym(date: Date, timeZone: string) {
  return date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone });
}

async function scopedLead(leadId: string, gymId: string) {
  return prisma.lead.findFirst({
    where: { id: leadId, gymId },
    select: {
      id: true,
      status: true,
      phone: true,
      email: true,
      nextFollowUpAt: true,
      trialAt: true,
      firstContactedAt: true,
      assignedToUserId: true,
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
  const { status } = parsed.data;

  const { leadid: leadId } = await context.params;
  const existing = await scopedLead(leadId, auth.session.activeGym.id);
  if (!existing) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  if (existing.convertedMemberId) {
    return NextResponse.json({ error: "Converted leads cannot be edited." }, { status: 409 });
  }

  const gymId = auth.session.activeGym.id;
  const timeZone = auth.session.activeGym.timezone;
  const assignedToUserId = parsed.data.assignedToUserId;
  const assigneeChanged = existing.assignedToUserId !== assignedToUserId;
  if (assigneeChanged && assignedToUserId && !(await isLeadTeamMember(gymId, assignedToUserId))) {
    return NextResponse.json({ error: "Select a valid lead owner." }, { status: 400 });
  }

  const contactChanged =
    existing.phone !== parsed.data.phone || existing.email !== parsed.data.email;
  if (contactChanged && body.allowDuplicate !== true) {
    const duplicates = await findLeadDuplicates(gymId, parsed.data, existing.id);
    if (duplicates.length) {
      return NextResponse.json(
        { error: "This phone number or email is already in your gym.", duplicates },
        { status: 409 },
      );
    }
  }

  const statusChanged = existing.status !== status;
  const followUpChanged =
    existing.nextFollowUpAt?.toISOString() !== parsed.data.nextFollowUpAt?.toISOString();
  const trialChanged =
    Boolean(parsed.data.trialAt) &&
    existing.trialAt?.toISOString() !== parsed.data.trialAt?.toISOString();
  const contactedNow = statusChanged && status !== "NEW" && status !== "LOST";

  const updated = await prisma.$transaction(async (tx) => {
    const lead = await tx.lead.update({
      where: { id: existing.id },
      data: {
        ...parsed.data,
        lastContactedAt: contactedNow ? new Date() : undefined,
        firstContactedAt: contactedNow && !existing.firstContactedAt ? new Date() : undefined,
      },
      select: leadListSelect,
    });

    const activities = [];
    if (statusChanged) {
      activities.push({
        leadId: existing.id,
        type: "STATUS_CHANGE" as const,
        body: `Status changed from ${leadStatusLabels[existing.status]} to ${leadStatusLabels[status]}.`,
        createdByUserId: auth.session.user.id,
      });
    }
    if (followUpChanged) {
      activities.push({
        leadId: existing.id,
        type: "FOLLOW_UP" as const,
        body: parsed.data.nextFollowUpAt
          ? `Follow-up scheduled for ${formatInGym(parsed.data.nextFollowUpAt, timeZone)}.`
          : "Follow-up reminder cleared.",
        createdByUserId: auth.session.user.id,
      });
    }
    if (trialChanged && parsed.data.trialAt) {
      activities.push({
        leadId: existing.id,
        type: "TRIAL" as const,
        body: `Trial scheduled for ${formatInGym(parsed.data.trialAt, timeZone)}.`,
        createdByUserId: auth.session.user.id,
      });
    }
    if (assigneeChanged) {
      activities.push({
        leadId: existing.id,
        type: "ASSIGNMENT" as const,
        body: assignedToUserId
          ? `Lead assigned to ${lead.assignedTo?.fullName ?? "a team member"}.`
          : "Lead owner removed.",
        createdByUserId: auth.session.user.id,
      });
    }
    if (activities.length) await tx.leadActivity.createMany({ data: activities });
    return lead;
  });

  return NextResponse.json(serializeLead(updated));
}
