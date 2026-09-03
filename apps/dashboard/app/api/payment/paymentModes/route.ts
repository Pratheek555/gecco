import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { requirePermission } from "@/app/api/auth/authorization";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requirePermission("payments:read");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const paymentModes = await prisma.paymentMode.findMany({
    where: { gymId: session.activeGym.id, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return NextResponse.json({ paymentModes });
}
