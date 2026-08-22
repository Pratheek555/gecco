import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { getSession } from "@/app/api/auth/session";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const paymentModes = await prisma.paymentMode.findMany({
    where: { gymId: session.activeGym.id, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return NextResponse.json({ paymentModes });
}
