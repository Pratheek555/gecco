import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { requirePermission } from "@/app/api/auth/authorization";

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthKeysBetween(start: Date, end: Date) {
  const keys: string[] = [];
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));

  while (cursor <= last) {
    keys.push(monthKey(cursor));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return keys;
}

function trailingMonthKeys() {
  const now = new Date();
  const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  const keys: string[] = [];

  for (let index = 0; index < 12; index += 1) {
    keys.push(monthKey(cursor));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return keys;
}

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
              member: { select: { id: true, fullName: true } },
              plan: { select: { id: true, name: true, code: true, type: true } },
              payments: {
                where: { status: "SUCCEEDED" },
                select: { amount: true, paidOn: true },
              },
            },
          },
        },
      },
    },
  });

  if (!trainer) return NextResponse.json({ error: "Trainer not found." }, { status: 404 });

  const revenueMonths = trailingMonthKeys();
  const revenueByMonth = new Map(revenueMonths.map((month) => [month, 0]));
  const memberships = trainer.assignments.map((assignment) => {
    const membershipMonths = monthKeysBetween(assignment.membership.startsOn, assignment.membership.endsOn);
    const monthlyRevenue = assignment.membership.payments.reduce((total, payment) => total + Number(payment.amount), 0) / Math.max(1, membershipMonths.length);
    const assignmentStart = assignment.startsOn > assignment.membership.startsOn ? assignment.startsOn : assignment.membership.startsOn;
    const assignmentEnd = assignment.endsOn && assignment.endsOn < assignment.membership.endsOn ? assignment.endsOn : assignment.membership.endsOn;

    for (const month of monthKeysBetween(assignmentStart, assignmentEnd)) {
      if (revenueByMonth.has(month)) revenueByMonth.set(month, (revenueByMonth.get(month) ?? 0) + monthlyRevenue);
    }

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
      paidAmount: assignment.membership.payments.reduce((total, payment) => total + Number(payment.amount), 0).toFixed(2),
      monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
    };
  });

  const activeMemberships = memberships.filter((membership) => membership.status === "ACTIVE");
  const activeClientIds = new Set(activeMemberships.map((membership) => membership.member.id));
  const totalRevenue = memberships.reduce((total, membership) => total + Number(membership.paidAmount), 0);

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
    monthlyRevenue: revenueMonths.map((month) => ({ month, amount: Number((revenueByMonth.get(month) ?? 0).toFixed(2)) })),
    memberships,
  });
}
