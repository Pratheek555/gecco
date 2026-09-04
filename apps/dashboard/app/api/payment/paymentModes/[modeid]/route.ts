import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { requirePermission } from "@/app/api/auth/authorization";

export const runtime = "nodejs";
type ModeBody = { name?: unknown; isActive?: unknown; sortOrder?: unknown };

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/payment/paymentModes/[modeid]">,
) {
  const auth = await requirePermission("gym:manage");
  if (!auth.ok) return auth.response;
  const { modeid: modeId } = await context.params;
  let body: ModeBody;
  try {
    body = (await request.json()) as ModeBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const data: { name?: string; isActive?: boolean; sortOrder?: number } = {};
  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 80)
      return NextResponse.json(
        { error: "name must be between 1 and 80 characters." },
        { status: 400 },
      );
    data.name = body.name.trim();
  }
  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean")
      return NextResponse.json({ error: "isActive must be a boolean." }, { status: 400 });
    data.isActive = body.isActive;
  }
  if (body.sortOrder !== undefined) {
    if (typeof body.sortOrder !== "number" || !Number.isInteger(body.sortOrder))
      return NextResponse.json({ error: "sortOrder must be an integer." }, { status: 400 });
    data.sortOrder = body.sortOrder;
  }
  const mode = await prisma.paymentMode.findFirst({
    where: { id: modeId, gymId: auth.session.activeGym.id },
    select: { id: true },
  });
  if (!mode) return NextResponse.json({ error: "Payment mode not found." }, { status: 404 });
  try {
    return NextResponse.json(
      await prisma.paymentMode.update({
        where: { id: mode.id },
        data,
        select: { id: true, name: true, isActive: true, sortOrder: true },
      }),
    );
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002")
      return NextResponse.json(
        { error: "A payment mode with this name already exists." },
        { status: 409 },
      );
    throw error;
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/payment/paymentModes/[modeid]">,
) {
  const auth = await requirePermission("gym:manage");
  if (!auth.ok) return auth.response;
  const { modeid: modeId } = await context.params;
  const mode = await prisma.paymentMode.findFirst({
    where: { id: modeId, gymId: auth.session.activeGym.id },
    select: { id: true },
  });
  if (!mode) return NextResponse.json({ error: "Payment mode not found." }, { status: 404 });
  return NextResponse.json(
    await prisma.paymentMode.update({
      where: { id: mode.id },
      data: { isActive: false },
      select: { id: true, isActive: true },
    }),
  );
}
