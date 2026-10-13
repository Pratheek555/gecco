export const leadStatuses = [
  "NEW",
  "CONTACTED",
  "TRIAL_BOOKED",
  "TRIAL_COMPLETED",
  "WON",
  "LOST",
] as const;

export const leadSources = [
  "WALK_IN",
  "REFERRAL",
  "INSTAGRAM",
  "FACEBOOK",
  "GOOGLE",
  "WEBSITE",
  "PHONE",
  "OTHER",
] as const;

export const leadActivityTypes = [
  "NOTE",
  "CALL",
  "WHATSAPP",
  "EMAIL",
  "STATUS_CHANGE",
  "FOLLOW_UP",
  "CONVERSION",
  "TRIAL",
  "ASSIGNMENT",
] as const;

export const leadLostReasons = [
  "PRICE",
  "LOCATION",
  "TIMING",
  "JOINED_ELSEWHERE",
  "NO_RESPONSE",
  "NOT_INTERESTED",
  "OTHER",
] as const;

export type LeadStatus = (typeof leadStatuses)[number];
export type LeadSource = (typeof leadSources)[number];
export type LeadActivityType = (typeof leadActivityTypes)[number];
export type LeadLostReason = (typeof leadLostReasons)[number];
export type InterestedPlan = "GT" | "PT" | null;

export type LeadInput = {
  fullName: string;
  phone: string | null;
  email: string | null;
  source: LeadSource;
  interestedPlan: InterestedPlan;
  status: Exclude<LeadStatus, "WON">;
  nextFollowUpAt: Date | null;
  trialAt: Date | null;
  assignedToUserId: string | null;
  lostReasonCode: LeadLostReason | null;
  lostReason: string | null;
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  TRIAL_BOOKED: "Trial booked",
  TRIAL_COMPLETED: "Trial completed",
  WON: "Won",
  LOST: "Lost",
};

type ValidationResult = { ok: true; data: LeadInput } | { ok: false; error: string };

function optionalText(value: unknown) {
  if (value === null || value === undefined) return null;
  return typeof value === "string" ? value.trim() || null : undefined;
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Last 10 digits of a phone number, so "+91 98765 43210" and "098765-43210" match. */
export function phoneKey(phone: string | null) {
  const digits = phone?.replace(/\D/g, "") ?? "";
  return digits.length >= 6 ? digits.slice(-10) : null;
}

/**
 * Parses an optional ISO date field. Returns undefined for an invalid value so
 * callers can report it, and null when the field is empty.
 */
export function optionalDate(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function parseLeadInput(payload: unknown): ValidationResult {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  const body = payload as Record<string, unknown>;
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const phone = optionalText(body.phone);
  const email = optionalText(body.email);
  const source = body.source ?? "OTHER";
  const interestedPlan = body.interestedPlan ?? null;
  const lostReason = optionalText(body.lostReason);

  if (fullName.length < 2 || fullName.length > 100) {
    return { ok: false, error: "Full name must be between 2 and 100 characters." };
  }
  if (phone === undefined || (phone && phone.length > 30)) {
    return { ok: false, error: "Phone must be 30 characters or fewer." };
  }
  if (email === undefined || (email && (email.length > 254 || !validEmail(email)))) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (!phone && !email) {
    return { ok: false, error: "Add at least a phone number or email address." };
  }
  if (typeof source !== "string" || !leadSources.includes(source as LeadSource)) {
    return { ok: false, error: "Select a valid lead source." };
  }
  if (interestedPlan !== null && interestedPlan !== "GT" && interestedPlan !== "PT") {
    return { ok: false, error: "Select a valid plan interest." };
  }
  if (lostReason === undefined || (lostReason && lostReason.length > 500)) {
    return { ok: false, error: "Lost reason must be 500 characters or fewer." };
  }

  const nextFollowUpAt = optionalDate(body.nextFollowUpAt);
  if (nextFollowUpAt === undefined) {
    return { ok: false, error: "Follow-up must be a valid date and time." };
  }
  const trialAt = optionalDate(body.trialAt);
  if (trialAt === undefined) {
    return { ok: false, error: "Trial must be a valid date and time." };
  }

  const status = body.status ?? "NEW";
  if (typeof status !== "string" || !leadStatuses.includes(status as LeadStatus)) {
    return { ok: false, error: "Select a valid lead status." };
  }
  if (status === "WON") {
    return { ok: false, error: "Convert this lead to a member to mark it as won." };
  }

  const assignedToUserId = body.assignedToUserId ?? null;
  if (
    assignedToUserId !== null &&
    (typeof assignedToUserId !== "string" || !uuidPattern.test(assignedToUserId))
  ) {
    return { ok: false, error: "Select a valid lead owner." };
  }

  const lostReasonCode = status === "LOST" ? (body.lostReasonCode ?? null) : null;
  if (status === "LOST" && !leadLostReasons.includes(lostReasonCode as LeadLostReason)) {
    return { ok: false, error: "Select why this lead was lost." };
  }
  if (status === "TRIAL_BOOKED" && !trialAt) {
    return { ok: false, error: "Pick the trial date and time." };
  }
  // Every open lead needs a next step: either a follow-up or an upcoming trial.
  if (status !== "LOST" && !nextFollowUpAt && !(status === "TRIAL_BOOKED" && trialAt)) {
    return { ok: false, error: "Schedule the next follow-up so this lead is not forgotten." };
  }

  return {
    ok: true,
    data: {
      fullName,
      phone,
      email,
      source: source as LeadSource,
      interestedPlan: interestedPlan as InterestedPlan,
      status: status as LeadInput["status"],
      nextFollowUpAt: status === "LOST" ? null : nextFollowUpAt,
      trialAt: status === "TRIAL_BOOKED" || status === "TRIAL_COMPLETED" ? trialAt : null,
      assignedToUserId: assignedToUserId as string | null,
      lostReasonCode: lostReasonCode as LeadLostReason | null,
      lostReason: status === "LOST" ? lostReason : null,
    },
  };
}

export const leadListSelect = {
  id: true,
  fullName: true,
  phone: true,
  email: true,
  source: true,
  status: true,
  interestedPlan: true,
  nextFollowUpAt: true,
  lastContactedAt: true,
  lostReasonCode: true,
  lostReason: true,
  trialAt: true,
  firstContactedAt: true,
  assignedTo: { select: { id: true, fullName: true } },
  convertedAt: true,
  convertedMemberId: true,
  createdAt: true,
  updatedAt: true,
  convertedMember: { select: { id: true, memberNumber: true } },
  _count: { select: { activities: true } },
} as const;

export function serializeLead<
  T extends {
    nextFollowUpAt: Date | null;
    lastContactedAt: Date | null;
    trialAt: Date | null;
    firstContactedAt: Date | null;
    convertedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  },
>(lead: T) {
  return {
    ...lead,
    nextFollowUpAt: lead.nextFollowUpAt?.toISOString() ?? null,
    lastContactedAt: lead.lastContactedAt?.toISOString() ?? null,
    trialAt: lead.trialAt?.toISOString() ?? null,
    firstContactedAt: lead.firstContactedAt?.toISOString() ?? null,
    convertedAt: lead.convertedAt?.toISOString() ?? null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}
