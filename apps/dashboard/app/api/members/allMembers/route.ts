import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { getSession } from "@/app/api/auth/session";


export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const gymId = session.activeGym.id;
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
            agreedFee: true,
            startsOn: true,
            endsOn: true,
            status: true,
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
      ...member,
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
