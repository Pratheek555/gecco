import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { getSession } from "@/app/api/auth/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let body: { gymId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof body.gymId !== "string" || !body.gymId) {
    return NextResponse.json({ error: "gymId is required." }, { status: 400 });
  }

  const gym = session.gyms.find((item) => item.id === body.gymId);
  if (!gym) return NextResponse.json({ error: "You do not have access to this gym." }, { status: 403 });

  await prisma.session.update({ where: { id: session.id }, data: { activeGymId: gym.id } });
  return NextResponse.json({ activeGym: gym });
}
