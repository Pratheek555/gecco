import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { requirePermission } from "@/app/api/auth/authorization";

type IncentiveBody = {
  percentage?: unknown;
  effectiveMonth?: unknown;
};

function parsePercentage(value: unknown) {
  const normalized = typeof value === "number" ? value.toString() : value;
  if (typeof normalized !== "string" || !/^\d{1,3}(?:\.\d{1,2})?$/.test(normalized.trim())) {
    return null;
  }

  const percentage = Number(normalized);
  return percentage >= 0 && percentage <= 100 ? percentage.toFixed(2) : null;
}

function parseEffectiveMonth(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}-01T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 7) !== value ? null : date;
}

function previousDay(date: Date) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() - 1);
  return result;
}

export async function POST(
  request: Request,
  context: RouteContext<"/api/trainers/[trainerid]/incentives">,
) {
  const auth = await requirePermission("trainer-incentives:manage");
  if (!auth.ok) return auth.response;

  const { trainerid: trainerId } = await context.params;
  let body: IncentiveBody;
  try {
    const payload: unknown = await request.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
    }
    body = payload as IncentiveBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const percentage = parsePercentage(body.percentage);
  const startsOn = parseEffectiveMonth(body.effectiveMonth);
  if (percentage === null || startsOn === null) {
    return NextResponse.json(
      { error: "percentage must be between 0 and 100, and effectiveMonth must use YYYY-MM." },
      { status: 400 },
    );
  }

  const trainer = await prisma.trainer.findFirst({
    where: { id: trainerId, gymId: auth.session.activeGym.id },
    select: { id: true },
  });
  if (!trainer) return NextResponse.json({ error: "Trainer not found." }, { status: 404 });

  const rule = await prisma.$transaction(async (tx) => {
    const [previous, next] = await Promise.all([
      tx.trainerIncentiveRule.findFirst({
        where: { trainerId: trainer.id, startsOn: { lt: startsOn } },
        orderBy: { startsOn: "desc" },
        select: { id: true, endsOn: true },
      }),
      tx.trainerIncentiveRule.findFirst({
        where: { trainerId: trainer.id, startsOn: { gt: startsOn } },
        orderBy: { startsOn: "asc" },
        select: { startsOn: true },
      }),
    ]);

    if (previous && (previous.endsOn === null || previous.endsOn >= startsOn)) {
      await tx.trainerIncentiveRule.update({
        where: { id: previous.id },
        data: { endsOn: previousDay(startsOn) },
      });
    }

    return tx.trainerIncentiveRule.upsert({
      where: { trainerId_startsOn: { trainerId: trainer.id, startsOn } },
      create: {
        trainerId: trainer.id,
        percentage,
        startsOn,
        endsOn: next ? previousDay(next.startsOn) : null,
      },
      update: {
        percentage,
        endsOn: next ? previousDay(next.startsOn) : null,
      },
    });
  });

  return NextResponse.json({
    rule: {
      id: rule.id,
      percentage: rule.percentage.toString(),
      startsOn: rule.startsOn.toISOString().slice(0, 10),
      endsOn: rule.endsOn?.toISOString().slice(0, 10) ?? null,
    },
  });
}
