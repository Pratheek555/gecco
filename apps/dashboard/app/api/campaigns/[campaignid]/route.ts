import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { requirePermission } from "@/app/api/auth/authorization";
import { loadAttribution, summarizeCampaign } from "../server";

export async function GET(_request: Request, context: RouteContext<"/api/campaigns/[campaignid]">) {
  const auth = await requirePermission("campaigns:read", { fullMemberScope: true });
  if (!auth.ok) return auth.response;

  const { campaignid: campaignId } = await context.params;
  const gymId = auth.session.activeGym.id;
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, gymId },
    select: {
      id: true,
      name: true,
      segment: true,
      segmentParams: true,
      messageTemplate: true,
      status: true,
      attributionDays: true,
      createdAt: true,
      completedAt: true,
      createdBy: { select: { fullName: true } },
      recipients: {
        orderBy: { fullName: "asc" },
        select: {
          id: true,
          memberId: true,
          leadId: true,
          fullName: true,
          phone: true,
          message: true,
          status: true,
          sentAt: true,
          sentBy: { select: { fullName: true } },
        },
      },
    },
  });
  if (!campaign) return NextResponse.json({ error: "Campaign not found." }, { status: 404 });

  const attribution = await loadAttribution(gymId, [campaign]);
  const { recipients, createdBy, ...rest } = campaign;
  return NextResponse.json({
    ...rest,
    createdByName: createdBy?.fullName ?? null,
    summary: summarizeCampaign(recipients, attribution),
    recipients: recipients.map(({ sentBy, ...recipient }) => ({
      ...recipient,
      sentByName: sentBy?.fullName ?? null,
      converted: attribution.get(recipient.id)?.converted ?? false,
      revenue: (attribution.get(recipient.id)?.revenue ?? 0).toFixed(2),
    })),
  });
}

/** Finishing a campaign skips everyone still pending. */
export async function PATCH(request: Request, context: RouteContext<"/api/campaigns/[campaignid]">) {
  const auth = await requirePermission("campaigns:send", { fullMemberScope: true });
  if (!auth.ok) return auth.response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if ((payload as { action?: unknown } | null)?.action !== "finish") {
    return NextResponse.json({ error: "Unsupported campaign action." }, { status: 400 });
  }

  const { campaignid: campaignId } = await context.params;
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, gymId: auth.session.activeGym.id },
    select: { id: true },
  });
  if (!campaign) return NextResponse.json({ error: "Campaign not found." }, { status: 404 });

  await prisma.$transaction([
    prisma.campaignRecipient.updateMany({
      where: { campaignId, status: "PENDING" },
      data: { status: "SKIPPED" },
    }),
    prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "COMPLETED", completedAt: new Date() },
    }),
  ]);
  return NextResponse.json({ ok: true });
}

/** Only campaigns nobody has been messaged from can be discarded; sent ones keep their results. */
export async function DELETE(_request: Request, context: RouteContext<"/api/campaigns/[campaignid]">) {
  const auth = await requirePermission("campaigns:send", { fullMemberScope: true });
  if (!auth.ok) return auth.response;

  const { campaignid: campaignId } = await context.params;
  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, gymId: auth.session.activeGym.id },
    select: { id: true, _count: { select: { recipients: { where: { status: "SENT" } } } } },
  });
  if (!campaign) return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
  if (campaign._count.recipients > 0) {
    return NextResponse.json(
      { error: "Messages have already gone out from this campaign. Finish it instead." },
      { status: 409 },
    );
  }

  await prisma.campaign.delete({ where: { id: campaignId } });
  return NextResponse.json({ ok: true });
}
