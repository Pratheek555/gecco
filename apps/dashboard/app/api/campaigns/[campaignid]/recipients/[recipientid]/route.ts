import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { requirePermission } from "@/app/api/auth/authorization";

const actions = { sent: "SENT", skipped: "SKIPPED", opted_out: "OPTED_OUT", pending: "PENDING" } as const;
type Action = keyof typeof actions;

/**
 * Records what staff did with one recipient: sent the WhatsApp message,
 * skipped them, recorded an opt-out, or undid a previous choice.
 */
export async function PATCH(
  request: Request,
  context: RouteContext<"/api/campaigns/[campaignid]/recipients/[recipientid]">,
) {
  const auth = await requirePermission("campaigns:send", { fullMemberScope: true });
  if (!auth.ok) return auth.response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const action = (payload as { action?: unknown } | null)?.action;
  if (typeof action !== "string" || !Object.hasOwn(actions, action)) {
    return NextResponse.json({ error: "Select a valid action." }, { status: 400 });
  }
  const status = actions[action as Action];

  const { campaignid: campaignId, recipientid: recipientId } = await context.params;
  const recipient = await prisma.campaignRecipient.findFirst({
    where: { id: recipientId, campaignId, campaign: { gymId: auth.session.activeGym.id } },
    select: {
      id: true,
      status: true,
      sentAt: true,
      memberId: true,
      leadId: true,
      campaign: { select: { name: true } },
      lead: { select: { firstContactedAt: true } },
    },
  });
  if (!recipient) return NextResponse.json({ error: "Recipient not found." }, { status: 404 });

  const now = new Date();
  const userId = auth.session.user.id;
  const firstSend = status === "SENT" && recipient.status !== "SENT";
  // Opt-outs belong to the person. Undoing one restores them for future campaigns.
  const changesOptOut = (status === "OPTED_OUT") !== (recipient.status === "OPTED_OUT");
  const optOut = { messagingOptOutAt: status === "OPTED_OUT" ? now : null };
  const person = recipient.memberId
    ? { memberId: recipient.memberId }
    : recipient.leadId
      ? { leadId: recipient.leadId }
      : null;

  const [updated] = await prisma.$transaction([
    prisma.campaignRecipient.update({
      where: { id: recipient.id },
      data: {
        status,
        sentAt: status === "SENT" ? (recipient.sentAt ?? now) : null,
        sentByUserId: status === "SENT" ? (firstSend ? userId : undefined) : null,
      },
      select: { id: true, status: true, sentAt: true, sentBy: { select: { fullName: true } } },
    }),
    ...(changesOptOut && recipient.memberId
      ? [prisma.member.update({ where: { id: recipient.memberId }, data: optOut })]
      : []),
    ...(changesOptOut && recipient.leadId
      ? [prisma.lead.update({ where: { id: recipient.leadId }, data: optOut })]
      : []),
    // Someone who opts out is dropped from every other campaign still waiting to message them.
    ...(status === "OPTED_OUT" && person
      ? [
          prisma.campaignRecipient.updateMany({
            where: { ...person, status: "PENDING", id: { not: recipient.id } },
            data: { status: "OPTED_OUT" },
          }),
        ]
      : []),
    // Campaign outreach appears on the lead timeline like any other WhatsApp contact.
    ...(firstSend && recipient.leadId
      ? [
          prisma.lead.update({
            where: { id: recipient.leadId },
            data: {
              lastContactedAt: now,
              firstContactedAt: recipient.lead?.firstContactedAt ? undefined : now,
              activities: {
                create: {
                  type: "WHATSAPP",
                  body: `Sent campaign message "${recipient.campaign.name}".`,
                  createdByUserId: userId,
                },
              },
            },
          }),
        ]
      : []),
  ]);

  const pending = await prisma.campaignRecipient.count({ where: { campaignId, status: "PENDING" } });
  const campaign = await prisma.campaign.update({
    where: { id: campaignId },
    data: pending ? { status: "ACTIVE", completedAt: null } : { status: "COMPLETED", completedAt: now },
    select: { status: true },
  });

  return NextResponse.json({
    id: updated.id,
    status: updated.status,
    sentAt: updated.sentAt,
    sentByName: updated.sentBy?.fullName ?? null,
    campaignStatus: campaign.status,
  });
}
