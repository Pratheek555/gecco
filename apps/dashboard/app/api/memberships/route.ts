import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { requirePermission } from "@/app/api/auth/authorization";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requirePermission("memberships:read");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const memberships = await prisma.membership.findMany({
    where: { member: { gymId: session.activeGym.id }, status: "ACTIVE" },
    orderBy: [{ endsOn: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      startsOn: true,
      endsOn: true,
      agreedFee: true,
      status: true,
      member: { select: { id: true, fullName: true } },
      plan: { select: { id: true, name: true, code: true } },
      trainerAssignments: {
        where: { OR: [{ endsOn: null }, { endsOn: { gte: new Date() } }] },
        orderBy: { startsOn: "desc" },
        take: 1,
        select: { trainer: { select: { id: true, fullName: true } } },
      },
    },
  });

  return NextResponse.json({ memberships });
}
