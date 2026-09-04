import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { requirePermission } from "@/app/api/auth/authorization";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requirePermission("payments:read");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const includeInactive = new URL(request.url).searchParams.get("includeInactive") === "1";
  const paymentModes = await prisma.paymentMode.findMany({
    where: { gymId: session.activeGym.id, ...(includeInactive ? {} : { isActive: true }) },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, isActive: true, sortOrder: true },
  });

  return NextResponse.json({ paymentModes });
}

export async function POST(request: Request) {
  const auth = await requirePermission("gym:manage");
  if (!auth.ok) return auth.response;
  let body: { name?: unknown; isActive?: unknown; sortOrder?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const isActive = body.isActive ?? true;
  const sortOrder = body.sortOrder ?? 0;
  if (
    !name ||
    name.length > 80 ||
    typeof isActive !== "boolean" ||
    typeof sortOrder !== "number" ||
    !Number.isInteger(sortOrder)
  )
    return NextResponse.json(
      { error: "name, a boolean isActive, and an integer sortOrder are required." },
      { status: 400 },
    );
  try {
    const mode = await prisma.paymentMode.create({
      data: { gymId: auth.session.activeGym.id, name, isActive, sortOrder },
      select: { id: true, name: true, isActive: true, sortOrder: true },
    });
    return NextResponse.json(mode, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002")
      return NextResponse.json(
        { error: "A payment mode with this name already exists." },
        { status: 409 },
      );
    throw error;
  }
}
