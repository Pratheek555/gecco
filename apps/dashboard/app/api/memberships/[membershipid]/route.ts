import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { requirePermission } from "@/app/api/auth/authorization";

export const runtime = "nodejs";

type UpdateMembershipBody = {
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

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/memberships/[membershipid]">,
) {
  const auth = await requirePermission("memberships:write");
  if (!auth.ok) return auth.response;
  const { membershipid: membershipId } = await context.params;
  let body: UpdateMembershipBody;
  try {
    body = (await request.json()) as UpdateMembershipBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const current = await prisma.membership.findFirst({
    where: { id: membershipId, member: { gymId: auth.session.activeGym.id } },
    select: {
      id: true,
      memberId: true,
      planId: true,
      startsOn: true,
      agreedFee: true,
      charges: { select: { id: true, allocations: { select: { id: true } } } },
    },
  });
  if (!current) return NextResponse.json({ error: "Membership not found." }, { status: 404 });

  const startsOn = body.startsOn === undefined ? current.startsOn : parseDate(body.startsOn);
  const agreedFee =
    body.agreedFee === undefined ? current.agreedFee.toString() : parseFee(body.agreedFee);
  if (!startsOn || agreedFee === null)
    return NextResponse.json(
      { error: "startsOn must be a valid date and agreedFee must be a non-negative amount." },
      { status: 400 },
    );
  const planId = body.planId === undefined ? current.planId : body.planId;
  if (typeof planId !== "string" || !planId)
    return NextResponse.json({ error: "planId is required." }, { status: 400 });
  const trainerId =
    body.trainerId === undefined
      ? undefined
      : typeof body.trainerId === "string" && body.trainerId.trim()
        ? body.trainerId.trim()
        : null;
  if (body.trainerId !== undefined && trainerId === null)
    return NextResponse.json(
      { error: "trainerId must be a valid trainer id when provided." },
      { status: 400 },
    );
  const plan = await prisma.plan.findFirst({
    where: { id: planId, gymId: auth.session.activeGym.id },
    select: { id: true, type: true, durationMonths: true, requiresTrainer: true },
  });
  if (!plan) return NextResponse.json({ error: "Plan not found for this gym." }, { status: 404 });
  if (plan.requiresTrainer && !trainerId && body.trainerId !== undefined)
    return NextResponse.json(
      { error: "A trainer must be selected for this plan." },
      { status: 400 },
    );
  if (plan.requiresTrainer && body.trainerId === undefined) {
    const existingAssignment = await prisma.membershipTrainerAssignment.findFirst({
      where: { membershipId: current.id, endsOn: null },
      select: { trainerId: true },
    });
    if (!existingAssignment)
      return NextResponse.json(
        { error: "A trainer must be selected for this plan." },
        { status: 400 },
      );
  }
  const selectedTrainerId = body.trainerId === undefined ? undefined : trainerId;
  if (selectedTrainerId) {
    const trainer = await prisma.trainer.findFirst({
      where: { id: selectedTrainerId, gymId: auth.session.activeGym.id, isActive: true },
      select: { id: true },
    });
    if (!trainer) return NextResponse.json({ error: "Active trainer not found." }, { status: 404 });
  }
  const hasPayments = current.charges.some((charge) => charge.allocations.length > 0);
  if (hasPayments && agreedFee !== current.agreedFee.toString())
    return NextResponse.json(
      { error: "The agreed fee cannot change after a payment has been applied." },
      { status: 409 },
    );

  const endsOn = addMonthsClamped(startsOn, plan.durationMonths);
  const updated = await prisma.$transaction(async (tx) => {
    const membership = await tx.membership.update({
      where: { id: current.id },
      data: {
        planId: plan.id,
        planTypeSnapshot: plan.type,
        durationMonths: plan.durationMonths,
        startsOn,
        endsOn,
        agreedFee,
      },
      select: {
        id: true,
        startsOn: true,
        endsOn: true,
        agreedFee: true,
        plan: { select: { id: true, name: true, code: true } },
      },
    });
    const charge = current.charges[0];
    if (charge && !hasPayments)
      await tx.membershipCharge.update({
        where: { id: charge.id },
        data: { amount: agreedFee, dueOn: startsOn },
      });
    if (selectedTrainerId !== undefined) {
      await tx.membershipTrainerAssignment.updateMany({
        where: { membershipId: current.id, endsOn: null },
        data: { endsOn: startsOn },
      });
      if (selectedTrainerId)
        await tx.membershipTrainerAssignment.create({
          data: { membershipId: current.id, trainerId: selectedTrainerId, startsOn, endsOn },
        });
    }
    return membership;
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/memberships/[membershipid]">,
) {
  const auth = await requirePermission("memberships:cancel");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const { membershipid: membershipId } = await context.params;
  const membership = await prisma.membership.findFirst({
    where: { id: membershipId, member: { gymId: session.activeGym.id } },
    select: { id: true },
  });
  if (!membership) return NextResponse.json({ error: "Membership not found." }, { status: 404 });

  const updated = await prisma.$transaction(async (transaction) => {
    const cancelled = await transaction.membership.update({
      where: { id: membership.id },
      data: { status: "CANCELLED" },
      select: { id: true, status: true },
    });
    const voidedCharges = await transaction.membershipCharge.updateMany({
      where: { membershipId: membership.id, status: { in: ["OPEN", "PARTIALLY_PAID"] } },
      data: { status: "VOIDED", voidedAt: new Date() },
    });
    return { ...cancelled, voidedChargeCount: voidedCharges.count };
  });

  return NextResponse.json(updated);
}
