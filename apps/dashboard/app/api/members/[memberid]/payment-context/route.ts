import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { getSession } from "@/app/api/auth/session";

export const runtime = "nodejs";

export async function GET(_request: Request, context: RouteContext<"/api/members/[memberid]/payment-context">) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { memberid: memberId } = await context.params;
  const member = await prisma.member.findFirst({
    where: { id: memberId, gymId: session.activeGym.id },
    select: {
      id: true,
      fullName: true,
      memberships: {
        where: { status: "ACTIVE" },
        orderBy: { startsOn: "desc" },
        select: {
          id: true,
          plan: { select: { name: true } },
          charges: {
            where: { status: { in: ["OPEN", "PARTIALLY_PAID"] } },
            orderBy: { dueOn: "asc" },
            select: {
              id: true,
              amount: true,
              dueOn: true,
              allocations: {
                where: { payment: { status: "SUCCEEDED" } },
                select: { amount: true },
              },
            },
          },
        },
      },
    },
  });

  if (!member) return NextResponse.json({ error: "Member not found." }, { status: 404 });

  return NextResponse.json({
    member: { id: member.id, fullName: member.fullName },
    memberships: member.memberships.map((membership) => ({
      id: membership.id,
      planName: membership.plan.name,
      charges: membership.charges.map((charge) => {
        const paidAmount = charge.allocations.reduce((total, allocation) => total + Number(allocation.amount), 0);
        const amount = Number(charge.amount);

        return {
          id: charge.id,
          amount: charge.amount.toString(),
          paidAmount: paidAmount.toFixed(2),
          outstandingAmount: Math.max(amount - paidAmount, 0).toFixed(2),
          dueOn: charge.dueOn.toISOString().slice(0, 10),
        };
      }),
    })),
  });
}
