import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { requirePermission } from "@/app/api/auth/authorization";

export const runtime = "nodejs";

const planTypes = ["GT", "PT"] as const;
type PlanType = (typeof planTypes)[number];
type PlanBody = {
  code?: unknown;
  name?: unknown;
  type?: unknown;
  standardMonthlyFee?: unknown;
  durationMonths?: unknown;
  requiresTrainer?: unknown;
  isActive?: unknown;
};

function parseFee(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value.toString();
  if (typeof value === "string" && /^\d+(?:\.\d{1,2})?$/.test(value.trim())) return value.trim();
  return null;
}
function parseDuration(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value) && value > 0 && value <= 120)
    return value;
  if (
    typeof value === "string" &&
    /^\d+$/.test(value.trim()) &&
    Number(value) > 0 &&
    Number(value) <= 120
  )
    return Number(value);
  return null;
}

export async function PATCH(request: Request, context: RouteContext<"/api/plans/[planid]">) {
  const auth = await requirePermission("plans:manage");
  if (!auth.ok) return auth.response;
  const { planid: planId } = await context.params;
  let body: PlanBody;
  try {
    body = (await request.json()) as PlanBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const current = await prisma.plan.findFirst({
    where: { id: planId, gymId: auth.session.activeGym.id },
    select: { id: true },
  });
  if (!current) return NextResponse.json({ error: "Plan not found." }, { status: 404 });
  const data: Record<string, unknown> = {};
  if (body.code !== undefined) {
    if (typeof body.code !== "string" || !body.code.trim())
      return NextResponse.json({ error: "code is required." }, { status: 400 });
    data.code = body.code.trim();
  }
  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim())
      return NextResponse.json({ error: "name is required." }, { status: 400 });
    data.name = body.name.trim();
  }
  if (body.type !== undefined) {
    if (typeof body.type !== "string" || !planTypes.includes(body.type as PlanType))
      return NextResponse.json({ error: "type must be GT or PT." }, { status: 400 });
    data.type = body.type;
  }
  if (body.standardMonthlyFee !== undefined) {
    const fee = parseFee(body.standardMonthlyFee);
    if (fee === null)
      return NextResponse.json(
        { error: "standardMonthlyFee must be a non-negative amount." },
        { status: 400 },
      );
    data.standardMonthlyFee = fee;
  }
  if (body.durationMonths !== undefined) {
    const duration = parseDuration(body.durationMonths);
    if (duration === null)
      return NextResponse.json(
        { error: "durationMonths must be between 1 and 120." },
        { status: 400 },
      );
    data.durationMonths = duration;
  }
  for (const key of ["requiresTrainer", "isActive"] as const)
    if (body[key] !== undefined) {
      if (typeof body[key] !== "boolean")
        return NextResponse.json({ error: `${key} must be a boolean.` }, { status: 400 });
      data[key] = body[key];
    }
  if (!Object.keys(data).length)
    return NextResponse.json({ error: "At least one plan field is required." }, { status: 400 });

  try {
    const plan = await prisma.plan.update({ where: { id: current.id }, data });
    return NextResponse.json(plan);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002")
      return NextResponse.json(
        { error: "A plan with this code already exists for this gym." },
        { status: 409 },
      );
    throw error;
  }
}

export async function DELETE(_request: Request, context: RouteContext<"/api/plans/[planid]">) {
  const auth = await requirePermission("plans:manage");
  if (!auth.ok) return auth.response;
  const { planid: planId } = await context.params;
  const plan = await prisma.plan.findFirst({
    where: { id: planId, gymId: auth.session.activeGym.id },
    select: { id: true },
  });
  if (!plan) return NextResponse.json({ error: "Plan not found." }, { status: 404 });
  const archived = await prisma.plan.update({
    where: { id: plan.id },
    data: { isActive: false },
    select: { id: true, isActive: true },
  });
  return NextResponse.json({
    ...archived,
    message: "Plan archived. Existing memberships keep their original terms.",
  });
}
