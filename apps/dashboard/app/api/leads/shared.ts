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
] as const;

export type LeadStatus = (typeof leadStatuses)[number];
export type LeadSource = (typeof leadSources)[number];
export type LeadActivityType = (typeof leadActivityTypes)[number];
export type InterestedPlan = "GT" | "PT" | null;

export type LeadInput = {
  fullName: string;
  phone: string | null;
  email: string | null;
  source: LeadSource;
  interestedPlan: InterestedPlan;
  nextFollowUpAt: Date | null;
  lostReason: string | null;
};

type ValidationResult = { ok: true; data: LeadInput } | { ok: false; error: string };

function optionalText(value: unknown) {
  if (value === null || value === undefined) return null;
  return typeof value === "string" ? value.trim() || null : undefined;
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

  let nextFollowUpAt: Date | null = null;
  if (
    body.nextFollowUpAt !== null &&
    body.nextFollowUpAt !== undefined &&
    body.nextFollowUpAt !== ""
  ) {
    if (typeof body.nextFollowUpAt !== "string") {
      return { ok: false, error: "Follow-up must be a valid date and time." };
    }
    nextFollowUpAt = new Date(body.nextFollowUpAt);
    if (Number.isNaN(nextFollowUpAt.getTime())) {
      return { ok: false, error: "Follow-up must be a valid date and time." };
    }
  }

  return {
    ok: true,
    data: {
      fullName,
      phone,
      email,
      source: source as LeadSource,
      interestedPlan: interestedPlan as InterestedPlan,
      nextFollowUpAt,
      lostReason,
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
  lostReason: true,
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
    convertedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  },
>(lead: T) {
  return {
    ...lead,
    nextFollowUpAt: lead.nextFollowUpAt?.toISOString() ?? null,
    lastContactedAt: lead.lastContactedAt?.toISOString() ?? null,
    convertedAt: lead.convertedAt?.toISOString() ?? null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
}
