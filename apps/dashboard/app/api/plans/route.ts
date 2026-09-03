import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { requirePermission } from "@/app/api/auth/authorization";

export const runtime = "nodejs";

const planTypes = ["GT", "PT"] as const;
type PlanType = (typeof planTypes)[number];

type CreatePlanBody = {
  code?: unknown;
  name?: unknown;
  type?: unknown;
  standardMonthlyFee?: unknown;
  durationMonths?: unknown;
  requiresTrainer?: unknown;
  isActive?: unknown;
};

function isPlanType(value: unknown): value is PlanType {
  return typeof value === "string" && planTypes.includes(value as PlanType);
}

function parseMonthlyFee(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value.toString();
  }

  if (typeof value === "string" && /^\d+(?:\.\d{1,2})?$/.test(value.trim())) {
    return value.trim();
  }

  return null;
}

function parseDurationMonths(value: unknown) {
  if (value === undefined) return 1;
  if (typeof value === "number" && Number.isInteger(value) && value > 0 && value <= 120) return value;
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    const months = Number(value.trim());
    if (months > 0 && months <= 120) return months;
  }
  return null;
}

export async function GET() {
  const auth = await requirePermission("plans:read");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const plans = await prisma.plan.findMany({
    where: { gymId: session.activeGym.id },
    orderBy: { name: "asc" },
    select: { id: true, code: true, name: true, type: true, standardMonthlyFee: true, durationMonths: true, requiresTrainer: true, isActive: true },
  });

  return NextResponse.json({ plans });
}

export async function POST(request: Request) {
  const auth = await requirePermission("plans:manage");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  let body: CreatePlanBody;
  try {
    const payload: unknown = await request.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
    }
    body = payload as CreatePlanBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const monthlyFee = parseMonthlyFee(body.standardMonthlyFee);
  const durationMonths = parseDurationMonths(body.durationMonths);
  const requiresTrainer = body.requiresTrainer ?? false;
  const isActive = body.isActive ?? true;

  if (!code || !name || !isPlanType(body.type) || monthlyFee === null || durationMonths === null) {
    return NextResponse.json(
      { error: "code, name, type (GT or PT), a positive durationMonths, and a non-negative standardMonthlyFee are required." },
      { status: 400 },
    );
  }

  if (typeof isActive !== "boolean") {
    return NextResponse.json({ error: "isActive must be a boolean." }, { status: 400 });
  }
  if (typeof requiresTrainer !== "boolean") {
    return NextResponse.json({ error: "requiresTrainer must be a boolean." }, { status: 400 });
  }

  try {
    const plan = await prisma.plan.create({
      data: {
        gymId: session.activeGym.id,
        code,
        name,
        type: body.type,
        standardMonthlyFee: monthlyFee,
        durationMonths,
        requiresTrainer,
        isActive,
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "A plan with this code already exists for this gym." }, { status: 409 });
    }

    throw error;
  }
}
