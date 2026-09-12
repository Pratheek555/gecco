import { randomUUID } from "node:crypto";
import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { requirePermission } from "@/app/api/auth/authorization";

export const runtime = "nodejs";

export async function POST(request: Request, context: RouteContext<"/api/leads/[leadid]/convert">) {
  const auth = await requirePermission("leads:write");
  if (!auth.ok) return auth.response;

  let payload: unknown = {};
  try {
    const text = await request.text();
    payload = text ? JSON.parse(text) : {};
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
  }

  const joinedOnValue = (payload as Record<string, unknown>).joinedOn;
  const joinedOn =
    typeof joinedOnValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(joinedOnValue)
      ? new Date(`${joinedOnValue}T00:00:00.000Z`)
      : new Date();
  if (Number.isNaN(joinedOn.getTime())) {
    return NextResponse.json({ error: "joinedOn must be a valid date." }, { status: 400 });
  }

  const { leadid: leadId } = await context.params;
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, gymId: auth.session.activeGym.id },
    select: {
      id: true,
      fullName: true,
      phone: true,
      email: true,
      convertedMemberId: true,
    },
  });
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  if (lead.convertedMemberId) {
    return NextResponse.json({ error: "This lead is already a member." }, { status: 409 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const member = await tx.member.create({
        data: {
          gymId: auth.session.activeGym.id,
          fullName: lead.fullName,
          memberNumber: `LEAD-${Date.now().toString(36).toUpperCase()}-${randomUUID()
            .slice(0, 4)
            .toUpperCase()}`,
          joinedOn,
          contacts: {
            create: [
              ...(lead.phone
                ? [{ kind: "PHONE" as const, value: lead.phone, isPrimary: true }]
                : []),
              ...(lead.email
                ? [{ kind: "EMAIL" as const, value: lead.email, isPrimary: true }]
                : []),
            ],
          },
        },
        select: { id: true, fullName: true, memberNumber: true },
      });

      const convertedAt = new Date();
      await tx.lead.update({
        where: { id: lead.id },
        data: {
          status: "WON",
          convertedMemberId: member.id,
          convertedAt,
          nextFollowUpAt: null,
        },
      });
      await tx.leadActivity.create({
        data: {
          leadId: lead.id,
          type: "CONVERSION",
          body: `Converted to member #${member.memberNumber}.`,
          createdByUserId: auth.session.user.id,
        },
      });
      return { member, convertedAt };
    });

    return NextResponse.json(
      { member: result.member, convertedAt: result.convertedAt.toISOString() },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "We could not convert this lead. Please try again." },
      { status: 409 },
    );
  }
}
