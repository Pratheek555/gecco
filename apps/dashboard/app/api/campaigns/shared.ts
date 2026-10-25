import { leadLostReasons, type LeadLostReason } from "../leads/shared";

export const campaignSegments = [
  "EXPIRING_SOON",
  "EXPIRED_NOT_RENEWED",
  "DUES_OUTSTANDING",
  "PT_UPSELL",
  "ACTIVE_MEMBERS",
  "LOST_LEADS",
  "TRIALS_NOT_CONVERTED",
] as const;

export type CampaignSegment = (typeof campaignSegments)[number];

export const recipientStatuses = ["PENDING", "SENT", "SKIPPED", "OPTED_OUT"] as const;
export type RecipientStatus = (typeof recipientStatuses)[number];

/** What a recipient has to do after the message for the campaign to count them as converted. */
export type CampaignGoal = "membership" | "pt" | "payment" | "lead";

export type SegmentParams = { days?: number; reasons?: LeadLostReason[] };

type SegmentMeta = {
  label: string;
  description: string;
  audience: "members" | "leads";
  goal: CampaignGoal;
  goalLabel: string;
  days?: { label: string; default: number; max: number };
  reasons?: boolean;
  variables: readonly string[];
  template: string;
};

export const commonVariables = ["name", "fullName", "gymName"] as const;

export const variableLabels: Record<string, string> = {
  name: "First name",
  fullName: "Full name",
  gymName: "Gym name",
  planName: "Plan",
  endDate: "End date",
  daysLeft: "Days left",
  dueAmount: "Amount due",
};

export const segmentMeta: Record<CampaignSegment, SegmentMeta> = {
  EXPIRING_SOON: {
    label: "Expiring soon",
    description: "Members whose plan ends soon and who have not renewed yet.",
    audience: "members",
    goal: "membership",
    goalLabel: "Renewed",
    days: { label: "Ending within (days)", default: 7, max: 60 },
    variables: ["planName", "endDate", "daysLeft"],
    template:
      "Hi {{name}}, your {{planName}} membership at {{gymName}} ends on {{endDate}}. Renew before then to keep your progress going. Reply here and we will set it up for you.",
  },
  EXPIRED_NOT_RENEWED: {
    label: "Expired, not renewed",
    description: "Former members whose last plan ended recently. Win them back.",
    audience: "members",
    goal: "membership",
    goalLabel: "Came back",
    days: { label: "Ended in the last (days)", default: 30, max: 365 },
    variables: ["planName", "endDate"],
    template:
      "Hi {{name}}, we have missed you at {{gymName}}! Your {{planName}} membership ended on {{endDate}}. Come back this week and we will help you pick up where you left off.",
  },
  DUES_OUTSTANDING: {
    label: "Dues outstanding",
    description: "Members with an unpaid balance on their memberships.",
    audience: "members",
    goal: "payment",
    goalLabel: "Paid",
    variables: ["dueAmount"],
    template:
      "Hi {{name}}, a gentle reminder from {{gymName}}: {{dueAmount}} is pending on your membership. You can pay at the front desk or reply here for payment details. Thank you!",
  },
  PT_UPSELL: {
    label: "Personal training upsell",
    description: "Active members on general training without a personal training plan.",
    audience: "members",
    goal: "pt",
    goalLabel: "Took PT",
    variables: ["planName"],
    template:
      "Hi {{name}}, want faster results? Our personal trainers at {{gymName}} can build a plan around your goals. Reply YES and we will book you a free intro session.",
  },
  ACTIVE_MEMBERS: {
    label: "All active members",
    description: "Everyone with a current membership. For announcements and offers.",
    audience: "members",
    goal: "payment",
    goalLabel: "Paid",
    variables: ["planName", "endDate"],
    template: "Hi {{name}}, a quick update from {{gymName}}: ",
  },
  LOST_LEADS: {
    label: "Lost leads",
    description: "Enquiries marked lost recently. Filter by why they did not join.",
    audience: "leads",
    goal: "lead",
    goalLabel: "Joined",
    days: { label: "Lost in the last (days)", default: 90, max: 365 },
    reasons: true,
    variables: [],
    template:
      "Hi {{name}}, it is {{gymName}} here. We would still love to help you get started. Reply here and we will share this month's joining offer.",
  },
  TRIALS_NOT_CONVERTED: {
    label: "Trials not converted",
    description: "Leads who had a trial session but have not joined.",
    audience: "leads",
    goal: "lead",
    goalLabel: "Joined",
    days: { label: "Trial in the last (days)", default: 30, max: 365 },
    variables: [],
    template:
      "Hi {{name}}, thanks for trying a session at {{gymName}}! How did it feel? Reply here and we will help you pick the right plan to continue.",
  },
};

export function segmentVariables(segment: CampaignSegment) {
  return [...commonVariables, ...segmentMeta[segment].variables];
}

const variablePattern = /\{\{\s*([a-zA-Z]+)\s*\}\}/g;

export function templateVariables(template: string) {
  return [...new Set([...template.matchAll(variablePattern)].map((match) => match[1]))];
}

export function renderMessage(template: string, variables: Record<string, string>) {
  return template.replace(variablePattern, (_, key: string) => variables[key] ?? "");
}

/**
 * Digits-only WhatsApp number with country code, as wa.me expects. Local
 * 10-digit numbers get the default country code (India); numbers written
 * with + or 00 are taken as already international.
 */
export function whatsappNumber(raw: string | null | undefined, defaultCountryCode = "91") {
  if (!raw) return null;
  const trimmed = raw.trim();
  let digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+")) {
    // Already international.
  } else if (digits.startsWith("00")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = defaultCountryCode + digits.slice(1);
  } else if (digits.length === 10) {
    digits = defaultCountryCode + digits;
  }
  return digits.length >= 11 && digits.length <= 15 ? digits : null;
}

export function whatsappLink(phone: string, message: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export const MAX_RECIPIENTS = 500;
export const MAX_MESSAGE_LENGTH = 1_000;

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export function isCampaignSegment(value: unknown): value is CampaignSegment {
  return typeof value === "string" && (campaignSegments as readonly string[]).includes(value);
}

export function parseSegmentParams(segment: CampaignSegment, value: unknown): Result<SegmentParams> {
  const meta = segmentMeta[segment];
  const input = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const params: SegmentParams = {};

  if (meta.days) {
    const days = input.days === undefined ? meta.days.default : input.days;
    if (typeof days !== "number" || !Number.isInteger(days) || days < 1 || days > meta.days.max) {
      return { ok: false, error: `Days must be a whole number between 1 and ${meta.days.max}.` };
    }
    params.days = days;
  }

  if (meta.reasons && input.reasons !== undefined) {
    if (
      !Array.isArray(input.reasons) ||
      !input.reasons.every((reason) => (leadLostReasons as readonly unknown[]).includes(reason))
    ) {
      return { ok: false, error: "Select valid lost reasons." };
    }
    if (input.reasons.length) params.reasons = [...new Set(input.reasons as LeadLostReason[])];
  }

  return { ok: true, data: params };
}

export function validateTemplate(segment: CampaignSegment, template: string): string | null {
  if (!template.trim()) return "Write the message to send.";
  if (template.length > MAX_MESSAGE_LENGTH) {
    return `Message must be ${MAX_MESSAGE_LENGTH.toLocaleString("en-IN")} characters or fewer.`;
  }
  const allowed = new Set<string>(segmentVariables(segment));
  const unknown = templateVariables(template).filter((name) => !allowed.has(name));
  if (unknown.length) {
    return `This audience has no ${unknown.map((name) => `{{${name}}}`).join(", ")} to fill in.`;
  }
  return null;
}

export type CampaignInput = {
  name: string;
  segment: CampaignSegment;
  params: SegmentParams;
  messageTemplate: string;
  attributionDays: number;
};

export function parseCampaignInput(value: unknown): Result<CampaignInput> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "Request body must be a JSON object." };
  }
  const body = value as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length < 2 || name.length > 120) {
    return { ok: false, error: "Campaign name must be between 2 and 120 characters." };
  }
  if (!isCampaignSegment(body.segment)) return { ok: false, error: "Select an audience." };
  const params = parseSegmentParams(body.segment, body.params);
  if (!params.ok) return params;
  const messageTemplate = typeof body.messageTemplate === "string" ? body.messageTemplate.trim() : "";
  const templateError = validateTemplate(body.segment, messageTemplate);
  if (templateError) return { ok: false, error: templateError };
  const attributionDays = body.attributionDays === undefined ? 7 : body.attributionDays;
  if (
    typeof attributionDays !== "number" ||
    !Number.isInteger(attributionDays) ||
    attributionDays < 1 ||
    attributionDays > 60
  ) {
    return { ok: false, error: "Results window must be between 1 and 60 days." };
  }
  return {
    ok: true,
    data: { name, segment: body.segment, params: params.data, messageTemplate, attributionDays },
  };
}

export type AttributionEvent = { at: Date; amount?: number; kind: "payment" | "membership" | "pt" | "lead" };

/**
 * Credits a sent message with what the recipient did within the window:
 * revenue is every successful payment, conversion depends on the goal.
 */
export function attribute(
  sentAt: Date,
  attributionDays: number,
  goal: CampaignGoal,
  events: readonly AttributionEvent[],
) {
  const end = sentAt.getTime() + attributionDays * 86_400_000;
  const inWindow = events.filter((event) => event.at.getTime() >= sentAt.getTime() && event.at.getTime() <= end);
  const revenue = inWindow.reduce((sum, event) => sum + (event.kind === "payment" ? (event.amount ?? 0) : 0), 0);
  const converted = inWindow.some((event) =>
    goal === "membership" ? event.kind === "membership" || event.kind === "pt" : event.kind === goal,
  );
  return { converted, revenue };
}
