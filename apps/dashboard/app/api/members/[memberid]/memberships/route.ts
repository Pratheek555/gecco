import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { requirePermission } from "@/app/api/auth/authorization";

export const runtime = "nodejs";

type CreateMembershipBody = {
  planId?: unknown;
  startsOn?: unknown;
  agreedFee?: unknown;
  trainerId?: unknown;
};

function parseDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

function addMonthsClamped(date: Date, months: number) {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return target;
}

function parseFee(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value.toString();
  if (typeof value === "string" && /^\d+(?:\.\d{1,2})?$/.test(value.trim())) return value.trim();

  return null;
}

export async function POST(
  request: Request,
  context: RouteContext<"/api/members/[memberid]/memberships">,
) {
  const auth = await requirePermission("memberships:write");
  if (!auth.ok) return auth.response;
  const { session } = auth;

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
  const agreedFee = body.agreedFee === undefined ? undefined : parseFee(body.agreedFee);

  if (typeof body.planId !== "string" || !body.planId || !startsOn || agreedFee === null) {
    return NextResponse.json(
      {
        error:
          "planId and startsOn are required; agreedFee must be a non-negative amount when provided.",
      },
      { status: 400 },
    );
  }

  if (
    body.trainerId !== undefined &&
    (typeof body.trainerId !== "string" || !body.trainerId.trim())
  ) {
    return NextResponse.json(
      { error: "trainerId must be a valid trainer id when provided." },
      { status: 400 },
    );
  }

  const [member, plan] = await Promise.all([
    prisma.member.findFirst({
      where: { id: memberId, gymId: session.activeGym.id },
      select: { id: true },
    }),
    prisma.plan.findFirst({
      where: { id: body.planId, gymId: session.activeGym.id, isActive: true },
      select: {
        id: true,
        type: true,
        standardMonthlyFee: true,
        durationMonths: true,
        requiresTrainer: true,
        trainerRevenueEligible: true,
      },
    }),
  ]);

  if (!member) return NextResponse.json({ error: "Member not found." }, { status: 404 });
  if (!plan) return NextResponse.json({ error: "Active plan not found." }, { status: 404 });

  const endsOn = addMonthsClamped(startsOn, plan.durationMonths);

  const trainerId = typeof body.trainerId === "string" ? body.trainerId.trim() : null;
  if (plan.requiresTrainer && !trainerId) {
    return NextResponse.json(
      { error: "A trainer must be selected for this plan." },
      { status: 400 },
    );
  }

  const trainer = trainerId
    ? await prisma.trainer.findFirst({
        where: { id: trainerId, gymId: session.activeGym.id, isActive: true },
        select: { id: true },
      })
    : null;
  if (trainerId && !trainer)
    return NextResponse.json({ error: "Active trainer not found." }, { status: 404 });

  const membershipFee = agreedFee ?? plan.standardMonthlyFee;
  const membership = await prisma.$transaction(async (tx) =>
    tx.membership.create({
      data: {
        memberId: member.id,
        planId: plan.id,
        planTypeSnapshot: plan.type,
        trainerRevenueEligibleSnapshot: plan.trainerRevenueEligible,
        durationMonths: plan.durationMonths,
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
        ...(trainer
          ? { trainerAssignments: { create: { trainerId: trainer.id, startsOn, endsOn } } }
          : {}),
      },
      include: { plan: true, charges: true, trainerAssignments: true },
    }),
  );

  return NextResponse.json(membership, { status: 201 });
}
