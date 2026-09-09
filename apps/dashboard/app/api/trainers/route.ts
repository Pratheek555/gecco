import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { requirePermission } from "@/app/api/auth/authorization";
import { revenueByMonth, trailingMonthKeys } from "@/app/lib/trainer-revenue";

type CreateTrainerBody = {
  fullName?: unknown;
  isActive?: unknown;
};

type TrainerAssignment = {
  startsOn: Date;
  endsOn: Date | null;
  membership: {
    memberId: string;
    status: string;
    trainerRevenueEligibleSnapshot: boolean;
    startsOn: Date;
    agreedFee: unknown;
    durationMonths: number;
    payments: { amount: unknown; paidOn: Date }[];
  };
};

function toTrainerRecord(
  trainer: {
    id: string;
    fullName: string;
    isActive: boolean;
    assignments: TrainerAssignment[];
  },
  revenueMonths: string[] = [],
) {
  const clientIds = new Set(
    trainer.assignments
      .filter((assignment) => assignment.membership.status === "ACTIVE")
      .map((assignment) => assignment.membership.memberId),
  );
  return {
    id: trainer.id,
    fullName: trainer.fullName,
    isActive: trainer.isActive,
    clientCount: clientIds.size,
    assignmentCount: trainer.assignments.length,
    monthlyRevenue: revenueByMonth(trainer.assignments, revenueMonths),
  };
}

const trainerSelect = {
  id: true,
  fullName: true,
  isActive: true,
  assignments: {
    select: {
      membership: {
        select: {
          memberId: true,
          status: true,
          trainerRevenueEligibleSnapshot: true,
          startsOn: true,
          agreedFee: true,
          durationMonths: true,
          payments: {
            where: { status: "SUCCEEDED" as const },
            select: { amount: true, paidOn: true },
          },
        },
      },
      startsOn: true,
      endsOn: true,
    },
  },
} as const;

export async function GET() {
  const auth = await requirePermission("trainers:read");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const trainers = await prisma.trainer.findMany({
    where: { gymId: session.activeGym.id },
    orderBy: { fullName: "asc" },
    select: trainerSelect,
  });

  const revenueMonths = trailingMonthKeys();
  const records = trainers.map((trainer) => toTrainerRecord(trainer, revenueMonths));
  const activeCount = records.filter((trainer) => trainer.isActive).length;
  const totalClients = records.reduce((total, trainer) => total + trainer.clientCount, 0);

  return NextResponse.json({
    trainers: records,
    stats: {
      activeCount,
      inactiveCount: records.length - activeCount,
      totalClients,
      availability: [
        { label: "Active", value: activeCount, tone: "purple" },
        { label: "Inactive", value: records.length - activeCount, tone: "muted" },
      ],
      revenueMonths,
    },
  });
}

export async function POST(request: Request) {
  const auth = await requirePermission("trainers:manage");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  let body: CreateTrainerBody;
  try {
    const payload: unknown = await request.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
    }
    body = payload as CreateTrainerBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const isActive = body.isActive ?? true;

  if (fullName.length < 2 || fullName.length > 100) {
    return NextResponse.json(
      { error: "fullName must be between 2 and 100 characters." },
      { status: 400 },
    );
  }
  if (typeof isActive !== "boolean") {
    return NextResponse.json({ error: "isActive must be a boolean." }, { status: 400 });
  }

  const trainer = await prisma.trainer.create({
    data: { gymId: session.activeGym.id, fullName, isActive },
    select: trainerSelect,
  });

  return NextResponse.json(toTrainerRecord(trainer, trailingMonthKeys()), { status: 201 });
}
