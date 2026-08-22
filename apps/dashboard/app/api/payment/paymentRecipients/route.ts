import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { getSession } from "@/app/api/auth/session";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const recipients = await prisma.paymentRecipient.findMany({
    where: { gymId: session.activeGym.id, isActive: true },
    orderBy: [{ recipientType: "asc" }, { displayName: "asc" }],
    select: { id: true, displayName: true, recipientType: true },
  });

  return NextResponse.json({ recipients });
}
