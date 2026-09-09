import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { requirePermission } from "@/app/api/auth/authorization";
import {
  attributedPayments,
  monthlyIncentives,
  revenueByMonth,
  totalAttributedRevenue,
  trailingMonthKeys,
} from "@/app/lib/trainer-revenue";

export async function GET(_request: Request, context: RouteContext<"/api/trainers/[trainerid]">) {
  const auth = await requirePermission("trainers:read");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const { trainerid: trainerId } = await context.params;
  const trainer = await prisma.trainer.findFirst({
    where: { id: trainerId, gymId: session.activeGym.id },
    select: {
      id: true,
      fullName: true,
      isActive: true,
      createdAt: true,
      incentiveRules: {
        orderBy: { startsOn: "desc" },
        select: { id: true, percentage: true, startsOn: true, endsOn: true },
      },
      assignments: {
        orderBy: { startsOn: "desc" },
        select: {
          id: true,
          startsOn: true,
          endsOn: true,
          membership: {
            select: {
              id: true,
              status: true,
              startsOn: true,
              endsOn: true,
              agreedFee: true,
              durationMonths: true,
              trainerRevenueEligibleSnapshot: true,
              member: { select: { id: true, fullName: true } },
              plan: { select: { id: true, name: true, code: true, type: true } },
              payments: {
                where: { status: "SUCCEEDED" },
                select: { id: true, amount: true, paidOn: true },
              },
            },
          },
        },
      },
    },
  });

  if (!trainer) return NextResponse.json({ error: "Trainer not found." }, { status: 404 });

  const revenueMonths = trailingMonthKeys();
  const monthlyRevenue = revenueByMonth(trainer.assignments, revenueMonths);
  const incentiveRules = trainer.incentiveRules.map((rule) => ({
    id: rule.id,
    percentage: rule.percentage.toString(),
    startsOn: rule.startsOn.toISOString().slice(0, 10),
    endsOn: rule.endsOn?.toISOString().slice(0, 10) ?? null,
  }));
  const memberships = trainer.assignments.map((assignment) => {
    const payments = attributedPayments(assignment);

    return {
      id: assignment.id,
      member: assignment.membership.member,
      plan: assignment.membership.plan,
      status: assignment.membership.status,
      startsOn: assignment.membership.startsOn.toISOString().slice(0, 10),
      endsOn: assignment.membership.endsOn.toISOString().slice(0, 10),
      assignmentStartsOn: assignment.startsOn.toISOString().slice(0, 10),
      assignmentEndsOn: assignment.endsOn?.toISOString().slice(0, 10) ?? null,
      agreedFee: assignment.membership.agreedFee.toString(),
      paidAmount: assignment.membership.payments
        .reduce((total, payment) => total + Number(payment.amount), 0)
        .toFixed(2),
      attributedRevenue: payments
        .reduce((total, payment) => total + Number(payment.amount), 0)
        .toFixed(2),
    };
  });

  const activeMemberships = memberships.filter((membership) => membership.status === "ACTIVE");
  const activeClientIds = new Set(activeMemberships.map((membership) => membership.member.id));
  const totalRevenue = totalAttributedRevenue(trainer.assignments);
  const revenuePayments = trainer.assignments
    .flatMap((assignment) =>
      attributedPayments(assignment).map((payment) => ({
        paymentId: payment.id,
        member: assignment.membership.member,
        plan: assignment.membership.plan,
        paidOn: payment.paidOn.toISOString().slice(0, 10),
        amount: payment.amount.toString(),
      })),
    )
    .sort((left, right) => right.paidOn.localeCompare(left.paidOn));

  return NextResponse.json({
    trainer: {
      id: trainer.id,
      fullName: trainer.fullName,
      isActive: trainer.isActive,
      createdAt: trainer.createdAt.toISOString(),
    },
    summary: {
      activeClients: activeClientIds.size,
      activeMemberships: activeMemberships.length,
      totalMemberships: memberships.length,
      totalRevenue: totalRevenue.toFixed(2),
    },
    monthlyRevenue,
    monthlyIncentives: monthlyIncentives(monthlyRevenue, trainer.incentiveRules),
    incentiveRules,
    canManageIncentives: auth.role === "OWNER",
    revenuePayments,
    memberships,
  });
}

type UpdateTrainerBody = { fullName?: unknown; isActive?: unknown };

export async function PATCH(request: Request, context: RouteContext<"/api/trainers/[trainerid]">) {
  const auth = await requirePermission("trainers:manage");
  if (!auth.ok) return auth.response;
  const { trainerid: trainerId } = await context.params;
  let body: UpdateTrainerBody;
  try {
    body = (await request.json()) as UpdateTrainerBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const data: { fullName?: string; isActive?: boolean } = {};
  if (body.fullName !== undefined) {
    if (
      typeof body.fullName !== "string" ||
      body.fullName.trim().length < 2 ||
      body.fullName.trim().length > 100
    )
      return NextResponse.json(
        { error: "fullName must be between 2 and 100 characters." },
        { status: 400 },
      );
    data.fullName = body.fullName.trim();
  }
  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean")
      return NextResponse.json({ error: "isActive must be a boolean." }, { status: 400 });
    data.isActive = body.isActive;
  }
  if (!Object.keys(data).length)
    return NextResponse.json({ error: "At least one trainer field is required." }, { status: 400 });
  const trainer = await prisma.trainer.findFirst({
    where: { id: trainerId, gymId: auth.session.activeGym.id },
    select: { id: true },
  });
  if (!trainer) return NextResponse.json({ error: "Trainer not found." }, { status: 404 });
  const updated = await prisma.trainer.update({
    where: { id: trainer.id },
    data,
    select: { id: true, fullName: true, isActive: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/trainers/[trainerid]">,
) {
  const auth = await requirePermission("trainers:manage");
  if (!auth.ok) return auth.response;
  const { trainerid: trainerId } = await context.params;
  const trainer = await prisma.trainer.findFirst({
    where: { id: trainerId, gymId: auth.session.activeGym.id },
    select: { id: true },
  });
  if (!trainer) return NextResponse.json({ error: "Trainer not found." }, { status: 404 });
  const updated = await prisma.trainer.update({
    where: { id: trainer.id },
    data: { isActive: false },
    select: { id: true, isActive: true },
  });
  return NextResponse.json({
    ...updated,
    message: "Trainer deactivated. Assignment and revenue history was retained.",
  });
}
