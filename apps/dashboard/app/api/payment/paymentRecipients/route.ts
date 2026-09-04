import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { requirePermission } from "@/app/api/auth/authorization";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requirePermission("payments:read");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const includeInactive = new URL(request.url).searchParams.get("includeInactive") === "1";
  const recipients = await prisma.paymentRecipient.findMany({
    where: { gymId: session.activeGym.id, ...(includeInactive ? {} : { isActive: true }) },
    orderBy: [{ recipientType: "asc" }, { displayName: "asc" }],
    select: { id: true, displayName: true, recipientType: true, isActive: true },
  });

  return NextResponse.json({ recipients });
}
