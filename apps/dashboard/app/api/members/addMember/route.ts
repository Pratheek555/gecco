import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { getSession } from "@/app/api/auth/session";

const memberStatuses = ["ACTIVE", "ARCHIVED"] as const;
const contactKinds = ["PHONE", "EMAIL", "WHATSAPP", "OTHER"] as const;

type MemberStatus = (typeof memberStatuses)[number];
type ContactKind = (typeof contactKinds)[number];
type ContactInput = {
  kind: ContactKind;
  value: string;
  isPrimary?: boolean;
};

type CreateMemberBody = {
  fullName?: string;
  memberNumber?: string;
  joinedOn?: string;
  status?: MemberStatus;
  contacts?: ContactInput[];
};

function isContactInput(value: unknown): value is ContactInput {
  if (!value || typeof value !== "object") return false;

  const contact = value as Record<string, unknown>;
  return (
    typeof contact.value === "string" &&
    contactKinds.includes(contact.kind as ContactKind) &&
    (contact.isPrimary === undefined || typeof contact.isPrimary === "boolean")
  );
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let body: CreateMemberBody;
  try {
    body = await request.json() as CreateMemberBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const { fullName, memberNumber, joinedOn, contacts = [] } = body;
  const status = body.status ?? "ACTIVE";

  if (typeof fullName !== "string" || !fullName.trim() || typeof memberNumber !== "string" || !memberNumber.trim() || typeof joinedOn !== "string") {
    return NextResponse.json(
      { error: "fullName, memberNumber, and joinedOn are required." },
      { status: 400 },
    );
  }

  if (!memberStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid member status." }, { status: 400 });
  }

  if (!Array.isArray(contacts) || !contacts.every(isContactInput)) {
    return NextResponse.json({ error: "Invalid contacts payload." }, { status: 400 });
  }

  const joinedDate = new Date(joinedOn);
  if (Number.isNaN(joinedDate.getTime())) {
    return NextResponse.json({ error: "joinedOn must be a valid date." }, { status: 400 });
  }

  try {
    const member = await prisma.member.create({
      data: {
        gymId: session.activeGym.id,
        fullName: fullName.trim(),
        memberNumber: memberNumber.trim(),
        joinedOn: joinedDate,
        status,
        contacts: {
          create: contacts.map(({ kind, value, isPrimary = false }) => ({
            kind,
            value: value.trim(),
            isPrimary,
          })),
        },
      },
      include: { contacts: true },
    });

    return NextResponse.json(member, { status: 201 });
  } catch {
    return NextResponse.json({ error: "We could not create the member. The member number may already be in use." }, { status: 409 });
  }
}
