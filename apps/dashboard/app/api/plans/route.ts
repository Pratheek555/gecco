import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { getSession } from "@/app/api/auth/session";

export const runtime = "nodejs";

const planTypes = ["GT", "PT"] as const;
type PlanType = (typeof planTypes)[number];

type CreatePlanBody = {
  code?: unknown;
  name?: unknown;
  type?: unknown;
  standardMonthlyFee?: unknown;
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

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const plans = await prisma.plan.findMany({
    where: { gymId: session.activeGym.id },
    orderBy: { name: "asc" },
    select: { id: true, code: true, name: true, type: true, standardMonthlyFee: true, isActive: true },
  });

  return NextResponse.json({ plans });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

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
  const isActive = body.isActive ?? true;

  if (!code || !name || !isPlanType(body.type) || monthlyFee === null) {
    return NextResponse.json(
      { error: "code, name, type (GT or PT), and a non-negative standardMonthlyFee are required." },
      { status: 400 },
    );
  }

  if (typeof isActive !== "boolean") {
    return NextResponse.json({ error: "isActive must be a boolean." }, { status: 400 });
  }

  try {
    const plan = await prisma.plan.create({
      data: {
        gymId: session.activeGym.id,
        code,
        name,
        type: body.type,
        standardMonthlyFee: monthlyFee,
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
