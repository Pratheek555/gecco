import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { requirePermission } from "@/app/api/auth/authorization";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requirePermission("payments:read");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const recipients = await prisma.paymentRecipient.findMany({
    where: { gymId: session.activeGym.id, isActive: true },
    orderBy: [{ recipientType: "asc" }, { displayName: "asc" }],
    select: { id: true, displayName: true, recipientType: true },
  });

  return NextResponse.json({ recipients });
}
