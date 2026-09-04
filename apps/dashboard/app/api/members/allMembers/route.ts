import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { requirePermission } from "@/app/api/auth/authorization";


export async function GET() {
  const auth = await requirePermission("members:read");
  if (!auth.ok) return auth.response;
  const { session } = auth;
  const gymId = session.activeGym.id;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const [members, memberSummary] = await Promise.all([
    prisma.member.findMany({
      where: { gymId },
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        fullName: true,
        memberships: {
          where: { status: "ACTIVE" },
          orderBy: { startsOn: "asc" },
          select: {
            id: true,
            planTypeSnapshot: true,
            durationMonths: true,
            agreedFee: true,
            startsOn: true,
            endsOn: true,
            status: true,
            charges: {
              where: { status: { not: "VOIDED" } },
              select: {
                amount: true,
                allocations: {
                  where: { payment: { status: "SUCCEEDED" } },
                  select: { amount: true },
                },
              },
            },
            trainerAssignments: {
              where: {
                startsOn: { lte: today },
                OR: [{ endsOn: null }, { endsOn: { gte: today } }],
              },
              orderBy: { startsOn: "desc" },
              select: { trainer: { select: { fullName: true } } },
            },
          },
        },
      },
    }),
    prisma.memberBalanceSummary.findMany({
      where: { gymId },
      select: {
        memberId: true,
        totalOutstanding: true,
        overdueAmount: true,
        availableCredit: true,
        oldestDueOn: true,
        paymentState: true,
      },
    }),
  ]);

  const summariesByMemberId = new Map(memberSummary.map((summary) => [summary.memberId, summary]));

  return NextResponse.json({
    gymId,
    members: members.map((member) => ({
      id: member.id,
      fullName: member.fullName,
      memberships: member.memberships.map((membership) => ({
        id: membership.id,
        durationMonths: membership.durationMonths,
        planTypeSnapshot: membership.planTypeSnapshot,
        agreedFee: membership.agreedFee.toString(),
        startsOn: membership.startsOn.toISOString().slice(0, 10),
        endsOn: membership.endsOn.toISOString().slice(0, 10),
        status: membership.status,
        trainers: membership.trainerAssignments.map((assignment) => assignment.trainer.fullName),
        totalAmount: membership.agreedFee.toString(),
        paidAmount: membership.charges
          .flatMap((charge) => charge.allocations)
          .reduce((total, allocation) => total + Number(allocation.amount), 0)
          .toFixed(2),
      })),
      totalAmount: member.memberships.reduce((total, membership) => total + Number(membership.agreedFee), 0).toFixed(2),
      paidAmount: member.memberships
        .flatMap((membership) => membership.charges.flatMap((charge) => charge.allocations))
        .reduce((total, allocation) => total + Number(allocation.amount), 0)
        .toFixed(2),
      balance: summariesByMemberId.get(member.id) ?? {
        totalOutstanding: "0",
        overdueAmount: "0",
        availableCredit: "0",
        oldestDueOn: null,
        paymentState: "PAID",
      },
    })),
  });
}
