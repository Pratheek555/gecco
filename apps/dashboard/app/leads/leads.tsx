"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowRight,
  Ban,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Edit3,
  Flame,
  Footprints,
  Globe,
  Hourglass,
  LayoutList,
  ListTodo,
  LoaderCircle,
  Mail,
  MessageCircle,
  Phone,
  PhoneCall,
  Plus,
  Search,
  Send,
  Sparkles,
  SquareKanban,
  Sun,
  ThumbsUp,
  Timer,
  Trophy,
  UserCheck,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "../_components/managed-page-ui";
import { useDashboardToast } from "../manage-shell";

type LeadStatus = "NEW" | "CONTACTED" | "TRIAL_BOOKED" | "TRIAL_COMPLETED" | "WON" | "LOST";
type LeadSource =
  "WALK_IN" | "REFERRAL" | "INSTAGRAM" | "FACEBOOK" | "GOOGLE" | "WEBSITE" | "PHONE" | "OTHER";
type LostReason =
  "PRICE" | "LOCATION" | "TIMING" | "JOINED_ELSEWHERE" | "NO_RESPONSE" | "NOT_INTERESTED" | "OTHER";
type ActivityType =
  | "NOTE"
  | "CALL"
  | "WHATSAPP"
  | "EMAIL"
  | "STATUS_CHANGE"
  | "FOLLOW_UP"
  | "CONVERSION"
  | "TRIAL"
  | "ASSIGNMENT";
type OutreachType = "NOTE" | "CALL" | "WHATSAPP" | "EMAIL";
type Tone = "red" | "amber" | "violet" | "blue" | "green" | "teal" | "grey";

type Lead = {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  source: LeadSource;
  status: LeadStatus;
  interestedPlan: "GT" | "PT" | null;
  nextFollowUpAt: string | null;
  lastContactedAt: string | null;
  firstContactedAt: string | null;
  trialAt: string | null;
  lostReasonCode: LostReason | null;
  lostReason: string | null;
  convertedAt: string | null;
  convertedMemberId: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo: { id: string; fullName: string } | null;
  convertedMember: { id: string; memberNumber: string } | null;
  _count: { activities: number };
};

type LeadActivity = {
  id: string;
  type: ActivityType;
  body: string;
  createdAt: string;
  createdBy: { fullName: string } | null;
};

type LeadDetail = Lead & { activities: LeadActivity[] };
type TeamMember = { id: string; fullName: string; role: string };
type Duplicate =
  | { kind: "lead"; id: string; fullName: string; status: LeadStatus }
  | { kind: "member"; id: string; fullName: string; memberNumber: string };
type DrawerIntent = "call" | "whatsapp" | null;
type View = "today" | "board" | "list";
type StageFilter = LeadStatus | "ALL" | "OPEN";

const stageMeta: Record<LeadStatus, { label: string; tone: Tone }> = {
  NEW: { label: "New", tone: "blue" },
  CONTACTED: { label: "Contacted", tone: "violet" },
  TRIAL_BOOKED: { label: "Trial booked", tone: "amber" },
  TRIAL_COMPLETED: { label: "Trial done", tone: "teal" },
  WON: { label: "Joined", tone: "green" },
  LOST: { label: "Lost", tone: "grey" },
};

const pipelineStages = ["NEW", "CONTACTED", "TRIAL_BOOKED", "TRIAL_COMPLETED"] as const;

const sourceOptions: { value: LeadSource; label: string; icon: LucideIcon }[] = [
  { value: "WALK_IN", label: "Walk-in", icon: Footprints },
  { value: "REFERRAL", label: "Referral", icon: UserPlus },
  { value: "INSTAGRAM", label: "Instagram", icon: Camera },
  { value: "FACEBOOK", label: "Facebook", icon: ThumbsUp },
  { value: "GOOGLE", label: "Google", icon: Search },
  { value: "WEBSITE", label: "Website", icon: Globe },
  { value: "PHONE", label: "Phone enquiry", icon: Phone },
  { value: "OTHER", label: "Other", icon: Sparkles },
];

const lostReasonOptions: { value: LostReason; label: string }[] = [
  { value: "PRICE", label: "Price too high" },
  { value: "LOCATION", label: "Too far away" },
  { value: "TIMING", label: "Timings don't suit" },
  { value: "JOINED_ELSEWHERE", label: "Joined another gym" },
  { value: "NO_RESPONSE", label: "Stopped responding" },
  { value: "NOT_INTERESTED", label: "Not interested" },
  { value: "OTHER", label: "Other" },
];

const followUpPresets = [
  { key: "1h", label: "In 1 hour" },
  { key: "evening", label: "This evening" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "3d", label: "In 3 days" },
  { key: "week", label: "Next week" },
] as const;

const callOutcomes = ["No answer", "Interested — shared plans", "Asked to call back later"];

type TemplateContext = { name: string; gym: string; trialAt: string | null };
const messageTemplates: {
  key: string;
  label: string;
  when: (lead: Lead) => boolean;
  text: (context: TemplateContext) => string;
}[] = [
  {
    key: "first-reply",
    label: "First reply",
    when: (lead) => lead.status === "NEW" || lead.status === "CONTACTED",
    text: ({ name, gym }) =>
      `Hi ${name}, thanks for reaching out to ${gym}! I'd love to help you get started. When would be a good time to come in for a free trial session?`,
  },
  {
    key: "trial-reminder",
    label: "Trial reminder",
    when: (lead) => lead.status === "TRIAL_BOOKED",
    text: ({ name, gym, trialAt }) =>
      `Hi ${name}, a quick reminder about your trial at ${gym}${trialAt ? ` on ${trialAt}` : ""}. Please bring water and comfortable shoes. See you there!`,
  },
  {
    key: "missed-trial",
    label: "Missed trial",
    when: (lead) => lead.status === "CONTACTED" || lead.status === "TRIAL_BOOKED",
    text: ({ name }) =>
      `Hi ${name}, we missed you at your trial. No worries — would you like to pick another time that works for you?`,
  },
  {
    key: "post-trial",
    label: "After the trial",
    when: (lead) => lead.status === "TRIAL_COMPLETED",
    text: ({ name, gym }) =>
      `Hi ${name}, it was great having you at ${gym}! How did you find the session? I'm happy to help you pick the plan that suits your goals.`,
  },
  {
    key: "check-in",
    label: "Gentle check-in",
    when: () => true,
    text: ({ name, gym }) =>
      `Hi ${name}, checking in from ${gym}. Are you still looking to start training? Let me know if you have any questions.`,
  },
];

const statusLabel = (status: LeadStatus) => stageMeta[status].label;

const sourceOption = (source: LeadSource) =>
  sourceOptions.find((item) => item.value === source) ?? sourceOptions[sourceOptions.length - 1];

const lostReasonLabel = (reason: LostReason | null) =>
  lostReasonOptions.find((item) => item.value === reason)?.label ?? "Lost";

const interestLabel = (plan: Lead["interestedPlan"]) =>
  plan === "PT" ? "Personal training" : plan === "GT" ? "Gym training" : "Plan undecided";

const isOpen = (lead: Lead) => lead.status !== "WON" && lead.status !== "LOST";

async function readJson<T>(response: Response) {
  const text = await response.text();
  if (!text.trim()) throw new Error(`The server returned an empty response (${response.status}).`);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`The server returned an invalid response (${response.status}).`);
  }
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDateTime(value: string | null) {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(
    new Date(value),
  );
}

/** "Today, 6:00 pm", "Tomorrow, 10:00 am", or "17 Oct, 10:00 am". */
function formatWhen(value: string) {
  const date = new Date(value);
  const { start, tomorrow } = dayBounds();
  const dayAfter = new Date(tomorrow.getTime() + 86_400_000);
  const yesterday = new Date(start.getTime() - 86_400_000);
  if (date >= start && date < tomorrow) return `Today, ${formatTime(value)}`;
  if (date >= tomorrow && date < dayAfter) return `Tomorrow, ${formatTime(value)}`;
  if (date >= yesterday && date < start) return `Yesterday, ${formatTime(value)}`;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(
    new Date(value),
  );
}

function duration(minutes: number) {
  if (minutes < 60) return `${Math.max(0, Math.round(minutes))}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${Math.round(minutes % 60)}m`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

function elapsed(value: string) {
  return duration((Date.now() - new Date(value).getTime()) / 60_000);
}

function toLocalInput(value: string | Date | null) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function presetDate(key: (typeof followUpPresets)[number]["key"]) {
  const date = new Date();
  if (key === "1h") {
    date.setMinutes(date.getMinutes() + 60, 0, 0);
    return date;
  }
  if (key === "evening") {
    // 6 PM today, or an hour from now when it is already evening.
    if (date.getHours() >= 17) date.setMinutes(date.getMinutes() + 60, 0, 0);
    else date.setHours(18, 0, 0, 0);
    return date;
  }
  const days = key === "tomorrow" ? 1 : key === "3d" ? 3 : 7;
  date.setDate(date.getDate() + days);
  date.setHours(10, 0, 0, 0);
  return date;
}

function dayBounds() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return { start, tomorrow };
}

function isToday(value: string | null) {
  if (!value) return false;
  const { start, tomorrow } = dayBounds();
  const date = new Date(value);
  return date >= start && date < tomorrow;
}

function followUpState(lead: Lead) {
  if (!lead.nextFollowUpAt || !isOpen(lead)) return "none";
  const due = new Date(lead.nextFollowUpAt);
  const { start, tomorrow } = dayBounds();
  if (due < start) return "overdue";
  if (due < tomorrow) return "today";
  return "upcoming";
}

/** The one thing to do next for a lead, phrased for a busy front desk. */
function nextStep(lead: Lead): { label: string; tone: Tone; icon: LucideIcon } {
  if (lead.status === "WON")
    return {
      label: lead.convertedAt ? `Joined ${formatDay(lead.convertedAt)}` : "Joined",
      tone: "green",
      icon: Trophy,
    };
  if (lead.status === "LOST")
    return { label: lostReasonLabel(lead.lostReasonCode), tone: "grey", icon: Ban };
  if (lead.status === "NEW" && !lead.firstContactedAt)
    return { label: `Reply · waiting ${elapsed(lead.createdAt)}`, tone: "red", icon: Flame };
  if (lead.status === "TRIAL_BOOKED" && lead.trialAt) {
    if (new Date(lead.trialAt) < dayBounds().start)
      return { label: "Trial passed · update it", tone: "amber", icon: CalendarX };
    return { label: `Trial ${formatWhen(lead.trialAt)}`, tone: "violet", icon: CalendarCheck };
  }
  const state = followUpState(lead);
  if (state === "overdue")
    return { label: `Overdue · ${formatWhen(lead.nextFollowUpAt!)}`, tone: "red", icon: Hourglass };
  if (state === "today")
    return { label: formatWhen(lead.nextFollowUpAt!), tone: "amber", icon: CalendarClock };
  if (state === "upcoming")
    return { label: formatWhen(lead.nextFollowUpAt!), tone: "blue", icon: CalendarClock };
  return { label: "No next step", tone: "grey", icon: CalendarClock };
}

/** Lower is more urgent. */
function urgency(lead: Lead) {
  if (!isOpen(lead)) return Number.MAX_SAFE_INTEGER;
  if (lead.status === "NEW" && !lead.firstContactedAt) return new Date(lead.createdAt).getTime() - 1e13;
  const when =
    lead.status === "TRIAL_BOOKED" && lead.trialAt && !lead.nextFollowUpAt
      ? lead.trialAt
      : lead.nextFollowUpAt;
  return when ? new Date(when).getTime() : Number.MAX_SAFE_INTEGER - 1;
}

/** wa.me needs a country code; ten-digit numbers are assumed to be Indian mobiles. */
function whatsappNumber(phone: string | null) {
  const digits = phone?.replace(/\D/g, "") ?? "";
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

function avatarTone(name: string): Tone {
  const tones: Tone[] = ["violet", "blue", "teal", "amber", "green"];
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return tones[hash % tones.length];
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  return (
    <span className={`ld-avatar ${size} tone-${avatarTone(name)}`} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

function StagePill({ status }: { status: LeadStatus }) {
  return (
    <span className={`ld-pill tone-${stageMeta[status].tone}`}>
      <i />
      {statusLabel(status)}
    </span>
  );
}

function NextStepTag({ lead }: { lead: Lead }) {
  const step = nextStep(lead);
  return (
    <span className={`ld-next tone-${step.tone}`}>
      <step.icon size={13} />
      {step.label}
    </span>
  );
}

function SourceTag({ source }: { source: LeadSource }) {
  const option = sourceOption(source);
  return (
    <span className="ld-source">
      <option.icon size={12} />
      {option.label}
    </span>
  );
}

function ChoiceGroup<T extends string>({
  value,
  onChange,
  options,
  disabled,
  label,
  columns,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; icon?: LucideIcon; tone?: Tone }[];
  disabled?: boolean;
  label: string;
  columns?: number;
}) {
  return (
    <div
      className="ld-choices"
      role="radiogroup"
      aria-label={label}
      style={columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
    >
      {options.map((option) => (
        <button
          type="button"
          role="radio"
          aria-checked={value === option.value}
          key={option.value}
          className={`${value === option.value ? "selected" : ""} ${option.tone ? `tone-${option.tone}` : ""}`}
          onClick={() => onChange(option.value)}
          disabled={disabled}
        >
          {option.icon && <option.icon size={14} />}
          {option.tone && <i />}
          {option.label}
        </button>
      ))}
    </div>
  );
}

function FollowUpPicker({
  value,
  onChange,
  disabled,
  label = "Next follow-up",
  required = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
}) {
  return (
    <div className="ld-picker">
      <div className="ld-picker-head">
        <span>{label}</span>
        {value && <strong>{formatWhen(new Date(value).toISOString())}</strong>}
      </div>
      <div className="ld-chip-row">
        {followUpPresets.map((preset) => {
          const presetValue = toLocalInput(presetDate(preset.key));
          return (
            <button
              type="button"
              key={preset.key}
              className={`ld-chip ${value === presetValue ? "selected" : ""}`}
              onClick={() => onChange(presetValue)}
              disabled={disabled}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      <input
        type="datetime-local"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={disabled}
        aria-label={label}
      />
    </div>
  );
}

function DuplicateWarning({ duplicates }: { duplicates: Duplicate[] }) {
  return (
    <div className="ld-duplicate" role="alert">
      <AlertCircle size={17} />
      <div>
        <strong>Looks like this person is already in your gym</strong>
        <ul>
          {duplicates.map((item) => (
            <li key={`${item.kind}-${item.id}`}>
              <Avatar name={item.fullName} size="sm" />
              {item.kind === "member" ? (
                <Link href={`/members?member=${item.id}`} target="_blank">
                  {item.fullName}
                  <small>Member #{item.memberNumber}</small>
                </Link>
              ) : (
                <span>
                  {item.fullName}
                  <small>Lead · {statusLabel(item.status)}</small>
                </span>
              )}
            </li>
          ))}
        </ul>
        <p>Check before adding, or save anyway if this is someone different.</p>
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="ld-form-section">
      <h3>{title}</h3>
      <div className="ld-form-grid">{children}</div>
    </section>
  );
}

function LeadEditor({
  lead,
  team,
  currentUserId,
  close,
  onSaved,
}: {
  lead?: Lead;
  team: TeamMember[];
  currentUserId: string | null;
  close: () => void;
  onSaved: () => Promise<void>;
}) {
  const [fullName, setFullName] = useState(lead?.fullName ?? "");
  const [phone, setPhone] = useState(lead?.phone ?? "");
  const [email, setEmail] = useState(lead?.email ?? "");
  const [source, setSource] = useState<LeadSource>(lead?.source ?? "WALK_IN");
  const [interestedPlan, setInterestedPlan] = useState<"" | "GT" | "PT">(
    lead?.interestedPlan ?? "",
  );
  const [status, setStatus] = useState<LeadStatus>(
    lead?.status === "WON" ? "TRIAL_COMPLETED" : (lead?.status ?? "NEW"),
  );
  const [assignedToUserId, setAssignedToUserId] = useState(
    lead ? (lead.assignedTo?.id ?? "") : (currentUserId ?? ""),
  );
  // New enquiries default to a reply within the hour.
  const [nextFollowUpAt, setNextFollowUpAt] = useState(() =>
    lead ? toLocalInput(lead.nextFollowUpAt) : toLocalInput(presetDate("1h")),
  );
  const [trialAt, setTrialAt] = useState(toLocalInput(lead?.trialAt ?? null));
  const [lostReasonCode, setLostReasonCode] = useState<LostReason | "">(
    lead?.lostReasonCode ?? "",
  );
  const [lostReason, setLostReason] = useState(lead?.lostReason ?? "");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);
  const [saving, setSaving] = useState(false);

  const stageChoices = (
    lead
      ? (["NEW", "CONTACTED", "TRIAL_BOOKED", "TRIAL_COMPLETED", "LOST"] as const)
      : (["NEW", "CONTACTED", "TRIAL_BOOKED"] as const)
  ).map((value) => ({ value, label: stageMeta[value].label, tone: stageMeta[value].tone }));
  const showTrial = status === "TRIAL_BOOKED" || status === "TRIAL_COMPLETED";
  const followUpRequired = status !== "LOST" && !(status === "TRIAL_BOOKED" && trialAt);

  async function save(allowDuplicate: boolean) {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(lead ? `/api/leads/${lead.id}` : "/api/leads", {
        method: lead ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          email,
          source,
          interestedPlan: interestedPlan || null,
          status,
          assignedToUserId: assignedToUserId || null,
          nextFollowUpAt:
            status !== "LOST" && nextFollowUpAt ? new Date(nextFollowUpAt).toISOString() : null,
          trialAt: showTrial && trialAt ? new Date(trialAt).toISOString() : null,
          lostReasonCode: status === "LOST" ? lostReasonCode || null : null,
          lostReason: status === "LOST" ? lostReason : null,
          note,
          allowDuplicate,
        }),
      });
      const result = await readJson<{ error?: string; duplicates?: Duplicate[] }>(response);
      if (response.status === 409 && result.duplicates?.length) {
        setDuplicates(result.duplicates);
        return;
      }
      if (!response.ok)
        throw new Error(result.error ?? `Could not ${lead ? "update" : "add"} lead.`);
      await onSaved();
      close();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save this lead.");
    } finally {
      setSaving(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void save(duplicates.length > 0);
  }

  return (
    <div
      className="modal-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-editor-title"
      onMouseDown={(event) => event.currentTarget === event.target && close()}
    >
      <form className="modal ld-editor" onSubmit={submit}>
        <div className="ld-editor-head">
          <span className="ld-editor-icon">{lead ? <Edit3 size={18} /> : <UserPlus size={18} />}</span>
          <div>
            <h2 id="lead-editor-title">{lead ? `Edit ${lead.fullName}` : "New enquiry"}</h2>
            <p>
              {lead
                ? "Keep contact details and the next step current."
                : "Capture it now — a reply within the hour wins most visits."}
            </p>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={close}
            aria-label="Close"
            disabled={saving}
          >
            <X size={18} />
          </button>
        </div>
        <div className="ld-editor-body">
          <FormSection title="Who is it?">
            <label className="full">
              Full name
              <input
                required
                autoFocus
                minLength={2}
                maxLength={100}
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="e.g. Riya Mehta"
                disabled={saving}
              />
            </label>
            <label>
              Phone
              <input
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setDuplicates([]);
                }}
                maxLength={30}
                inputMode="tel"
                placeholder="98765 43210"
                disabled={saving}
              />
            </label>
            <label>
              Email <span>(optional)</span>
              <input
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setDuplicates([]);
                }}
                type="email"
                maxLength={254}
                placeholder="riya@example.com"
                disabled={saving}
              />
            </label>
          </FormSection>

          <FormSection title="Where did they come from?">
            <div className="full">
              <ChoiceGroup
                label="Source"
                value={source}
                onChange={setSource}
                options={sourceOptions}
                disabled={saving}
                columns={4}
              />
            </div>
            <div className="full ld-field">
              <span className="ld-field-label">Interested in</span>
              <ChoiceGroup
                label="Interested in"
                value={interestedPlan}
                onChange={setInterestedPlan}
                options={[
                  { value: "", label: "Not sure yet" },
                  { value: "GT", label: "Gym training" },
                  { value: "PT", label: "Personal training" },
                ]}
                disabled={saving}
                columns={3}
              />
            </div>
          </FormSection>

          <FormSection title="Next step">
            <div className="full ld-field">
              <span className="ld-field-label">Stage</span>
              <ChoiceGroup
                label="Stage"
                value={status}
                onChange={setStatus}
                options={stageChoices}
                disabled={saving}
                columns={stageChoices.length}
              />
            </div>
            <label className={showTrial ? "" : "full"}>
              Lead owner
              <select
                value={assignedToUserId}
                onChange={(event) => setAssignedToUserId(event.target.value)}
                disabled={saving}
              >
                <option value="">Unassigned</option>
                {team.map((member) => (
                  <option value={member.id} key={member.id}>
                    {member.fullName}
                    {member.id === currentUserId ? " (you)" : ""}
                  </option>
                ))}
              </select>
            </label>
            {showTrial && (
              <label>
                Trial date and time
                <input
                  type="datetime-local"
                  value={trialAt}
                  onChange={(event) => setTrialAt(event.target.value)}
                  required={status === "TRIAL_BOOKED"}
                  disabled={saving}
                />
              </label>
            )}
            {status !== "LOST" && (
              <div className="full">
                <FollowUpPicker
                  value={nextFollowUpAt}
                  onChange={setNextFollowUpAt}
                  required={followUpRequired}
                  disabled={saving}
                  label={followUpRequired ? "Follow up" : "Follow up (optional — the trial is next)"}
                />
              </div>
            )}
            {status === "LOST" && (
              <>
                <div className="full ld-field">
                  <span className="ld-field-label">Why was it lost?</span>
                  <ChoiceGroup
                    label="Lost reason"
                    value={lostReasonCode}
                    onChange={setLostReasonCode}
                    options={lostReasonOptions}
                    disabled={saving}
                    columns={2}
                  />
                </div>
                <label className="full">
                  Details <span>(optional)</span>
                  <textarea
                    value={lostReason}
                    onChange={(event) => setLostReason(event.target.value)}
                    maxLength={500}
                    rows={2}
                    placeholder="Anything that would help win them back later."
                    disabled={saving}
                  />
                </label>
              </>
            )}
          </FormSection>

          {!lead && (
            <FormSection title="Notes">
              <label className="full">
                <span className="sr-only">First note</span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="Goals, preferred timing, questions — anything useful for the next call."
                  disabled={saving}
                />
              </label>
            </FormSection>
          )}
          {duplicates.length > 0 && <DuplicateWarning duplicates={duplicates} />}
          {error && (
            <p className="ld-error" role="alert">
              <AlertCircle size={15} />
              {error}
            </p>
          )}
        </div>
        <div className="ld-editor-foot">
          <span>Phone or email is required.</span>
          <button type="button" className="button secondary" onClick={close} disabled={saving}>
            Cancel
          </button>
          <button
            className="button primary"
            type="submit"
            disabled={saving || (status === "LOST" && !lostReasonCode)}
          >
            {saving
              ? "Saving…"
              : duplicates.length
                ? "Save anyway"
                : lead
                  ? "Save changes"
                  : "Add lead"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Stepper({ status }: { status: LeadStatus }) {
  const steps = ["New", "Contacted", "Trial", "Joined"];
  const reached =
    status === "NEW"
      ? 0
      : status === "CONTACTED"
        ? 1
        : status === "TRIAL_BOOKED"
          ? 1.5
          : status === "TRIAL_COMPLETED"
            ? 2
            : status === "WON"
              ? 3
              : -1;
  return (
    <ol className={`ld-stepper ${status === "LOST" ? "lost" : ""}`}>
      {steps.map((step, index) => (
        <li
          key={step}
          className={index <= reached ? "done" : index - 0.5 === reached ? "current" : ""}
        >
          <span>{index <= reached ? <Check size={11} strokeWidth={3} /> : index + 1}</span>
          {step}
        </li>
      ))}
    </ol>
  );
}

function TrialRow({
  lead,
  onChanged,
}: {
  lead: LeadDetail;
  onChanged: (message: string) => Promise<void>;
}) {
  const [mode, setMode] = useState<"idle" | "book" | "attended">("idle");
  const [trialAt, setTrialAt] = useState(toLocalInput(lead.trialAt));
  const [followUp, setFollowUp] = useState(() => toLocalInput(presetDate("tomorrow")));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function send(action: "book" | "attended" | "no_show") {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/leads/${lead.id}/trial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          trialAt: action === "book" && trialAt ? new Date(trialAt).toISOString() : null,
          nextFollowUpAt:
            action === "attended" && followUp ? new Date(followUp).toISOString() : null,
        }),
      });
      const result = await readJson<{ error?: string }>(response);
      if (!response.ok) throw new Error(result.error ?? "Could not update the trial.");
      setMode("idle");
      await onChanged(
        action === "book"
          ? "Trial booked"
          : action === "attended"
            ? "Trial marked as attended"
            : "Marked as a no-show — follow up today",
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update the trial.");
    } finally {
      setSaving(false);
    }
  }

  const booked = lead.status === "TRIAL_BOOKED" && lead.trialAt;
  const trialPassed = booked && new Date(lead.trialAt!) < new Date();
  const tone: Tone = trialPassed ? "amber" : booked ? "violet" : lead.status === "TRIAL_COMPLETED" ? "teal" : "grey";

  return (
    <div className={`ld-step-row tone-${tone}`}>
      <span className="ld-step-icon">
        <CalendarCheck size={16} />
      </span>
      <div className="ld-step-copy">
        <small>Trial session</small>
        <strong>
          {booked
            ? formatWhen(lead.trialAt!)
            : lead.status === "TRIAL_COMPLETED"
              ? `Attended${lead.trialAt ? ` · ${formatWhen(lead.trialAt)}` : ""}`
              : "Not booked yet"}
        </strong>
        {trialPassed && <em>Did they show up?</em>}
      </div>
      {mode === "idle" && lead.status !== "TRIAL_COMPLETED" && (
        <div className="ld-step-actions">
          {booked && (
            <>
              <button
                type="button"
                className="ld-mini primary"
                onClick={() => setMode("attended")}
                disabled={saving}
              >
                <Check size={13} />
                Attended
              </button>
              <button
                type="button"
                className="ld-mini"
                onClick={() => void send("no_show")}
                disabled={saving}
              >
                No-show
              </button>
            </>
          )}
          <button
            type="button"
            className={`ld-mini ${booked ? "" : "primary"}`}
            onClick={() => setMode("book")}
            disabled={saving}
          >
            {booked ? "Reschedule" : "Book trial"}
          </button>
        </div>
      )}
      {mode !== "idle" && (
        <form
          className="ld-step-form"
          onSubmit={(event) => {
            event.preventDefault();
            void send(mode);
          }}
        >
          {mode === "book" ? (
            <label>
              Trial date and time
              <input
                type="datetime-local"
                value={trialAt}
                onChange={(event) => setTrialAt(event.target.value)}
                required
                autoFocus
                disabled={saving}
              />
            </label>
          ) : (
            <FollowUpPicker
              value={followUp}
              onChange={setFollowUp}
              label="When should we follow up to close?"
              required
              disabled={saving}
            />
          )}
          <div className="ld-step-form-actions">
            <button type="button" className="button secondary" onClick={() => setMode("idle")}>
              Cancel
            </button>
            <button
              className="button primary"
              disabled={saving || (mode === "book" ? !trialAt : !followUp)}
            >
              {saving ? "Saving…" : mode === "book" ? "Save trial" : "Mark attended"}
            </button>
          </div>
        </form>
      )}
      {error && (
        <p className="ld-error" role="alert">
          <AlertCircle size={15} />
          {error}
        </p>
      )}
    </div>
  );
}

const activityIcons: Partial<Record<ActivityType, LucideIcon>> = {
  CALL: PhoneCall,
  EMAIL: Mail,
  WHATSAPP: MessageCircle,
  CONVERSION: Trophy,
  FOLLOW_UP: CalendarClock,
  TRIAL: CalendarCheck,
  ASSIGNMENT: UserRound,
  STATUS_CHANGE: ArrowRight,
};

const activityLabels: Record<ActivityType, string> = {
  NOTE: "Note",
  CALL: "Call",
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
  STATUS_CHANGE: "Stage",
  FOLLOW_UP: "Follow-up",
  CONVERSION: "Joined",
  TRIAL: "Trial",
  ASSIGNMENT: "Owner",
};

function LeadDrawer({
  leadId,
  intent,
  gymName,
  close,
  onEdit,
  onChanged,
}: {
  leadId: string;
  intent: DrawerIntent;
  gymName: string;
  close: () => void;
  onEdit: (lead: Lead) => void;
  onChanged: () => Promise<void>;
}) {
  const notify = useDashboardToast();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [tab, setTab] = useState<"activity" | "details">("activity");
  const [activityType, setActivityType] = useState<OutreachType>(
    intent === "call" ? "CALL" : intent === "whatsapp" ? "WHATSAPP" : "NOTE",
  );
  const [activityBody, setActivityBody] = useState("");
  const [nextFollowUpAt, setNextFollowUpAt] = useState(() =>
    intent ? toLocalInput(presetDate("tomorrow")) : "",
  );
  const [showTemplates, setShowTemplates] = useState(intent === "whatsapp");
  const [savingActivity, setSavingActivity] = useState(false);
  const [converting, setConverting] = useState(false);
  const [losing, setLosing] = useState(false);
  const [lostCode, setLostCode] = useState<LostReason | "">("");
  const [savingLost, setSavingLost] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(`/api/leads/${leadId}`);
        const result = await readJson<LeadDetail & { error?: string }>(response);
        if (!response.ok) throw new Error(result.error ?? "Could not load lead details.");
        if (!cancelled) setLead(result);
      } catch (reason) {
        if (!cancelled)
          setError(reason instanceof Error ? reason.message : "Could not load lead details.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [leadId, reloadKey]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  async function refresh(message: string) {
    setReloadKey((key) => key + 1);
    await onChanged();
    notify(message);
  }

  const open = lead ? isOpen(lead) : false;
  const isOutreach = activityType !== "NOTE";
  // Logging a call or message on an open lead must set the next step.
  const followUpRequired = open && isOutreach;

  async function addActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activityBody.trim()) return;
    setSavingActivity(true);
    setError("");
    try {
      const response = await fetch(`/api/leads/${leadId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activityType,
          body: activityBody,
          ...(open && nextFollowUpAt
            ? { nextFollowUpAt: new Date(nextFollowUpAt).toISOString() }
            : {}),
        }),
      });
      const result = await readJson<{ error?: string }>(response);
      if (!response.ok) throw new Error(result.error ?? "Could not save activity.");
      setActivityBody("");
      setNextFollowUpAt("");
      setActivityType("NOTE");
      await refresh("Activity saved");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save activity.");
    } finally {
      setSavingActivity(false);
    }
  }

  async function convertLead() {
    if (!lead || !window.confirm(`Convert ${lead.fullName} to an active member?`)) return;
    setConverting(true);
    setError("");
    try {
      const response = await fetch(`/api/leads/${lead.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinedOn: new Date().toISOString().slice(0, 10) }),
      });
      const result = await readJson<{ member?: { fullName: string }; error?: string }>(response);
      if (!response.ok) throw new Error(result.error ?? "Could not convert this lead.");
      await refresh(`${result.member?.fullName ?? "Lead"} is now a member`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not convert this lead.");
    } finally {
      setConverting(false);
    }
  }

  async function markLost() {
    if (!lead || !lostCode) return;
    setSavingLost(true);
    setError("");
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: lead.fullName,
          phone: lead.phone,
          email: lead.email,
          source: lead.source,
          interestedPlan: lead.interestedPlan,
          assignedToUserId: lead.assignedTo?.id ?? null,
          status: "LOST",
          lostReasonCode: lostCode,
          lostReason: null,
          nextFollowUpAt: null,
          trialAt: null,
        }),
      });
      const result = await readJson<{ error?: string }>(response);
      if (!response.ok) throw new Error(result.error ?? "Could not update this lead.");
      setLosing(false);
      await refresh("Lead marked as lost");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update this lead.");
    } finally {
      setSavingLost(false);
    }
  }

  function templateText(template: (typeof messageTemplates)[number], target: Lead) {
    return template.text({
      name: target.fullName.split(/\s+/)[0],
      gym: gymName || "our gym",
      trialAt: target.trialAt ? formatWhen(target.trialAt) : null,
    });
  }

  function sendTemplate(template: (typeof messageTemplates)[number]) {
    if (!lead) return;
    window.open(
      `https://wa.me/${whatsappNumber(lead.phone)}?text=${encodeURIComponent(templateText(template, lead))}`,
      "_blank",
      "noopener,noreferrer",
    );
    setShowTemplates(false);
    setTab("activity");
    setActivityType("WHATSAPP");
    setActivityBody(`Sent "${template.label}" on WhatsApp.`);
    if (open && !nextFollowUpAt) setNextFollowUpAt(toLocalInput(presetDate("tomorrow")));
  }

  function startOutreach(type: OutreachType) {
    setTab("activity");
    setActivityType(type);
    if (open && !nextFollowUpAt) setNextFollowUpAt(toLocalInput(presetDate("tomorrow")));
  }

  const waNumber = whatsappNumber(lead?.phone ?? null);
  const templates = lead ? messageTemplates.filter((template) => template.when(lead)) : [];
  const followState = lead ? followUpState(lead) : "none";
  const firstReply =
    lead?.firstContactedAt &&
    (new Date(lead.firstContactedAt).getTime() - new Date(lead.createdAt).getTime()) / 60_000;

  return (
    <div
      className="drawer-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-drawer-title"
      onMouseDown={(event) => event.currentTarget === event.target && close()}
    >
      <aside className="ld-drawer">
        <div className="ld-drawer-bar">
          <span>Lead</span>
          <div>
            {lead && !lead.convertedMemberId && (
              <button
                className="icon-button small"
                onClick={() => onEdit(lead)}
                aria-label={`Edit ${lead.fullName}`}
              >
                <Edit3 size={15} />
              </button>
            )}
            <button className="icon-button" onClick={close} aria-label="Close lead details">
              <X size={18} />
            </button>
          </div>
        </div>
        {!lead && !error && (
          <div className="ld-drawer-state">
            <LoaderCircle className="plan-spinner" size={19} />
            Loading lead…
          </div>
        )}
        {!lead && error && (
          <div className="ld-drawer-state error" role="alert">
            <AlertCircle size={17} />
            {error}
          </div>
        )}
        {lead && (
          <>
            <div className="ld-drawer-scroll">
              <header className="ld-hero">
                <Avatar name={lead.fullName} size="lg" />
                <div>
                  <h2 id="lead-drawer-title">{lead.fullName}</h2>
                  <div className="ld-hero-meta">
                    <StagePill status={lead.status} />
                    <SourceTag source={lead.source} />
                    <span className="ld-source">
                      <UserRound size={12} />
                      {lead.assignedTo?.fullName ?? "Unassigned"}
                    </span>
                  </div>
                </div>
              </header>
              <Stepper status={lead.status} />

              <div className="ld-contact">
                {lead.phone && (
                  <a href={`tel:${lead.phone}`} onClick={() => startOutreach("CALL")}>
                    <Phone size={16} />
                    Call
                  </a>
                )}
                {waNumber && (
                  <button
                    type="button"
                    className={`whatsapp ${showTemplates ? "active" : ""}`}
                    onClick={() => setShowTemplates((value) => !value)}
                    aria-expanded={showTemplates}
                  >
                    <MessageCircle size={16} />
                    WhatsApp
                  </button>
                )}
                {lead.email && (
                  <a href={`mailto:${lead.email}`} onClick={() => startOutreach("EMAIL")}>
                    <Mail size={16} />
                    Email
                  </a>
                )}
              </div>

              {showTemplates && waNumber && (
                <div className="ld-templates">
                  <div className="ld-templates-head">
                    <strong>Send a message</strong>
                    <span>Opens WhatsApp ready to send</span>
                  </div>
                  {templates.map((template) => (
                    <button
                      type="button"
                      key={template.key}
                      onClick={() => sendTemplate(template)}
                    >
                      <span>
                        <strong>{template.label}</strong>
                        <em>{templateText(template, lead)}</em>
                      </span>
                      <Send size={14} />
                    </button>
                  ))}
                  <a
                    href={`https://wa.me/${waNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      setShowTemplates(false);
                      startOutreach("WHATSAPP");
                    }}
                  >
                    Open a blank chat instead
                  </a>
                </div>
              )}

              {open && (
                <section className="ld-card">
                  <h3>Next steps</h3>
                  <div
                    className={`ld-step-row tone-${
                      followState === "overdue"
                        ? "red"
                        : followState === "today"
                          ? "amber"
                          : followState === "upcoming"
                            ? "blue"
                            : "grey"
                    }`}
                  >
                    <span className="ld-step-icon">
                      <CalendarClock size={16} />
                    </span>
                    <div className="ld-step-copy">
                      <small>Follow-up</small>
                      <strong>
                        {lead.nextFollowUpAt ? formatWhen(lead.nextFollowUpAt) : "Not scheduled"}
                      </strong>
                      {followState === "overdue" && <em>Overdue — reach out and reschedule</em>}
                    </div>
                  </div>
                  <TrialRow key={`${lead.status}-${lead.trialAt}`} lead={lead} onChanged={refresh} />
                </section>
              )}

              {lead.convertedMember && (
                <Link className="ld-joined" href={`/members?member=${lead.convertedMember.id}`}>
                  <UserCheck size={18} />
                  <span>
                    <strong>Joined as a member</strong>
                    <small>
                      #{lead.convertedMember.memberNumber}
                      {lead.convertedAt ? ` · ${formatDay(lead.convertedAt)}` : ""}
                    </small>
                  </span>
                  <ChevronRight size={16} />
                </Link>
              )}
              {lead.status === "LOST" && (
                <div className="ld-lost-banner">
                  <Ban size={16} />
                  <span>
                    <strong>Lost · {lostReasonLabel(lead.lostReasonCode)}</strong>
                    {lead.lostReason && <small>{lead.lostReason}</small>}
                  </span>
                </div>
              )}

              {error && (
                <p className="ld-error ld-drawer-error" role="alert">
                  <AlertCircle size={15} />
                  {error}
                </p>
              )}

              <div className="ld-tabs" role="tablist">
                <button
                  role="tab"
                  aria-selected={tab === "activity"}
                  className={tab === "activity" ? "active" : ""}
                  onClick={() => setTab("activity")}
                >
                  Activity <span>{lead.activities.length}</span>
                </button>
                <button
                  role="tab"
                  aria-selected={tab === "details"}
                  className={tab === "details" ? "active" : ""}
                  onClick={() => setTab("details")}
                >
                  Details
                </button>
              </div>

              {tab === "activity" && (
                <>
                  {!lead.convertedMemberId && (
                    <form className="ld-composer" onSubmit={addActivity}>
                      <div className="ld-composer-types" role="radiogroup" aria-label="Activity type">
                        {(["NOTE", "CALL", "WHATSAPP", "EMAIL"] as const).map((type) => {
                          const Icon = type === "NOTE" ? Edit3 : activityIcons[type]!;
                          return (
                            <button
                              type="button"
                              role="radio"
                              aria-checked={activityType === type}
                              key={type}
                              className={activityType === type ? "selected" : ""}
                              onClick={() =>
                                type === "NOTE" ? setActivityType("NOTE") : startOutreach(type)
                              }
                              disabled={savingActivity}
                            >
                              <Icon size={13} />
                              {activityLabels[type]}
                            </button>
                          );
                        })}
                      </div>
                      {activityType === "CALL" && (
                        <div className="ld-chip-row">
                          {callOutcomes.map((outcome) => (
                            <button
                              type="button"
                              key={outcome}
                              className={`ld-chip ${activityBody === outcome ? "selected" : ""}`}
                              onClick={() => setActivityBody(outcome)}
                              disabled={savingActivity}
                            >
                              {outcome}
                            </button>
                          ))}
                        </div>
                      )}
                      <textarea
                        value={activityBody}
                        onChange={(event) => setActivityBody(event.target.value)}
                        maxLength={2000}
                        rows={3}
                        placeholder={
                          activityType === "CALL"
                            ? "How did the call go?"
                            : activityType === "NOTE"
                              ? "Add a note for the team…"
                              : "What did you send or hear back?"
                        }
                        disabled={savingActivity}
                      />
                      {open && isOutreach && (
                        <FollowUpPicker
                          value={nextFollowUpAt}
                          onChange={setNextFollowUpAt}
                          required={followUpRequired}
                          disabled={savingActivity}
                          label="Then follow up"
                        />
                      )}
                      <div className="ld-composer-foot">
                        <button
                          className="button primary"
                          disabled={
                            savingActivity ||
                            !activityBody.trim() ||
                            (followUpRequired && !nextFollowUpAt)
                          }
                        >
                          {savingActivity ? "Saving…" : isOutreach ? "Log & schedule" : "Save note"}
                        </button>
                      </div>
                    </form>
                  )}
                  {lead.activities.length ? (
                    <ol className="ld-timeline">
                      {lead.activities.map((activity) => {
                        const Icon = activityIcons[activity.type] ?? Edit3;
                        return (
                          <li key={activity.id} className={`type-${activity.type.toLowerCase()}`}>
                            <span className="ld-timeline-icon">
                              <Icon size={13} />
                            </span>
                            <div>
                              <div className="ld-timeline-head">
                                <strong>{activityLabels[activity.type]}</strong>
                                <time dateTime={activity.createdAt}>
                                  {formatWhen(activity.createdAt)}
                                </time>
                              </div>
                              <p>{activity.body}</p>
                              <small>{activity.createdBy?.fullName ?? "Team member"}</small>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <p className="ld-empty-note">No activity yet.</p>
                  )}
                </>
              )}

              {tab === "details" && (
                <dl className="ld-details">
                  <div>
                    <dt>Phone</dt>
                    <dd>{lead.phone ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{lead.email ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Interested in</dt>
                    <dd>{interestLabel(lead.interestedPlan)}</dd>
                  </div>
                  <div>
                    <dt>Source</dt>
                    <dd>{sourceOption(lead.source).label}</dd>
                  </div>
                  <div>
                    <dt>Owner</dt>
                    <dd>{lead.assignedTo?.fullName ?? "Unassigned"}</dd>
                  </div>
                  <div>
                    <dt>Added</dt>
                    <dd>{formatDateTime(lead.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>First reply</dt>
                    <dd>
                      {typeof firstReply === "number"
                        ? `${duration(firstReply)} after enquiry`
                        : "Not contacted yet"}
                    </dd>
                  </div>
                  <div>
                    <dt>Last contact</dt>
                    <dd>{lead.lastContactedAt ? formatDateTime(lead.lastContactedAt) : "—"}</dd>
                  </div>
                </dl>
              )}
            </div>

            {open && (
              <footer className="ld-drawer-foot">
                {losing ? (
                  <div className="ld-lost-form">
                    <div className="ld-lost-form-head">
                      <strong>Why didn&apos;t they join?</strong>
                      <button
                        type="button"
                        className="icon-button small"
                        onClick={() => setLosing(false)}
                        aria-label="Cancel"
                      >
                        <X size={15} />
                      </button>
                    </div>
                    <div className="ld-chip-row">
                      {lostReasonOptions.map((option) => (
                        <button
                          type="button"
                          key={option.value}
                          className={`ld-chip ${lostCode === option.value ? "selected" : ""}`}
                          onClick={() => setLostCode(option.value)}
                          disabled={savingLost}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="button secondary ld-lost-confirm"
                      onClick={() => void markLost()}
                      disabled={!lostCode || savingLost}
                    >
                      {savingLost ? "Saving…" : "Mark as lost"}
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => setLosing(true)}
                    >
                      <Ban size={15} />
                      Lost
                    </button>
                    <button
                      className="button primary"
                      onClick={() => void convertLead()}
                      disabled={converting}
                    >
                      <Trophy size={16} />
                      {converting ? "Converting…" : "Convert to member"}
                    </button>
                  </>
                )}
              </footer>
            )}
          </>
        )}
      </aside>
    </div>
  );
}

type QueueItem = { lead: Lead; reason: string; tone: Tone };
type QueueGroup = {
  key: "new" | "trials" | "overdue" | "trial-updates" | "today";
  title: string;
  hint: string;
  icon: LucideIcon;
  tone: Tone;
  items: QueueItem[];
};

function buildQueue(leads: Lead[]): QueueGroup[] {
  const { start, tomorrow } = dayBounds();
  const seen = new Set<string>();
  const take = (items: QueueItem[]) =>
    items.filter((item) => !seen.has(item.lead.id) && seen.add(item.lead.id));
  const open = leads.filter(isOpen);
  const byTime = (value: (lead: Lead) => string | null) => (a: Lead, b: Lead) =>
    new Date(value(a) ?? 0).getTime() - new Date(value(b) ?? 0).getTime();

  const uncontacted = take(
    open
      .filter((lead) => lead.status === "NEW" && !lead.firstContactedAt)
      .sort(byTime((lead) => lead.createdAt))
      .map((lead) => ({
        lead,
        reason: `Enquired ${elapsed(lead.createdAt)} ago · no reply yet`,
        tone: "red" as const,
      })),
  );
  const trialsToday = take(
    open
      .filter(
        (lead) =>
          lead.status === "TRIAL_BOOKED" &&
          lead.trialAt &&
          new Date(lead.trialAt) >= start &&
          new Date(lead.trialAt) < tomorrow,
      )
      .sort(byTime((lead) => lead.trialAt))
      .map((lead) => ({
        lead,
        reason: `Trial at ${formatTime(lead.trialAt!)}`,
        tone: "violet" as const,
      })),
  );
  const overdue = take(
    open
      .filter((lead) => followUpState(lead) === "overdue")
      .sort(byTime((lead) => lead.nextFollowUpAt))
      .map((lead) => ({
        lead,
        reason: `Was due ${formatWhen(lead.nextFollowUpAt!)}`,
        tone: "red" as const,
      })),
  );
  const trialsToUpdate = take(
    open
      .filter(
        (lead) => lead.status === "TRIAL_BOOKED" && lead.trialAt && new Date(lead.trialAt) < start,
      )
      .sort(byTime((lead) => lead.trialAt))
      .map((lead) => ({
        lead,
        reason: `Trial was ${formatWhen(lead.trialAt!)}`,
        tone: "amber" as const,
      })),
  );
  const dueToday = take(
    open
      .filter((lead) => followUpState(lead) === "today")
      .sort(byTime((lead) => lead.nextFollowUpAt))
      .map((lead) => ({
        lead,
        reason: `Follow up at ${formatTime(lead.nextFollowUpAt!)}`,
        tone: "amber" as const,
      })),
  );

  return [
    {
      key: "new",
      title: "Reply now",
      hint: "The first gym to reply usually wins the visit",
      icon: Flame,
      tone: "red",
      items: uncontacted,
    },
    {
      key: "trials",
      title: "Trials today",
      hint: "Send a reminder, then mark attendance",
      icon: CalendarCheck,
      tone: "violet",
      items: trialsToday,
    },
    {
      key: "overdue",
      title: "Overdue",
      hint: "These slipped — reach out and set a new date",
      icon: Hourglass,
      tone: "red",
      items: overdue,
    },
    {
      key: "trial-updates",
      title: "Did they show up?",
      hint: "Past trials still marked as booked",
      icon: CalendarX,
      tone: "amber",
      items: trialsToUpdate,
    },
    {
      key: "today",
      title: "Later today",
      hint: "Scheduled follow-ups",
      icon: Sun,
      tone: "amber",
      items: dueToday,
    },
  ];
}

function QueueAction({
  group,
  lead,
  openLead,
}: {
  group: QueueGroup["key"];
  lead: Lead;
  openLead: (leadId: string, intent: DrawerIntent) => void;
}) {
  const hasWhatsapp = Boolean(whatsappNumber(lead.phone));
  if ((group === "new" || group === "trials") && hasWhatsapp) {
    return (
      <button
        type="button"
        className="ld-cta whatsapp"
        onClick={() => openLead(lead.id, "whatsapp")}
      >
        <MessageCircle size={14} />
        {group === "new" ? "Reply" : "Remind"}
      </button>
    );
  }
  if (group === "trial-updates") {
    return (
      <button type="button" className="ld-cta" onClick={() => openLead(lead.id, null)}>
        <CalendarCheck size={14} />
        Update
      </button>
    );
  }
  if (lead.phone) {
    return (
      <a className="ld-cta" href={`tel:${lead.phone}`} onClick={() => openLead(lead.id, "call")}>
        <Phone size={14} />
        Call
      </a>
    );
  }
  return (
    <button type="button" className="ld-cta" onClick={() => openLead(lead.id, null)}>
      Open
    </button>
  );
}

function TodayView({
  leads,
  openLead,
  addLead,
}: {
  leads: Lead[];
  openLead: (leadId: string, intent: DrawerIntent) => void;
  addLead: () => void;
}) {
  const groups = useMemo(() => buildQueue(leads), [leads]);
  const remaining = groups.reduce((sum, group) => sum + group.items.length, 0);
  const handled = leads.filter((lead) => isToday(lead.lastContactedAt)).length;
  const progress = handled + remaining ? Math.round((handled / (handled + remaining)) * 100) : 100;

  const agenda = useMemo(() => {
    const { start } = dayBounds();
    const until = new Date(start.getTime() + 3 * 86_400_000);
    return leads
      .filter(
        (lead) =>
          lead.status === "TRIAL_BOOKED" &&
          lead.trialAt &&
          new Date(lead.trialAt) >= start &&
          new Date(lead.trialAt) < until,
      )
      .sort((a, b) => new Date(a.trialAt!).getTime() - new Date(b.trialAt!).getTime());
  }, [leads]);

  const insights = useMemo(() => {
    const since = Date.now() - 30 * 86_400_000;
    const recent = leads.filter((lead) => new Date(lead.createdAt).getTime() >= since);
    const replies = recent
      .filter((lead) => lead.firstContactedAt)
      .map(
        (lead) =>
          (new Date(lead.firstContactedAt!).getTime() - new Date(lead.createdAt).getTime()) /
          60_000,
      )
      .sort((a, b) => a - b);
    const median = replies.length ? replies[Math.floor(replies.length / 2)] : null;
    const withinHour = recent.length
      ? Math.round((replies.filter((minutes) => minutes <= 60).length / recent.length) * 100)
      : null;
    const sources = sourceOptions
      .map((option) => {
        const fromSource = recent.filter((lead) => lead.source === option.value);
        return {
          ...option,
          count: fromSource.length,
          won: fromSource.filter((lead) => lead.status === "WON").length,
        };
      })
      .filter((item) => item.count)
      .sort((a, b) => b.count - a.count);
    return { recent: recent.length, median, withinHour, sources };
  }, [leads]);
  const maxSource = Math.max(1, ...insights.sources.map((item) => item.count));

  return (
    <div className="ld-today">
      <section className="panel ld-desk">
        <header className="ld-desk-head">
          <div>
            <h2>{remaining ? `${remaining} to do today` : "You're all caught up"}</h2>
            <p>
              {remaining
                ? "Work top to bottom — the most time-sensitive leads come first."
                : "No replies, trials, or follow-ups need attention right now."}
            </p>
          </div>
          <div className="ld-progress" aria-label={`${handled} handled today`}>
            <svg viewBox="0 0 36 36" aria-hidden="true">
              <circle cx="18" cy="18" r="15.5" />
              <circle cx="18" cy="18" r="15.5" strokeDasharray={`${progress * 0.974} 100`} />
            </svg>
            <span>
              <strong>{handled}</strong>
              <small>done</small>
            </span>
          </div>
        </header>
        {remaining === 0 ? (
          <div className="ld-desk-empty">
            <span>
              <CheckCircle2 size={26} />
            </span>
            <button type="button" className="button secondary" onClick={addLead}>
              <Plus size={15} />
              Add a walk-in or enquiry
            </button>
          </div>
        ) : (
          groups
            .filter((group) => group.items.length)
            .map((group) => (
              <section key={group.key} className={`ld-group tone-${group.tone}`}>
                <div className="ld-group-head">
                  <span className="ld-group-icon">
                    <group.icon size={14} />
                  </span>
                  <h3>{group.title}</h3>
                  <span className="ld-count">{group.items.length}</span>
                  <p>{group.hint}</p>
                </div>
                <ul>
                  {group.items.map(({ lead, reason, tone }) => (
                    <li key={lead.id}>
                      <button
                        type="button"
                        className="ld-row-main"
                        onClick={() => openLead(lead.id, null)}
                      >
                        <Avatar name={lead.fullName} />
                        <span className="ld-row-copy">
                          <span className="ld-row-title">
                            <strong>{lead.fullName}</strong>
                            <StagePill status={lead.status} />
                          </span>
                          <span className={`ld-row-reason tone-${tone}`}>{reason}</span>
                          <span className="ld-row-meta">
                            <SourceTag source={lead.source} />
                            <span>{interestLabel(lead.interestedPlan)}</span>
                            <span>{lead.assignedTo?.fullName ?? "Unassigned"}</span>
                          </span>
                        </span>
                      </button>
                      <div className="ld-row-actions">
                        <QueueAction group={group.key} lead={lead} openLead={openLead} />
                        <button
                          type="button"
                          className="ld-icon-btn"
                          onClick={() => openLead(lead.id, null)}
                          aria-label={`Open ${lead.fullName}`}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))
        )}
      </section>

      <aside className="ld-side">
        <section className="panel ld-side-card">
          <header>
            <CalendarCheck size={15} />
            <h3>Trial agenda</h3>
            <span>Next 3 days</span>
          </header>
          {agenda.length ? (
            <ol className="ld-agenda">
              {agenda.map((lead) => (
                <li key={lead.id}>
                  <button type="button" onClick={() => openLead(lead.id, null)}>
                    <time>
                      <strong>{formatTime(lead.trialAt!)}</strong>
                      <small>
                        {isToday(lead.trialAt)
                          ? "Today"
                          : new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(
                              new Date(lead.trialAt!),
                            )}
                      </small>
                    </time>
                    <span>
                      <strong>{lead.fullName}</strong>
                      <small>{interestLabel(lead.interestedPlan)}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <p className="ld-empty-note">No trials booked yet. Every enquiry should be offered one.</p>
          )}
        </section>

        <section className="panel ld-side-card">
          <header>
            <Timer size={15} />
            <h3>Speed to lead</h3>
            <span>Last 30 days</span>
          </header>
          <div className="ld-metrics">
            <div>
              <strong>{insights.median === null ? "—" : duration(insights.median)}</strong>
              <small>Typical first reply</small>
            </div>
            <div>
              <strong>{insights.withinHour === null ? "—" : `${insights.withinHour}%`}</strong>
              <small>Replied within 1 hour</small>
            </div>
          </div>
          <p className="ld-side-tip">
            Gyms that reply within 5 minutes are far more likely to book the visit.
          </p>
        </section>

        <section className="panel ld-side-card">
          <header>
            <Sparkles size={15} />
            <h3>Where leads come from</h3>
            <span>{insights.recent} in 30 days</span>
          </header>
          {insights.sources.length ? (
            <ul className="ld-sources">
              {insights.sources.map((item) => (
                <li key={item.value}>
                  <span className="ld-sources-label">
                    <item.icon size={13} />
                    {item.label}
                  </span>
                  <span className="ld-sources-bar">
                    <i style={{ width: `${(item.count / maxSource) * 100}%` }} />
                  </span>
                  <span className="ld-sources-count">
                    {item.count}
                    {item.won ? <small>{item.won} joined</small> : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ld-empty-note">Sources appear here as enquiries come in.</p>
          )}
        </section>
      </aside>
    </div>
  );
}

function BoardView({
  leads,
  openLead,
}: {
  leads: Lead[];
  openLead: (leadId: string, intent: DrawerIntent) => void;
}) {
  return (
    <div className="ld-board">
      {pipelineStages.map((stage) => {
        const column = leads
          .filter((lead) => lead.status === stage)
          .sort((a, b) => urgency(a) - urgency(b));
        const urgent = column.filter((lead) => nextStep(lead).tone === "red").length;
        return (
          <section key={stage} className={`ld-column tone-${stageMeta[stage].tone}`}>
            <header>
              <i />
              <h3>{stageMeta[stage].label}</h3>
              <span className="ld-count">{column.length}</span>
              {urgent > 0 && <em>{urgent} urgent</em>}
            </header>
            <div className="ld-column-body">
              {column.map((lead) => (
                <article key={lead.id} className="ld-card-lead">
                  <button
                    type="button"
                    className="ld-card-main"
                    onClick={() => openLead(lead.id, null)}
                  >
                    <span className="ld-card-top">
                      <strong>{lead.fullName}</strong>
                      {lead.assignedTo && (
                        <span title={lead.assignedTo.fullName}>
                          <Avatar name={lead.assignedTo.fullName} size="sm" />
                        </span>
                      )}
                    </span>
                    <span className="ld-card-meta">
                      <SourceTag source={lead.source} />
                      <span>
                        {lead.interestedPlan === "PT"
                          ? "PT"
                          : lead.interestedPlan === "GT"
                            ? "Gym"
                            : "Undecided"}
                      </span>
                    </span>
                    <NextStepTag lead={lead} />
                  </button>
                  {whatsappNumber(lead.phone) && (
                    <button
                      type="button"
                      className="ld-card-wa"
                      onClick={() => openLead(lead.id, "whatsapp")}
                      aria-label={`WhatsApp ${lead.fullName}`}
                    >
                      <MessageCircle size={14} />
                    </button>
                  )}
                </article>
              ))}
              {!column.length && <p className="ld-column-empty">No leads here</p>}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ListView({
  leads,
  total,
  stage,
  clearStage,
  openLead,
  addLead,
}: {
  leads: Lead[];
  total: number;
  stage: StageFilter;
  clearStage: () => void;
  openLead: (leadId: string, intent: DrawerIntent) => void;
  addLead: () => void;
}) {
  const sorted = useMemo(
    () =>
      [...leads].sort(
        (a, b) =>
          urgency(a) - urgency(b) ||
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [leads],
  );
  return (
    <section className="panel ld-list">
      <div className="ld-list-head">
        <div>
          <h2>
            {stage === "ALL" ? "All leads" : stage === "OPEN" ? "Open leads" : statusLabel(stage)}
          </h2>
          <p>Most urgent first.</p>
        </div>
        {stage !== "ALL" && (
          <button type="button" className="ld-chip selected" onClick={clearStage}>
            {stage === "OPEN" ? "Open" : statusLabel(stage)}
            <X size={12} />
          </button>
        )}
        <span>
          {leads.length} of {total}
        </span>
      </div>
      <div className="lead-table-scroll">
        <table className="ld-table">
          <thead>
            <tr>
              <th>Lead</th>
              <th>Stage</th>
              <th>Next step</th>
              <th>Source</th>
              <th>Owner</th>
              <th>Added</th>
              <th>
                <span className="sr-only">Open</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((lead) => (
              <tr key={lead.id} onClick={() => openLead(lead.id, null)}>
                <td>
                  <div className="ld-person">
                    <Avatar name={lead.fullName} />
                    <span>
                      <strong>{lead.fullName}</strong>
                      <small>{lead.phone ?? lead.email ?? "No contact details"}</small>
                    </span>
                  </div>
                </td>
                <td>
                  <StagePill status={lead.status} />
                </td>
                <td>
                  <NextStepTag lead={lead} />
                </td>
                <td>
                  <SourceTag source={lead.source} />
                  <small className="ld-cell-sub">{interestLabel(lead.interestedPlan)}</small>
                </td>
                <td>
                  {lead.assignedTo ? (
                    <span className="ld-owner">
                      <Avatar name={lead.assignedTo.fullName} size="sm" />
                      {lead.assignedTo.fullName}
                    </span>
                  ) : (
                    <span className="ld-muted">Unassigned</span>
                  )}
                </td>
                <td className="ld-muted">{formatDay(lead.createdAt)}</td>
                <td>
                  <ChevronRight size={16} className="ld-row-chevron" />
                </td>
              </tr>
            ))}
            {!sorted.length && (
              <tr>
                <td colSpan={7}>
                  <div className="ld-list-empty">
                    <ListTodo size={22} />
                    <strong>No leads found</strong>
                    <span>
                      {total ? "Try another search or stage." : "Add your first enquiry to start."}
                    </span>
                    {!total && (
                      <button type="button" className="button secondary" onClick={addLead}>
                        <Plus size={15} />
                        Add a lead
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Funnel({
  leads,
  active,
  onSelect,
}: {
  leads: Lead[];
  active: StageFilter | null;
  onSelect: (stage: StageFilter) => void;
}) {
  const counts = Object.fromEntries(
    (Object.keys(stageMeta) as LeadStatus[]).map((status) => [
      status,
      leads.filter((lead) => lead.status === status).length,
    ]),
  ) as Record<LeadStatus, number>;
  const closed = counts.WON + counts.LOST;
  const rate = closed ? Math.round((counts.WON / closed) * 100) : 0;
  const open = pipelineStages.reduce((sum, stage) => sum + counts[stage], 0);
  const waiting = leads.filter((lead) => lead.status === "NEW" && !lead.firstContactedAt).length;

  return (
    <section className="ld-funnel" aria-label="Pipeline by stage">
      <div className="ld-funnel-stages">
        {pipelineStages.map((stage) => (
          <button
            type="button"
            key={stage}
            className={`tone-${stageMeta[stage].tone} ${active === stage ? "active" : ""}`}
            onClick={() => onSelect(stage)}
          >
            <span className="ld-funnel-label">
              <i />
              {stageMeta[stage].label}
            </span>
            <strong>{counts[stage]}</strong>
            <span className="ld-funnel-bar">
              <i style={{ width: `${open ? (counts[stage] / open) * 100 : 0}%` }} />
            </span>
            <small>
              {stage === "NEW"
                ? waiting
                  ? `${waiting} awaiting reply`
                  : "All replied"
                : `${open ? Math.round((counts[stage] / open) * 100) : 0}% of pipeline`}
            </small>
          </button>
        ))}
      </div>
      <div className="ld-funnel-outcomes">
        <button
          type="button"
          className={`won ${active === "WON" ? "active" : ""}`}
          onClick={() => onSelect("WON")}
        >
          <span className="ld-funnel-label">
            <Trophy size={13} />
            Joined
          </span>
          <strong>{counts.WON}</strong>
          <small>{rate}% win rate</small>
        </button>
        <button
          type="button"
          className={`lost ${active === "LOST" ? "active" : ""}`}
          onClick={() => onSelect("LOST")}
        >
          <span className="ld-funnel-label">
            <Ban size={13} />
            Lost
          </span>
          <strong>{counts.LOST}</strong>
          <small>See why</small>
        </button>
      </div>
    </section>
  );
}

type LeadsResponse = {
  leads?: Lead[];
  team?: TeamMember[];
  currentUserId?: string;
  gymName?: string;
  error?: string;
};

const views: { value: View; label: string; icon: LucideIcon }[] = [
  { value: "today", label: "Today", icon: ListTodo },
  { value: "board", label: "Board", icon: SquareKanban },
  { value: "list", label: "List", icon: LayoutList },
];

export default function Leads() {
  const notify = useDashboardToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [gymName, setGymName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("today");
  const [stage, setStage] = useState<StageFilter>("ALL");
  const [mineOnly, setMineOnly] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [selected, setSelected] = useState<{ id: string; intent: DrawerIntent } | null>(null);

  const apply = useCallback((result: LeadsResponse) => {
    setLeads(result.leads ?? []);
    setTeam(result.team ?? []);
    setCurrentUserId(result.currentUserId ?? null);
    setGymName(result.gymName ?? "");
    setError("");
  }, []);

  const loadLeads = useCallback(async () => {
    try {
      const response = await fetch("/api/leads");
      const result = await readJson<LeadsResponse>(response);
      if (!response.ok || !result.leads) throw new Error(result.error ?? "Could not load leads.");
      apply(result);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load leads.");
    } finally {
      setLoading(false);
    }
  }, [apply]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/leads");
        const result = await readJson<LeadsResponse>(response);
        if (!response.ok || !result.leads) throw new Error(result.error ?? "Could not load leads.");
        if (!cancelled) apply(result);
      } catch (reason) {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : "Could not load leads.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    const openEditor = () => setAdding(true);
    window.addEventListener("gecco:add-lead", openEditor);
    return () => {
      cancelled = true;
      window.removeEventListener("gecco:add-lead", openEditor);
    };
  }, [apply]);

  const scoped = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return leads.filter(
      (lead) =>
        (!mineOnly || lead.assignedTo?.id === currentUserId) &&
        `${lead.fullName} ${lead.phone ?? ""} ${lead.email ?? ""} ${sourceOption(lead.source).label}`
          .toLowerCase()
          .includes(needle),
    );
  }, [currentUserId, leads, mineOnly, query]);

  const listed = useMemo(
    () =>
      scoped.filter((lead) =>
        stage === "ALL" ? true : stage === "OPEN" ? isOpen(lead) : lead.status === stage,
      ),
    [scoped, stage],
  );

  const openLead = useCallback(
    (id: string, intent: DrawerIntent) => setSelected({ id, intent }),
    [],
  );
  const closeDrawer = useCallback(() => setSelected(null), []);

  return (
    <div className="ld-page">
      <PageHeader
        eyebrow="WORKSPACE · SALES"
        title="Leads"
        copy="Reply fast, book trials, and turn enquiries into members."
        action="Add lead"
        icon={Plus}
        onAction={() => setAdding(true)}
      />

      {!error && (
        <Funnel
          leads={scoped}
          active={view === "list" ? stage : null}
          onSelect={(next) => {
            setStage(next);
            setView("list");
          }}
        />
      )}

      <div className="ld-toolbar">
        <div className="ld-views" role="tablist" aria-label="View">
          {views.map((item) => (
            <button
              key={item.value}
              role="tab"
              aria-selected={view === item.value}
              className={view === item.value ? "active" : ""}
              onClick={() => setView(item.value)}
            >
              <item.icon size={15} />
              {item.label}
            </button>
          ))}
        </div>
        <label className="ld-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, phone, email, or source"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
              <X size={13} />
            </button>
          )}
        </label>
        <button
          type="button"
          className={`ld-toggle ${mineOnly ? "active" : ""}`}
          onClick={() => setMineOnly((value) => !value)}
          aria-pressed={mineOnly}
        >
          <UserRound size={14} />
          My leads
        </button>
      </div>

      {loading ? (
        <section className="panel ld-state">
          <LoaderCircle className="plan-spinner" size={20} />
          Loading leads…
        </section>
      ) : error ? (
        <section className="panel ld-state error">
          <AlertCircle size={20} />
          {error}
          <button type="button" className="button secondary" onClick={() => void loadLeads()}>
            Try again
          </button>
        </section>
      ) : view === "today" ? (
        <TodayView leads={scoped} openLead={openLead} addLead={() => setAdding(true)} />
      ) : view === "board" ? (
        <BoardView leads={scoped} openLead={openLead} />
      ) : (
        <ListView
          leads={listed}
          total={leads.length}
          stage={stage}
          clearStage={() => setStage("ALL")}
          openLead={openLead}
          addLead={() => setAdding(true)}
        />
      )}

      {adding && (
        <LeadEditor
          team={team}
          currentUserId={currentUserId}
          close={() => setAdding(false)}
          onSaved={async () => {
            await loadLeads();
            notify("Lead added to the pipeline");
          }}
        />
      )}
      {editing && (
        <LeadEditor
          lead={editing}
          team={team}
          currentUserId={currentUserId}
          close={() => setEditing(null)}
          onSaved={async () => {
            await loadLeads();
            notify("Lead updated");
          }}
        />
      )}
      {selected && (
        <LeadDrawer
          key={`${selected.id}-${selected.intent}`}
          leadId={selected.id}
          intent={selected.intent}
          gymName={gymName}
          close={closeDrawer}
          onEdit={(lead) => {
            setEditing(lead);
            setSelected(null);
          }}
          onChanged={loadLeads}
        />
      )}
    </div>
  );
}
