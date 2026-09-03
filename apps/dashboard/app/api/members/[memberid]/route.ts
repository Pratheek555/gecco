import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { requirePermission } from "@/app/api/auth/authorization";

export const runtime = "nodejs";

type CreateRemarkBody = {
  body?: unknown;
};

async function getScopedMember(memberId: string, gymId: string) {
  return prisma.member.findFirst({
    where: { id: memberId, gymId },
    select: { id: true, fullName: true },
  });
}

export async function GET(_request: Request, context: RouteContext<"/api/members/[memberid]">) {
  const auth = await requirePermission("members:read");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const { memberid: memberId } = await context.params;
  const gymId = session.activeGym.id;

  const member = await prisma.member.findFirst({
    where: { id: memberId, gymId },
    select: {
      id: true,
      fullName: true,
      contacts: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        select: { id: true, kind: true, value: true, isPrimary: true },
      },
      memberships: {
        where: { status: "ACTIVE" },
        orderBy: { startsOn: "asc" },
        select: { id: true, planTypeSnapshot: true, agreedFee: true, startsOn: true, endsOn: true, status: true },
      },
      notes: {
        where: { kind: "REMARK" },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          body: true,
          createdAt: true,
          createdBy: { select: { fullName: true } },
        },
      },
    },
  });

  if (!member) return NextResponse.json({ error: "Member not found." }, { status: 404 });

  const [payments, balance] = await Promise.all([
    prisma.payment.findMany({
      where: { gymId, memberId },
      orderBy: [{ paidOn: "desc" }, { createdAt: "desc" }],
      take: 10,
      select: {
        id: true,
        amount: true,
        paidOn: true,
        status: true,
        reference: true,
        paymentMode: { select: { name: true } },
        recipient: { select: { displayName: true } },
      },
    }),
    prisma.memberBalanceSummary.findFirst({
      where: { gymId, memberId },
      select: { totalOutstanding: true, overdueAmount: true, availableCredit: true, oldestDueOn: true, paymentState: true },
    }),
  ]);

  return NextResponse.json({
    member,
    payments,
    balance: balance ?? {
      totalOutstanding: "0",
      overdueAmount: "0",
      availableCredit: "0",
      oldestDueOn: null,
      paymentState: "PAID",
    },
  });
}

export async function POST(request: Request, context: RouteContext<"/api/members/[memberid]">) {
  const auth = await requirePermission("members:write");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const { memberid: memberId } = await context.params;
  let payload: CreateRemarkBody;

  try {
    payload = await request.json() as CreateRemarkBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const body = typeof payload.body === "string" ? payload.body.trim() : "";
  if (!body || body.length > 2_000) {
    return NextResponse.json({ error: "Remark must be between 1 and 2,000 characters." }, { status: 400 });
  }

  const member = await getScopedMember(memberId, session.activeGym.id);
  if (!member) return NextResponse.json({ error: "Member not found." }, { status: 404 });

  const remark = await prisma.memberNote.create({
    data: {
      memberId: member.id,
      kind: "REMARK",
      body,
      createdByUserId: session.user.id,
    },
    select: {
      id: true,
      body: true,
      createdAt: true,
      createdBy: { select: { fullName: true } },
    },
  });

  return NextResponse.json(remark, { status: 201 });
}
