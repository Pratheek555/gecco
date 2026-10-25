import { prisma } from "db/client";
import {
  attribute,
  segmentMeta,
  whatsappNumber,
  type AttributionEvent,
  type CampaignSegment,
  type SegmentParams,
} from "./shared";

type Gym = { id: string; name: string; timezone: string };

export type AudienceRecipient = {
  memberId: string | null;
  leadId: string | null;
  fullName: string;
  phone: string;
  variables: Record<string, string>;
};

export type Audience = {
  recipients: AudienceRecipient[];
  /** Matched the segment but have no usable WhatsApp/phone number. */
  missingPhone: number;
  /** Matched the segment but asked not to be messaged. */
  optedOut: number;
};

const DAY = 86_400_000;

const shortDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** The gym's calendar date as UTC midnight, matching how @db.Date columns are read. */
function gymToday(timezone: string) {
  const key = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return new Date(`${key}T00:00:00.000Z`);
}

const contactSelect = {
  where: { kind: { in: ["WHATSAPP" as const, "PHONE" as const] } },
  select: { kind: true, value: true, isPrimary: true },
};

/** WhatsApp contacts first, then the primary phone, then any phone. */
function memberPhone(contacts: { kind: string; value: string; isPrimary: boolean }[]) {
  const ranked = [...contacts].sort(
    (left, right) =>
      Number(right.kind === "WHATSAPP") - Number(left.kind === "WHATSAPP") ||
      Number(right.isPrimary) - Number(left.isPrimary),
  );
  for (const contact of ranked) {
    const phone = whatsappNumber(contact.value);
    if (phone) return phone;
  }
  return null;
}

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

type Candidate = {
  memberId?: string;
  leadId?: string;
  fullName: string;
  phone: string | null;
  optedOut: boolean;
  variables: Record<string, string>;
};

function collect(gym: Gym, candidates: Candidate[]): Audience {
  const audience: Audience = { recipients: [], missingPhone: 0, optedOut: 0 };
  for (const candidate of candidates) {
    if (candidate.optedOut) audience.optedOut += 1;
    else if (!candidate.phone) audience.missingPhone += 1;
    else {
      audience.recipients.push({
        memberId: candidate.memberId ?? null,
        leadId: candidate.leadId ?? null,
        fullName: candidate.fullName,
        phone: candidate.phone,
        variables: {
          name: firstName(candidate.fullName),
          fullName: candidate.fullName,
          gymName: gym.name,
          ...candidate.variables,
        },
      });
    }
  }
  audience.recipients.sort((left, right) => left.fullName.localeCompare(right.fullName));
  return audience;
}

const memberSelect = {
  id: true,
  fullName: true,
  messagingOptOutAt: true,
  contacts: contactSelect,
} as const;

function memberCandidate(
  member: { id: string; fullName: string; messagingOptOutAt: Date | null; contacts: { kind: string; value: string; isPrimary: boolean }[] },
  variables: Record<string, string>,
): Candidate {
  return {
    memberId: member.id,
    fullName: member.fullName,
    phone: memberPhone(member.contacts),
    optedOut: Boolean(member.messagingOptOutAt),
    variables,
  };
}

/** Resolves a segment to the people it currently matches. */
export async function resolveAudience(gym: Gym, segment: CampaignSegment, params: SegmentParams): Promise<Audience> {
  const today = gymToday(gym.timezone);
  const days = params.days ?? segmentMeta[segment].days?.default ?? 0;
  const activeMember = { gymId: gym.id, status: "ACTIVE" as const };
  const current = { status: "ACTIVE" as const, startsOn: { lte: today }, endsOn: { gte: today } };

  switch (segment) {
    case "EXPIRING_SOON": {
      const until = new Date(today.getTime() + days * DAY);
      const members = await prisma.member.findMany({
        where: { ...activeMember, memberships: { some: { status: "ACTIVE", endsOn: { gte: today, lte: until } } } },
        select: {
          ...memberSelect,
          memberships: {
            where: { status: { not: "CANCELLED" }, endsOn: { gte: today } },
            orderBy: { endsOn: "asc" },
            select: { endsOn: true, status: true, planTypeSnapshot: true, plan: { select: { name: true } } },
          },
        },
      });
      return collect(
        gym,
        members.flatMap((member) => {
          // A later membership of the same type means they already renewed.
          const expiring = member.memberships.find(
            (membership) =>
              membership.status === "ACTIVE" &&
              membership.endsOn <= until &&
              !member.memberships.some(
                (other) => other.planTypeSnapshot === membership.planTypeSnapshot && other.endsOn > membership.endsOn,
              ),
          );
          if (!expiring) return [];
          const daysLeft = Math.round((expiring.endsOn.getTime() - today.getTime()) / DAY);
          return [
            memberCandidate(member, {
              planName: expiring.plan.name,
              endDate: shortDate.format(expiring.endsOn),
              daysLeft: String(daysLeft),
            }),
          ];
        }),
      );
    }

    case "EXPIRED_NOT_RENEWED": {
      const since = new Date(today.getTime() - days * DAY);
      const members = await prisma.member.findMany({
        where: {
          ...activeMember,
          memberships: {
            some: { status: { not: "CANCELLED" }, endsOn: { gte: since, lt: today } },
            none: { status: { not: "CANCELLED" }, endsOn: { gte: today } },
          },
        },
        select: {
          ...memberSelect,
          memberships: {
            where: { status: { not: "CANCELLED" }, endsOn: { lt: today } },
            orderBy: { endsOn: "desc" },
            take: 1,
            select: { endsOn: true, plan: { select: { name: true } } },
          },
        },
      });
      return collect(
        gym,
        members.map((member) => {
          const last = member.memberships[0];
          return memberCandidate(member, {
            planName: last?.plan.name ?? "",
            endDate: last ? shortDate.format(last.endsOn) : "",
          });
        }),
      );
    }

    case "DUES_OUTSTANDING": {
      const balances = await prisma.memberBalanceSummary.findMany({
        where: { gymId: gym.id, totalOutstanding: { gt: 0 } },
        select: { memberId: true, totalOutstanding: true },
      });
      const due = new Map(balances.map((balance) => [balance.memberId, Number(balance.totalOutstanding)]));
      const members = await prisma.member.findMany({
        where: { ...activeMember, id: { in: [...due.keys()] } },
        select: memberSelect,
      });
      return collect(
        gym,
        members.map((member) => memberCandidate(member, { dueAmount: rupees.format(due.get(member.id) ?? 0) })),
      );
    }

    case "PT_UPSELL": {
      const members = await prisma.member.findMany({
        where: {
          ...activeMember,
          AND: [
            { memberships: { some: { ...current, planTypeSnapshot: "GT" } } },
            { memberships: { none: { status: "ACTIVE", planTypeSnapshot: "PT", endsOn: { gte: today } } } },
          ],
        },
        select: {
          ...memberSelect,
          memberships: {
            where: { ...current, planTypeSnapshot: "GT" },
            take: 1,
            select: { plan: { select: { name: true } } },
          },
        },
      });
      return collect(
        gym,
        members.map((member) => memberCandidate(member, { planName: member.memberships[0]?.plan.name ?? "" })),
      );
    }

    case "ACTIVE_MEMBERS": {
      const members = await prisma.member.findMany({
        where: { ...activeMember, memberships: { some: current } },
        select: {
          ...memberSelect,
          memberships: {
            where: current,
            orderBy: [{ planTypeSnapshot: "asc" }, { endsOn: "asc" }],
            take: 1,
            select: { endsOn: true, plan: { select: { name: true } } },
          },
        },
      });
      return collect(
        gym,
        members.map((member) => {
          const membership = member.memberships[0];
          return memberCandidate(member, {
            planName: membership?.plan.name ?? "",
            endDate: membership ? shortDate.format(membership.endsOn) : "",
          });
        }),
      );
    }

    case "LOST_LEADS":
    case "TRIALS_NOT_CONVERTED": {
      const since = new Date(Date.now() - days * DAY);
      const leads = await prisma.lead.findMany({
        where:
          segment === "LOST_LEADS"
            ? {
                gymId: gym.id,
                status: "LOST",
                convertedMemberId: null,
                updatedAt: { gte: since },
                ...(params.reasons?.length ? { lostReasonCode: { in: params.reasons } } : {}),
              }
            : {
                gymId: gym.id,
                convertedMemberId: null,
                OR: [
                  { status: "TRIAL_COMPLETED", OR: [{ trialAt: { gte: since } }, { trialAt: null, updatedAt: { gte: since } }] },
                  { status: "TRIAL_BOOKED", trialAt: { gte: since, lt: new Date() } },
                ],
              },
        select: { id: true, fullName: true, phone: true, messagingOptOutAt: true },
      });
      return collect(
        gym,
        leads.map((lead) => ({
          leadId: lead.id,
          fullName: lead.fullName,
          phone: whatsappNumber(lead.phone),
          optedOut: Boolean(lead.messagingOptOutAt),
          variables: {},
        })),
      );
    }
  }
}

type AttributableRecipient = {
  id: string;
  memberId: string | null;
  leadId: string | null;
  status: string;
  sentAt: Date | null;
};

type AttributableCampaign = {
  segment: CampaignSegment;
  attributionDays: number;
  recipients: AttributableRecipient[];
};

/** Conversion and revenue for every sent recipient, keyed by recipient id. */
export async function loadAttribution(gymId: string, campaigns: AttributableCampaign[]) {
  const sent = campaigns.flatMap((campaign) =>
    campaign.recipients.filter((recipient) => recipient.status === "SENT" && recipient.sentAt),
  );
  const results = new Map<string, { converted: boolean; revenue: number }>();
  if (!sent.length) return results;

  const since = new Date(Math.min(...sent.map((recipient) => recipient.sentAt!.getTime())));
  const leadIds = [...new Set(sent.flatMap((recipient) => (recipient.leadId ? [recipient.leadId] : [])))];
  const leads = leadIds.length
    ? await prisma.lead.findMany({
        where: { gymId, id: { in: leadIds } },
        select: { id: true, convertedAt: true, convertedMemberId: true },
      })
    : [];
  const leadById = new Map(leads.map((lead) => [lead.id, lead]));
  const memberIds = [
    ...new Set([
      ...sent.flatMap((recipient) => (recipient.memberId ? [recipient.memberId] : [])),
      ...leads.flatMap((lead) => (lead.convertedMemberId ? [lead.convertedMemberId] : [])),
    ]),
  ];

  const [payments, memberships] = memberIds.length
    ? await Promise.all([
        prisma.payment.findMany({
          where: { gymId, memberId: { in: memberIds }, status: "SUCCEEDED", createdAt: { gte: since } },
          select: { memberId: true, amount: true, createdAt: true },
        }),
        prisma.membership.findMany({
          where: { memberId: { in: memberIds }, status: { not: "CANCELLED" }, createdAt: { gte: since } },
          select: { memberId: true, planTypeSnapshot: true, createdAt: true },
        }),
      ])
    : [[], []];

  const events = new Map<string, AttributionEvent[]>();
  const push = (memberId: string, event: AttributionEvent) =>
    events.set(memberId, [...(events.get(memberId) ?? []), event]);
  for (const payment of payments) {
    push(payment.memberId, { kind: "payment", at: payment.createdAt, amount: Number(payment.amount) });
  }
  for (const membership of memberships) {
    push(membership.memberId, {
      kind: membership.planTypeSnapshot === "PT" ? "pt" : "membership",
      at: membership.createdAt,
    });
  }

  for (const campaign of campaigns) {
    const goal = segmentMeta[campaign.segment].goal;
    for (const recipient of campaign.recipients) {
      if (recipient.status !== "SENT" || !recipient.sentAt) continue;
      let memberEvents: AttributionEvent[] = [];
      if (recipient.memberId) memberEvents = events.get(recipient.memberId) ?? [];
      else if (recipient.leadId) {
        const lead = leadById.get(recipient.leadId);
        if (lead?.convertedAt) memberEvents.push({ kind: "lead", at: lead.convertedAt });
        if (lead?.convertedMemberId) {
          memberEvents.push(...(events.get(lead.convertedMemberId) ?? []).filter((event) => event.kind === "payment"));
        }
      }
      results.set(recipient.id, attribute(recipient.sentAt, campaign.attributionDays, goal, memberEvents));
    }
  }
  return results;
}

export function summarizeCampaign(
  recipients: AttributableRecipient[],
  attribution: Map<string, { converted: boolean; revenue: number }>,
) {
  const count = (status: string) => recipients.filter((recipient) => recipient.status === status).length;
  let converted = 0;
  let revenue = 0;
  for (const recipient of recipients) {
    const result = attribution.get(recipient.id);
    if (!result) continue;
    if (result.converted) converted += 1;
    revenue += result.revenue;
  }
  return {
    total: recipients.length,
    pending: count("PENDING"),
    sent: count("SENT"),
    skipped: count("SKIPPED"),
    optedOut: count("OPTED_OUT"),
    converted,
    revenue: revenue.toFixed(2),
  };
}
