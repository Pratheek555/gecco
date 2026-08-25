import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { getSession } from "@/app/api/auth/session";

export const runtime = "nodejs";

export async function DELETE(_request: Request, context: RouteContext<"/api/memberships/[membershipid]">) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

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
