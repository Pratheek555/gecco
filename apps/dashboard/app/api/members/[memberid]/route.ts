import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { requirePermission } from "@/app/api/auth/authorization";

export const runtime = "nodejs";

type CreateRemarkBody = {
  body?: unknown;
};

const memberStatuses = ["ACTIVE", "ARCHIVED"] as const;
const contactKinds = ["PHONE", "EMAIL", "WHATSAPP", "OTHER"] as const;
type MemberStatus = (typeof memberStatuses)[number];
type ContactKind = (typeof contactKinds)[number];
type ContactInput = { kind: ContactKind; value: string; isPrimary?: boolean };

type UpdateMemberBody = {
  fullName?: unknown;
  memberNumber?: unknown;
  joinedOn?: unknown;
  status?: unknown;
  contacts?: unknown;
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
        select: {
          id: true,
          planTypeSnapshot: true,
          agreedFee: true,
          startsOn: true,
          endsOn: true,
          status: true,
        },
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
      select: {
        totalOutstanding: true,
        overdueAmount: true,
        availableCredit: true,
        oldestDueOn: true,
        paymentState: true,
      },
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
    payload = (await request.json()) as CreateRemarkBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const body = typeof payload.body === "string" ? payload.body.trim() : "";
  if (!body || body.length > 2_000) {
    return NextResponse.json(
      { error: "Remark must be between 1 and 2,000 characters." },
      { status: 400 },
    );
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

function parseDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

function isContact(value: unknown): value is ContactInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const contact = value as Record<string, unknown>;
  return (
    typeof contact.value === "string" &&
    contact.value.trim().length > 0 &&
    contactKinds.includes(contact.kind as ContactKind) &&
    (contact.isPrimary === undefined || typeof contact.isPrimary === "boolean")
  );
}

export async function PATCH(request: Request, context: RouteContext<"/api/members/[memberid]">) {
  const auth = await requirePermission("members:write");
  if (!auth.ok) return auth.response;
  const { session } = auth;
  const { memberid: memberId } = await context.params;

  let body: UpdateMemberBody;
  try {
    const payload: unknown = await request.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload))
      return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
    body = payload as UpdateMemberBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const data: { fullName?: string; memberNumber?: string; joinedOn?: Date; status?: MemberStatus } =
    {};
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
  if (body.memberNumber !== undefined) {
    if (
      typeof body.memberNumber !== "string" ||
      !body.memberNumber.trim() ||
      body.memberNumber.trim().length > 80
    )
      return NextResponse.json(
        { error: "memberNumber must be between 1 and 80 characters." },
        { status: 400 },
      );
    data.memberNumber = body.memberNumber.trim();
  }
  if (body.joinedOn !== undefined) {
    const joinedOn = parseDate(body.joinedOn);
    if (!joinedOn)
      return NextResponse.json(
        { error: "joinedOn must be a valid YYYY-MM-DD date." },
        { status: 400 },
      );
    data.joinedOn = joinedOn;
  }
  if (body.status !== undefined) {
    if (typeof body.status !== "string" || !memberStatuses.includes(body.status as MemberStatus))
      return NextResponse.json({ error: "status must be ACTIVE or ARCHIVED." }, { status: 400 });
    data.status = body.status as MemberStatus;
  }
  const contacts = body.contacts === undefined ? undefined : body.contacts;
  if (contacts !== undefined && (!Array.isArray(contacts) || !contacts.every(isContact)))
    return NextResponse.json(
      { error: "contacts must be an array of valid contact entries." },
      { status: 400 },
    );

  const member = await prisma.member.findFirst({
    where: { id: memberId, gymId: session.activeGym.id },
    select: { id: true },
  });
  if (!member) return NextResponse.json({ error: "Member not found." }, { status: 404 });

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.member.update({
        where: { id: member.id },
        data: {
          ...data,
          ...(contacts !== undefined
            ? {
                contacts: {
                  deleteMany: {},
                  create: (contacts as ContactInput[]).map((contact) => ({
                    kind: contact.kind,
                    value: contact.value.trim(),
                    isPrimary: contact.isPrimary ?? false,
                  })),
                },
              }
            : {}),
        },
        include: { contacts: true },
      });
      return result;
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "We could not update the member. The member number may already be in use." },
      { status: 409 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext<"/api/members/[memberid]">) {
  const auth = await requirePermission("members:write");
  if (!auth.ok) return auth.response;
  const { session } = auth;
  const { memberid: memberId } = await context.params;
  const member = await prisma.member.findFirst({
    where: { id: memberId, gymId: session.activeGym.id },
    select: { id: true },
  });
  if (!member) return NextResponse.json({ error: "Member not found." }, { status: 404 });

  const updated = await prisma.member.update({
    where: { id: member.id },
    data: { status: "ARCHIVED" },
    select: { id: true, status: true },
  });
  return NextResponse.json({
    ...updated,
    message: "Member archived. Membership and payment history was retained.",
  });
}
