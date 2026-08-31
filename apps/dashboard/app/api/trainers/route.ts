import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { getSession } from "@/app/api/auth/session";

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
    startsOn: Date;
    endsOn: Date;
    payments: { amount: unknown }[];
  };
};

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthKeysBetween(start: Date, end: Date) {
  const keys: string[] = [];
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));

  while (cursor <= last) {
    keys.push(monthKey(cursor));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return keys;
}

function trailingMonthKeys() {
  const now = new Date();
  const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  const keys: string[] = [];

  for (let index = 0; index < 12; index += 1) {
    keys.push(monthKey(cursor));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return keys;
}

function toTrainerRecord(trainer: {
  id: string;
  fullName: string;
  isActive: boolean;
  assignments: TrainerAssignment[];
}, revenueMonths: string[] = []) {
  const clientIds = new Set(trainer.assignments
    .filter((assignment) => assignment.membership.status === "ACTIVE")
    .map((assignment) => assignment.membership.memberId));
  const revenueByMonth = new Map(revenueMonths.map((month) => [month, 0]));

  for (const assignment of trainer.assignments) {
    const membershipMonths = monthKeysBetween(assignment.membership.startsOn, assignment.membership.endsOn);
    const membershipDuration = Math.max(1, membershipMonths.length);
    const monthlyAmount = assignment.membership.payments.reduce((total, payment) => total + Number(payment.amount), 0) / membershipDuration;
    const assignmentStart = assignment.startsOn > assignment.membership.startsOn ? assignment.startsOn : assignment.membership.startsOn;
    const assignmentEnd = assignment.endsOn && assignment.endsOn < assignment.membership.endsOn ? assignment.endsOn : assignment.membership.endsOn;

    for (const month of monthKeysBetween(assignmentStart, assignmentEnd)) {
      if (revenueByMonth.has(month)) revenueByMonth.set(month, (revenueByMonth.get(month) ?? 0) + monthlyAmount);
    }
  }

  return {
    id: trainer.id,
    fullName: trainer.fullName,
    isActive: trainer.isActive,
    clientCount: clientIds.size,
    assignmentCount: trainer.assignments.length,
    monthlyRevenue: revenueMonths.map((month) => ({ month, amount: Number((revenueByMonth.get(month) ?? 0).toFixed(2)) })),
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
          startsOn: true,
          endsOn: true,
          payments: { where: { status: "SUCCEEDED" as const }, select: { amount: true } },
        },
      },
      startsOn: true,
      endsOn: true,
    },
  },
} as const;

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

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
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

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
    return NextResponse.json({ error: "fullName must be between 2 and 100 characters." }, { status: 400 });
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
