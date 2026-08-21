import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { getSession } from "@/app/api/auth/session";

export const runtime = "nodejs";

type CreateMembershipBody = {
  planId?: unknown;
  startsOn?: unknown;
  endsOn?: unknown;
  agreedFee?: unknown;
};

function parseDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

function parseFee(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value.toString();
  if (typeof value === "string" && /^\d+(?:\.\d{1,2})?$/.test(value.trim())) return value.trim();

  return null;
}

export async function POST(request: Request, context: RouteContext<"/api/members/[memberid]/memberships">) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { memberid: memberId } = await context.params;

  let body: CreateMembershipBody;
  try {
    const payload: unknown = await request.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
    }
    body = payload as CreateMembershipBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const startsOn = parseDate(body.startsOn);
  const endsOn = parseDate(body.endsOn);
  const agreedFee = body.agreedFee === undefined ? undefined : parseFee(body.agreedFee);

  if (typeof body.planId !== "string" || !body.planId || !startsOn || !endsOn || agreedFee === null) {
    return NextResponse.json(
      { error: "planId, startsOn, and endsOn are required; agreedFee must be a non-negative amount when provided." },
      { status: 400 },
    );
  }

  if (endsOn < startsOn) {
    return NextResponse.json({ error: "endsOn must be on or after startsOn." }, { status: 400 });
  }

  const [member, plan] = await Promise.all([
    prisma.member.findFirst({
      where: { id: memberId, gymId: session.activeGym.id },
      select: { id: true },
    }),
    prisma.plan.findFirst({
      where: { id: body.planId, gymId: session.activeGym.id, isActive: true },
      select: { id: true, type: true, standardMonthlyFee: true },
    }),
  ]);

  if (!member) return NextResponse.json({ error: "Member not found." }, { status: 404 });
  if (!plan) return NextResponse.json({ error: "Active plan not found." }, { status: 404 });

  const membershipFee = agreedFee ?? plan.standardMonthlyFee;
  const membership = await prisma.membership.create({
    data: {
      memberId: member.id,
      planId: plan.id,
      planTypeSnapshot: plan.type,
      startsOn,
      endsOn,
      agreedFee: membershipFee,
      charges: {
        create: {
          gymId: session.activeGym.id,
          memberId: member.id,
          kind: "MEMBERSHIP_FEE",
          amount: membershipFee,
          dueOn: startsOn,
        },
      },
    },
    include: { plan: true, charges: true },
  });


  return NextResponse.json(membership, { status: 201 });
}
