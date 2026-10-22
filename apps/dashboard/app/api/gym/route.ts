import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { requirePermission } from "@/app/api/auth/authorization";
import { isValidTimezone } from "@/app/lib/timezones";

export const runtime = "nodejs";

const gymSelect = { id: true, name: true, timezone: true } as const;

export async function GET() {
  const auth = await requirePermission("gym:manage");
  if (!auth.ok) return auth.response;

  const gym = await prisma.gym.findUnique({ where: { id: auth.session.activeGym.id }, select: gymSelect });
  if (!gym) return NextResponse.json({ error: "Gym not found." }, { status: 404 });
  return NextResponse.json({ gym });
}

export async function PATCH(request: Request) {
  const auth = await requirePermission("gym:manage");
  if (!auth.ok) return auth.response;

  let body: { name?: unknown; timezone?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const timezone = typeof body.timezone === "string" ? body.timezone.trim() : "";
  if (name.length < 2 || name.length > 100) {
    return NextResponse.json({ error: "Gym name must be between 2 and 100 characters." }, { status: 400 });
  }
  if (!timezone || !isValidTimezone(timezone)) {
    return NextResponse.json({ error: "Choose a valid timezone." }, { status: 400 });
  }

  const gym = await prisma.gym.update({
    where: { id: auth.session.activeGym.id },
    data: { name, timezone },
    select: gymSelect,
  });
  return NextResponse.json({ gym });
}
