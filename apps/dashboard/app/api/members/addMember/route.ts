import { prisma } from "db/client";

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
  gymId?: string;
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
  const body = (await request.json()) as CreateMemberBody;
  const { gymId, fullName, memberNumber, joinedOn, contacts = [] } = body;
  const status = body.status ?? "ACTIVE";

  if (!gymId || !fullName || !memberNumber || !joinedOn) {
    return Response.json(
      { error: "gymId, fullName, memberNumber, and joinedOn are required." },
      { status: 400 },
    );
  }

  if (!memberStatuses.includes(status)) {
    return Response.json({ error: "Invalid member status." }, { status: 400 });
  }

  if (!Array.isArray(contacts) || !contacts.every(isContactInput)) {
    return Response.json({ error: "Invalid contacts payload." }, { status: 400 });
  }

  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: { id: true },
  });

  if (!gym) {
    return Response.json(
      { error: "Gym not found. Use the gymId returned when the gym was created." },
      { status: 404 },
    );
  }

  const member = await prisma.member.create({
    data: {
      gym: { connect: { id: gymId } },
      fullName,
      memberNumber,
      joinedOn: new Date(joinedOn),
      status,
      contacts: {
        create: contacts.map(({ kind, value, isPrimary = false }) => ({
          kind,
          value,
          isPrimary,
        })),
      },
    },
    include: { contacts: true },
  });

  return Response.json(member, { status: 201 });
}
