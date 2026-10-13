import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { requirePermission } from "@/app/api/auth/authorization";
import { leadListSelect, optionalDate, serializeLead } from "../../shared";

const actions = ["book", "attended", "no_show"] as const;
type TrialAction = (typeof actions)[number];

export async function POST(request: Request, context: RouteContext<"/api/leads/[leadid]/trial">) {
  const auth = await requirePermission("leads:write");
  if (!auth.ok) return auth.response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const action = body.action as TrialAction;
  if (!actions.includes(action)) {
    return NextResponse.json({ error: "Select a valid trial action." }, { status: 400 });
  }
  const trialAt = optionalDate(body.trialAt);
  const nextFollowUpAt = optionalDate(body.nextFollowUpAt);
  if (trialAt === undefined || nextFollowUpAt === undefined) {
    return NextResponse.json(
      { error: "Dates must be valid date and time values." },
      { status: 400 },
    );
  }
  if (action === "book" && !trialAt) {
    return NextResponse.json({ error: "Pick the trial date and time." }, { status: 400 });
  }
  if (action === "attended" && !nextFollowUpAt) {
    return NextResponse.json(
      { error: "Schedule the post-trial follow-up so this lead is not forgotten." },
      { status: 400 },
    );
  }

  const { leadid: leadId } = await context.params;
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, gymId: auth.session.activeGym.id },
    select: { id: true, status: true, trialAt: true, firstContactedAt: true },
  });
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  if (lead.status === "WON") {
    return NextResponse.json({ error: "This lead is already a member." }, { status: 409 });
  }
  if (action !== "book" && lead.status !== "TRIAL_BOOKED") {
    return NextResponse.json({ error: "This lead does not have a booked trial." }, { status: 409 });
  }

  const now = new Date();
  const format = (date: Date) =>
    date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: auth.session.activeGym.timezone,
    });

  const change =
    action === "book"
      ? {
          data: {
            status: "TRIAL_BOOKED" as const,
            trialAt,
            // The trial itself is the next step; a follow-up is only kept if one was given.
            nextFollowUpAt,
            lostReasonCode: null,
            lostReason: null,
            lastContactedAt: now,
            firstContactedAt: lead.firstContactedAt ? undefined : now,
          },
          activity: `${lead.status === "TRIAL_BOOKED" ? "Trial rescheduled" : "Trial booked"} for ${format(trialAt!)}.`,
        }
      : action === "attended"
        ? {
            data: { status: "TRIAL_COMPLETED" as const, nextFollowUpAt },
            activity: `Attended the trial. Post-trial follow-up set for ${format(nextFollowUpAt!)}.`,
          }
        : {
            // A missed trial goes back to Contacted and is due for a call right away.
            data: {
              status: "CONTACTED" as const,
              trialAt: null,
              nextFollowUpAt: nextFollowUpAt ?? now,
            },
            activity: `Missed the trial${lead.trialAt ? ` scheduled for ${format(lead.trialAt)}` : ""}.`,
          };

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.lead.update({
      where: { id: lead.id },
      data: change.data,
      select: leadListSelect,
    });
    await tx.leadActivity.create({
      data: {
        leadId: lead.id,
        type: "TRIAL",
        body: change.activity,
        createdByUserId: auth.session.user.id,
      },
    });
    return result;
  });

  return NextResponse.json(serializeLead(updated));
}
