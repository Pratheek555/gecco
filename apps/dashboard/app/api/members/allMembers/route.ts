import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { getSession } from "@/app/api/auth/session";


export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const gymId = session.activeGym.id;
  const members = await prisma.member.findMany({
    where: {
      gymId,
    },
  });

  const memberships = await prisma.membership.findMany({
    where: {
      memberId: {
        in: members.map((member) => member.id),
      },
    },
  });
  const memberSummary = await prisma.memberBalanceSummary.findMany({
    where: {
      memberId: {
        in: members.map((member) => member.id),
      },
    },
  });

  return NextResponse.json({ gymId, members, memberships, memberSummary });
}
