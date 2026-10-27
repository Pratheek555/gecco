import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { requirePermission } from "@/app/api/auth/authorization";
import { isValidTimezone } from "@/app/lib/timezones";

export const runtime = "nodejs";

const gymSelect = { id: true, name: true, timezone: true, emailOwnersOnPayment: true, emailMemberReceipts: true } as const;

type GymBody = {
  name?: unknown;
  timezone?: unknown;
  emailOwnersOnPayment?: unknown;
  emailMemberReceipts?: unknown;
};

export async function GET() {
  const auth = await requirePermission("gym:manage");
  if (!auth.ok) return auth.response;

  const gym = await prisma.gym.findUnique({ where: { id: auth.session.activeGym.id }, select: gymSelect });
  if (!gym) return NextResponse.json({ error: "Gym not found." }, { status: 404 });
  return NextResponse.json({ gym });
}

/** Updates any subset of the gym's settings; omitted fields are left unchanged. */
export async function PATCH(request: Request) {
  const auth = await requirePermission("gym:manage");
  if (!auth.ok) return auth.response;

  let body: GymBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const data: { name?: string; timezone?: string; emailOwnersOnPayment?: boolean; emailMemberReceipts?: boolean } = {};

  if (body.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (name.length < 2 || name.length > 100) {
      return NextResponse.json({ error: "Gym name must be between 2 and 100 characters." }, { status: 400 });
    }
    data.name = name;
  }
  if (body.timezone !== undefined) {
    const timezone = typeof body.timezone === "string" ? body.timezone.trim() : "";
    if (!timezone || !isValidTimezone(timezone)) {
      return NextResponse.json({ error: "Choose a valid timezone." }, { status: 400 });
    }
    data.timezone = timezone;
  }
  for (const key of ["emailOwnersOnPayment", "emailMemberReceipts"] as const) {
    if (body[key] === undefined) continue;
    if (typeof body[key] !== "boolean") return NextResponse.json({ error: `${key} must be true or false.` }, { status: 400 });
    data[key] = body[key];
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const gym = await prisma.gym.update({
    where: { id: auth.session.activeGym.id },
    data,
    select: gymSelect,
  });
  return NextResponse.json({ gym });
}
