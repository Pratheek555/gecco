import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { requirePermission } from "@/app/api/auth/authorization";
import { leadListSelect, parseLeadInput, serializeLead } from "./shared";

export async function GET() {
  const auth = await requirePermission("leads:read");
  if (!auth.ok) return auth.response;

  const gymId = auth.session.activeGym.id;
  const leads = await prisma.lead.findMany({
    where: { gymId },
    orderBy: [{ nextFollowUpAt: "asc" }, { updatedAt: "desc" }],
    select: leadListSelect,
  });

  const gymDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: auth.session.activeGym.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const today = gymDate.format(new Date());
  const active = leads.filter((lead) => lead.status !== "WON" && lead.status !== "LOST");
  const converted = leads.filter((lead) => lead.status === "WON").length;
  const closed = converted + leads.filter((lead) => lead.status === "LOST").length;

  return NextResponse.json({
    leads: leads.map(serializeLead),
    summary: {
      active: active.length,
      dueToday: active.filter(
        (lead) => lead.nextFollowUpAt && gymDate.format(lead.nextFollowUpAt) === today,
      ).length,
      overdue: active.filter(
        (lead) => lead.nextFollowUpAt && gymDate.format(lead.nextFollowUpAt) < today,
      ).length,
      trials: active.filter(
        (lead) => lead.status === "TRIAL_BOOKED" || lead.status === "TRIAL_COMPLETED",
      ).length,
      converted,
      conversionRate: closed ? Math.round((converted / closed) * 100) : 0,
    },
  });
}

export async function POST(request: Request) {
  const auth = await requirePermission("leads:write");
  if (!auth.ok) return auth.response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = parseLeadInput(payload);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const body = payload as Record<string, unknown>;
  const note = typeof body.note === "string" ? body.note.trim() : "";
  if (note.length > 2_000) {
    return NextResponse.json({ error: "Note must be 2,000 characters or fewer." }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: {
      gymId: auth.session.activeGym.id,
      ...parsed.data,
      activities: {
        create: [
          {
            type: "STATUS_CHANGE",
            body: "Lead added to the pipeline as New.",
            createdByUserId: auth.session.user.id,
          },
          ...(note
            ? [
                {
                  type: "NOTE" as const,
                  body: note,
                  createdByUserId: auth.session.user.id,
                },
              ]
            : []),
        ],
      },
    },
    select: leadListSelect,
  });

  return NextResponse.json(serializeLead(lead), { status: 201 });
}
