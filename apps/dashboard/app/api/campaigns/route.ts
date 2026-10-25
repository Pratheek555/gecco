import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { requirePermission } from "@/app/api/auth/authorization";
import { loadAttribution, resolveAudience, summarizeCampaign } from "./server";
import { MAX_RECIPIENTS, parseCampaignInput, renderMessage } from "./shared";

const recipientSelect = { id: true, memberId: true, leadId: true, status: true, sentAt: true } as const;

export async function GET() {
  const auth = await requirePermission("campaigns:read", { fullMemberScope: true });
  if (!auth.ok) return auth.response;

  const gymId = auth.session.activeGym.id;
  const campaigns = await prisma.campaign.findMany({
    where: { gymId },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      segment: true,
      status: true,
      attributionDays: true,
      createdAt: true,
      completedAt: true,
      createdBy: { select: { fullName: true } },
      recipients: { select: recipientSelect },
    },
  });
  const attribution = await loadAttribution(gymId, campaigns);

  return NextResponse.json({
    campaigns: campaigns.map(({ recipients, createdBy, ...campaign }) => ({
      ...campaign,
      createdByName: createdBy?.fullName ?? null,
      summary: summarizeCampaign(recipients, attribution),
    })),
  });
}

export async function POST(request: Request) {
  const auth = await requirePermission("campaigns:send", { fullMemberScope: true });
  if (!auth.ok) return auth.response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = parseCampaignInput(payload);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const input = parsed.data;

  const audience = await resolveAudience(auth.session.activeGym, input.segment, input.params);
  if (!audience.recipients.length) {
    return NextResponse.json({ error: "Nobody with a phone number matches this audience." }, { status: 400 });
  }
  if (audience.recipients.length > MAX_RECIPIENTS) {
    return NextResponse.json(
      { error: `This audience has ${audience.recipients.length} people. Narrow it to ${MAX_RECIPIENTS} or fewer.` },
      { status: 400 },
    );
  }

  const campaign = await prisma.campaign.create({
    data: {
      gymId: auth.session.activeGym.id,
      name: input.name,
      segment: input.segment,
      segmentParams: input.params,
      messageTemplate: input.messageTemplate,
      attributionDays: input.attributionDays,
      createdByUserId: auth.session.user.id,
      recipients: {
        createMany: {
          data: audience.recipients.map((recipient) => ({
            memberId: recipient.memberId,
            leadId: recipient.leadId,
            fullName: recipient.fullName,
            phone: recipient.phone,
            variables: recipient.variables,
            message: renderMessage(input.messageTemplate, recipient.variables),
          })),
        },
      },
    },
    select: { id: true },
  });

  return NextResponse.json({ id: campaign.id }, { status: 201 });
}
