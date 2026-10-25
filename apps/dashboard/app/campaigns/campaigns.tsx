"use client";

import {
  AlertCircle,
  ArrowLeft,
  BadgeIndianRupee,
  CalendarClock,
  CalendarX,
  Check,
  CircleSlash,
  Copy,
  Dumbbell,
  LoaderCircle,
  Megaphone,
  MessageCircle,
  RotateCcw,
  Send,
  SkipForward,
  Target,
  Trash2,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Empty, PageHeader, SummaryCard, SummaryGrid, Tab, Toolbar } from "../_components/managed-page-ui";
import { type Notify, useDashboardToast } from "../manage-shell";
import { useCan } from "../session-provider";
import {
  campaignSegments,
  MAX_MESSAGE_LENGTH,
  renderMessage,
  segmentMeta,
  segmentVariables,
  validateTemplate,
  variableLabels,
  whatsappLink,
  type CampaignSegment,
  type RecipientStatus,
} from "../api/campaigns/shared";
import "./campaigns.css";

async function readJson<T>(response: Response) {
  const body = await response.text();
  if (!body.trim()) throw new Error(`The server returned an empty response (${response.status}).`);

  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error(`The server returned an invalid response (${response.status}).`);
  }
}

type Summary = {
  total: number;
  pending: number;
  sent: number;
  skipped: number;
  optedOut: number;
  converted: number;
  revenue: string;
};

type CampaignListItem = {
  id: string;
  name: string;
  segment: CampaignSegment;
  status: "ACTIVE" | "COMPLETED";
  attributionDays: number;
  createdAt: string;
  completedAt: string | null;
  createdByName: string | null;
  summary: Summary;
};

type Recipient = {
  id: string;
  memberId: string | null;
  leadId: string | null;
  fullName: string;
  phone: string;
  message: string;
  status: RecipientStatus;
  sentAt: string | null;
  sentByName: string | null;
  converted: boolean;
  revenue: string;
};

type CampaignDetailData = Omit<CampaignListItem, "summary"> & {
  messageTemplate: string;
  segmentParams: { days?: number; reasons?: string[] };
  summary: Summary;
  recipients: Recipient[];
};

type Preview = {
  count: number;
  missingPhone: number;
  optedOut: number;
  maxRecipients: number;
  sample: { fullName: string; variables: Record<string, string> }[];
};

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
const timeFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

const segmentIcons: Record<CampaignSegment, LucideIcon> = {
  EXPIRING_SOON: CalendarClock,
  EXPIRED_NOT_RENEWED: CalendarX,
  DUES_OUTSTANDING: WalletCards,
  PT_UPSELL: Dumbbell,
  ACTIVE_MEMBERS: Users,
  LOST_LEADS: Target,
  TRIALS_NOT_CONVERTED: UserCheck,
};

const segmentTones: Record<CampaignSegment, string> = {
  EXPIRING_SOON: "amber",
  EXPIRED_NOT_RENEWED: "red",
  DUES_OUTSTANDING: "blue",
  PT_UPSELL: "violet",
  ACTIVE_MEMBERS: "green",
  LOST_LEADS: "grey",
  TRIALS_NOT_CONVERTED: "teal",
};

const lostReasonOptions = [
  { value: "PRICE", label: "Price too high" },
  { value: "LOCATION", label: "Too far away" },
  { value: "TIMING", label: "Timings don't suit" },
  { value: "JOINED_ELSEWHERE", label: "Joined another gym" },
  { value: "NO_RESPONSE", label: "Stopped responding" },
  { value: "NOT_INTERESTED", label: "Not interested" },
  { value: "OTHER", label: "Other" },
];

/** Stand-in values so the preview reads naturally before anyone matches. */
const exampleVariables: Record<string, string> = {
  name: "Neha",
  fullName: "Neha Sharma",
  gymName: "your gym",
  planName: "Monthly GT",
  endDate: "12 Nov",
  daysLeft: "5",
  dueAmount: "₹2,500",
};

const statusLabels: Record<RecipientStatus, string> = {
  PENDING: "To send",
  SENT: "Sent",
  SKIPPED: "Skipped",
  OPTED_OUT: "Opted out",
};

function formatPhone(phone: string) {
  if (phone.length === 12 && phone.startsWith("91")) return `+91 ${phone.slice(2, 7)} ${phone.slice(7)}`;
  return `+${phone}`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function percent(part: number, whole: number) {
  return whole ? Math.round((part / whole) * 100) : 0;
}

function recount(recipients: Recipient[], previous: Summary): Summary {
  const count = (status: RecipientStatus) => recipients.filter((recipient) => recipient.status === status).length;
  return { ...previous, pending: count("PENDING"), sent: count("SENT"), skipped: count("SKIPPED"), optedOut: count("OPTED_OUT") };
}

function defaultName(segment: CampaignSegment) {
  const month = new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" }).format(new Date());
  return `${segmentMeta[segment].label} · ${month}`;
}

function SegmentBadge({ segment }: { segment: CampaignSegment }) {
  const Icon = segmentIcons[segment];
  return (
    <span className={`cp-segment tone-${segmentTones[segment]}`}>
      <Icon size={13} />
      {segmentMeta[segment].label}
    </span>
  );
}

function Progress({ summary }: { summary: Summary }) {
  const handled = summary.total - summary.pending;
  return (
    <div className="cp-progress" title={`${summary.sent} sent, ${summary.pending} to send`}>
      <span>
        <i style={{ width: `${percent(summary.sent, summary.total)}%` }} />
        <b style={{ width: `${percent(handled - summary.sent, summary.total)}%` }} />
      </span>
      <small>
        {summary.sent}/{summary.total} sent
      </small>
    </div>
  );
}

function CampaignBuilder({
  initialSegment,
  close,
  onCreated,
}: {
  initialSegment: CampaignSegment;
  close: () => void;
  onCreated: (id: string) => void;
}) {
  const [segment, setSegment] = useState<CampaignSegment>(initialSegment);
  const [days, setDays] = useState(String(segmentMeta[initialSegment].days?.default ?? ""));
  const [reasons, setReasons] = useState<string[]>([]);
  const [name, setName] = useState(defaultName(initialSegment));
  const [nameEdited, setNameEdited] = useState(false);
  const [message, setMessage] = useState(segmentMeta[initialSegment].template);
  const [messageEdited, setMessageEdited] = useState(false);
  const [attributionDays, setAttributionDays] = useState(7);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewError, setPreviewError] = useState("");
  const [previewLoading, setPreviewLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const meta = segmentMeta[segment];

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setPreviewLoading(true);
      setPreviewError("");
      try {
        const response = await fetch("/api/campaigns/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            segment,
            params: { ...(meta.days ? { days: Number(days) } : {}), ...(meta.reasons ? { reasons } : {}) },
          }),
          signal: controller.signal,
        });
        const data = await readJson<Preview & { error?: string }>(response);
        if (!response.ok) throw new Error(data.error ?? "Could not load this audience.");
        setPreview(data);
      } catch (reason) {
        if (controller.signal.aborted) return;
        setPreview(null);
        setPreviewError(reason instanceof Error ? reason.message : "Could not load this audience.");
      } finally {
        if (!controller.signal.aborted) setPreviewLoading(false);
      }
    }, 300);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [segment, days, reasons, meta.days, meta.reasons]);

  function chooseSegment(next: CampaignSegment) {
    setSegment(next);
    setDays(String(segmentMeta[next].days?.default ?? ""));
    setReasons([]);
    if (!messageEdited) setMessage(segmentMeta[next].template);
    if (!nameEdited) setName(defaultName(next));
  }

  function insertVariable(variable: string) {
    const token = `{{${variable}}}`;
    const field = messageRef.current;
    const start = field?.selectionStart ?? message.length;
    const end = field?.selectionEnd ?? message.length;
    setMessage(message.slice(0, start) + token + message.slice(end));
    setMessageEdited(true);
    window.requestAnimationFrame(() => {
      field?.focus();
      field?.setSelectionRange(start + token.length, start + token.length);
    });
  }

  const templateError = validateTemplate(segment, message);
  const sample = preview?.sample[0];
  const rendered = renderMessage(message, sample ? sample.variables : { ...exampleVariables });
  const tooMany = Boolean(preview && preview.count > preview.maxRecipients);
  const canCreate = Boolean(preview && preview.count > 0 && !tooMany && !templateError && !previewLoading);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canCreate) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          segment,
          params: { ...(meta.days ? { days: Number(days) } : {}), ...(meta.reasons ? { reasons } : {}) },
          messageTemplate: message,
          attributionDays,
        }),
      });
      const data = await readJson<{ id?: string; error?: string }>(response);
      if (!response.ok || !data.id) throw new Error(data.error ?? "Could not create the campaign.");
      onCreated(data.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create the campaign.");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="modal-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="campaign-builder-title"
      onMouseDown={(event) => event.currentTarget === event.target && !submitting && close()}
    >
      <form className="modal cp-builder" onSubmit={submit}>
        <div className="cp-builder-head">
          <span className="cp-builder-icon">
            <Megaphone size={20} />
          </span>
          <div>
            <h2 id="campaign-builder-title">New campaign</h2>
            <p>Pick who to reach, write the message, then send it from WhatsApp one tap at a time.</p>
          </div>
          <button type="button" className="icon-button" onClick={close} aria-label="Close" disabled={submitting}>
            <X size={18} />
          </button>
        </div>

        <div className="cp-builder-body">
          <div className="cp-builder-form">
            <section className="cp-section">
              <h3>1. Audience</h3>
              <div className="cp-segment-grid">
                {campaignSegments.map((item) => {
                  const Icon = segmentIcons[item];
                  return (
                    <button
                      type="button"
                      key={item}
                      className={`cp-segment-option tone-${segmentTones[item]} ${segment === item ? "selected" : ""}`}
                      onClick={() => chooseSegment(item)}
                      aria-pressed={segment === item}
                    >
                      <span>
                        <Icon size={15} />
                      </span>
                      <strong>{segmentMeta[item].label}</strong>
                      <small>{segmentMeta[item].description}</small>
                    </button>
                  );
                })}
              </div>
              {(meta.days || meta.reasons) && (
                <div className="cp-params">
                  {meta.days && (
                    <label>
                      {meta.days.label}
                      <input
                        type="number"
                        min={1}
                        max={meta.days.max}
                        value={days}
                        onChange={(event) => setDays(event.target.value)}
                      />
                    </label>
                  )}
                  {meta.reasons && (
                    <div className="cp-field">
                      <span>Why they were lost (optional)</span>
                      <div className="cp-chip-row">
                        {lostReasonOptions.map((option) => (
                          <button
                            type="button"
                            key={option.value}
                            className={`cp-chip ${reasons.includes(option.value) ? "selected" : ""}`}
                            onClick={() =>
                              setReasons((current) =>
                                current.includes(option.value)
                                  ? current.filter((value) => value !== option.value)
                                  : [...current, option.value],
                              )
                            }
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="cp-section">
              <h3>2. Message</h3>
              <div className="cp-chip-row" aria-label="Insert a personal detail">
                {segmentVariables(segment).map((variable) => (
                  <button type="button" key={variable} className="cp-chip" onClick={() => insertVariable(variable)}>
                    + {variableLabels[variable] ?? variable}
                  </button>
                ))}
              </div>
              <textarea
                ref={messageRef}
                className="cp-message"
                rows={6}
                value={message}
                maxLength={MAX_MESSAGE_LENGTH}
                onChange={(event) => {
                  setMessage(event.target.value);
                  setMessageEdited(true);
                }}
                aria-label="Message"
              />
              <div className="cp-message-foot">
                {templateError ? (
                  <span className="cp-error">
                    <AlertCircle size={13} />
                    {templateError}
                  </span>
                ) : (
                  <span>Details in {"{{ }}"} are filled in for each person.</span>
                )}
                <span>
                  {message.length}/{MAX_MESSAGE_LENGTH}
                </span>
              </div>
            </section>

            <section className="cp-section cp-settings">
              <h3>3. Details</h3>
              <label>
                Campaign name
                <input
                  required
                  minLength={2}
                  maxLength={120}
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setNameEdited(true);
                  }}
                />
              </label>
              <label>
                Count results for
                <select value={attributionDays} onChange={(event) => setAttributionDays(Number(event.target.value))}>
                  {[3, 7, 14, 30].map((value) => (
                    <option key={value} value={value}>
                      {value} days after each message
                    </option>
                  ))}
                </select>
              </label>
            </section>
          </div>

          <aside className="cp-builder-preview">
            <div className="cp-audience">
              {previewLoading ? (
                <span className="cp-audience-loading">
                  <LoaderCircle size={16} className="plan-spinner" /> Finding people…
                </span>
              ) : previewError ? (
                <span className="cp-error">
                  <AlertCircle size={13} />
                  {previewError}
                </span>
              ) : preview ? (
                <>
                  <strong>{preview.count}</strong>
                  <span>{preview.count === 1 ? "person will get this" : "people will get this"}</span>
                  {(preview.missingPhone > 0 || preview.optedOut > 0) && (
                    <small>
                      {[
                        preview.missingPhone ? `${preview.missingPhone} without a phone number` : "",
                        preview.optedOut ? `${preview.optedOut} opted out` : "",
                      ]
                        .filter(Boolean)
                        .join(" · ")}{" "}
                      left out
                    </small>
                  )}
                  {tooMany && (
                    <small className="cp-error">Narrow this to {preview.maxRecipients} people or fewer.</small>
                  )}
                </>
              ) : null}
            </div>
            <div className="cp-phone">
              <div className="cp-phone-head">
                <span className="cp-avatar sm">{initials(sample?.fullName ?? exampleVariables.fullName)}</span>
                <strong>{sample?.fullName ?? "Example member"}</strong>
              </div>
              <div className="cp-bubble">{rendered || <em>Your message appears here.</em>}</div>
            </div>
            {preview && preview.sample.length > 1 && (
              <p className="cp-muted">
                Also: {preview.sample.slice(1, 4).map((person) => person.fullName).join(", ")}
                {preview.count > 4 ? ` and ${preview.count - 4} more` : ""}
              </p>
            )}
            {!previewLoading && preview?.count === 0 && (
              <p className="cp-muted">Nobody matches right now. Try a wider range or another audience.</p>
            )}
          </aside>
        </div>

        <div className="cp-builder-foot">
          {error ? (
            <span className="cp-error" role="alert">
              <AlertCircle size={13} />
              {error}
            </span>
          ) : (
            <span>The list is fixed when you create it. Nothing is sent until you tap send.</span>
          )}
          <button type="button" className="button secondary" onClick={close} disabled={submitting}>
            Cancel
          </button>
          <button className="button primary" type="submit" disabled={!canCreate || submitting}>
            {submitting ? "Creating…" : preview?.count ? `Create for ${preview.count}` : "Create campaign"}
          </button>
        </div>
      </form>
    </div>
  );
}

function RecipientRow({
  recipient,
  canSend,
  busy,
  goalLabel,
  onAction,
  onCopy,
}: {
  recipient: Recipient;
  canSend: boolean;
  busy: boolean;
  goalLabel: string;
  onAction: (recipient: Recipient, action: "sent" | "skipped" | "opted_out" | "pending") => void;
  onCopy: (recipient: Recipient) => void;
}) {
  const pending = recipient.status === "PENDING";
  return (
    <li className={`cp-recipient ${pending ? "" : "handled"}`}>
      <span className="cp-avatar">{initials(recipient.fullName)}</span>
      <div className="cp-recipient-main">
        <div className="cp-recipient-name">
          <strong>{recipient.fullName}</strong>
          <small>
            {formatPhone(recipient.phone)} · {recipient.leadId ? "Lead" : "Member"}
          </small>
        </div>
        <p>{recipient.message}</p>
        <div className="cp-recipient-meta">
          <span className={`cp-status ${recipient.status.toLowerCase()}`}>{statusLabels[recipient.status]}</span>
          {recipient.sentAt && (
            <small>
              {timeFormat.format(new Date(recipient.sentAt))}
              {recipient.sentByName ? ` by ${recipient.sentByName}` : ""}
            </small>
          )}
          {recipient.converted && (
            <span className="cp-result">
              <Check size={12} /> {goalLabel}
            </span>
          )}
          {Number(recipient.revenue) > 0 && (
            <span className="cp-result">{money.format(Number(recipient.revenue))}</span>
          )}
        </div>
      </div>
      {canSend && (
        <div className="cp-recipient-actions">
          {pending ? (
            <>
              <a
                className="button primary"
                href={whatsappLink(recipient.phone, recipient.message)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onAction(recipient, "sent")}
                aria-disabled={busy}
              >
                <Send size={14} /> Send
              </a>
              <button
                type="button"
                className="icon-button"
                onClick={() => onCopy(recipient)}
                aria-label={`Copy message for ${recipient.fullName}`}
                title="Copy message"
              >
                <Copy size={15} />
              </button>
              <button
                type="button"
                className="icon-button"
                onClick={() => onAction(recipient, "skipped")}
                disabled={busy}
                aria-label={`Skip ${recipient.fullName}`}
                title="Skip"
              >
                <SkipForward size={15} />
              </button>
              <button
                type="button"
                className="icon-button"
                onClick={() => onAction(recipient, "opted_out")}
                disabled={busy}
                aria-label={`${recipient.fullName} does not want messages`}
                title="Doesn't want messages"
              >
                <UserX size={15} />
              </button>
            </>
          ) : (
            <button
              type="button"
              className="button secondary"
              onClick={() => onAction(recipient, "pending")}
              disabled={busy}
            >
              <RotateCcw size={14} /> Undo
            </button>
          )}
        </div>
      )}
    </li>
  );
}

function CampaignDetail({
  id,
  canSend,
  notify,
  back,
}: {
  id: string;
  canSend: boolean;
  notify: Notify;
  back: () => void;
}) {
  const [data, setData] = useState<CampaignDetailData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState<"PENDING" | "SENT" | "OTHER" | "ALL">("PENDING");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch(`/api/campaigns/${id}`);
        const body = await readJson<CampaignDetailData & { error?: string }>(response);
        if (!response.ok || !body.recipients) throw new Error(body.error ?? "Could not load the campaign.");
        setData(body);
        if (!body.summary.pending) setFilter("ALL");
      } catch (reason) {
        setLoadError(reason instanceof Error ? reason.message : "Could not load the campaign.");
      }
    })();
  }, [id]);

  const visible = useMemo(() => {
    if (!data) return [];
    const search = query.trim().toLowerCase();
    const digits = search.replace(/\D/g, "");
    return data.recipients.filter(
      (recipient) =>
        (filter === "ALL" ||
          (filter === "OTHER" ? recipient.status === "SKIPPED" || recipient.status === "OPTED_OUT" : recipient.status === filter)) &&
        (!search ||
          recipient.fullName.toLowerCase().includes(search) ||
          (digits.length > 0 && recipient.phone.includes(digits))),
    );
  }, [data, filter, query]);

  if (loadError) {
    return (
      <div className="cp-page">
        <button className="cp-back" onClick={back}>
          <ArrowLeft size={15} /> All campaigns
        </button>
        <Empty icon={Megaphone} label={loadError} />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="cp-loading">
        <LoaderCircle size={22} className="plan-spinner" /> Loading campaign…
      </div>
    );
  }

  const meta = segmentMeta[data.segment];
  const next = data.recipients.find((recipient) => recipient.status === "PENDING");

  async function act(recipient: Recipient, action: "sent" | "skipped" | "opted_out" | "pending") {
    setBusyId(recipient.id);
    try {
      const response = await fetch(`/api/campaigns/${id}/recipients/${recipient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const body = await readJson<{
        status?: RecipientStatus;
        sentAt?: string | null;
        sentByName?: string | null;
        campaignStatus?: CampaignDetailData["status"];
        error?: string;
      }>(response);
      if (!response.ok || !body.status) throw new Error(body.error ?? "Could not update this person.");
      setData((current) => {
        if (!current) return current;
        const recipients = current.recipients.map((item) =>
          item.id === recipient.id
            ? { ...item, status: body.status!, sentAt: body.sentAt ?? null, sentByName: body.sentByName ?? null }
            : item,
        );
        return {
          ...current,
          status: body.campaignStatus ?? current.status,
          recipients,
          summary: recount(recipients, current.summary),
        };
      });
      if (action === "opted_out") notify(`${recipient.fullName} won't get campaign messages again`);
      if (body.campaignStatus === "COMPLETED" && action !== "pending") notify("Everyone in this campaign is done");
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : "Could not update this person.");
    } finally {
      setBusyId("");
    }
  }

  async function copy(recipient: Recipient) {
    try {
      await navigator.clipboard.writeText(recipient.message);
      notify("Message copied");
    } catch {
      notify("Could not copy. Select the message text instead.");
    }
  }

  async function finish() {
    if (!data) return;
    if (!window.confirm(`Finish "${data.name}"? The ${data.summary.pending} people not messaged yet will be skipped.`)) return;
    setWorking(true);
    const response = await fetch(`/api/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "finish" }),
    });
    const body = await readJson<{ error?: string }>(response);
    setWorking(false);
    if (!response.ok) return notify(body.error ?? "Could not finish the campaign.");
    setData((current) => {
      if (!current) return current;
      const recipients = current.recipients.map((item) =>
        item.status === "PENDING" ? { ...item, status: "SKIPPED" as const } : item,
      );
      return { ...current, status: "COMPLETED", recipients, summary: recount(recipients, current.summary) };
    });
    setFilter("ALL");
    notify("Campaign finished");
  }

  async function discard() {
    if (!data || !window.confirm(`Delete "${data.name}"? Nobody has been messaged yet.`)) return;
    setWorking(true);
    const response = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
    const body = await readJson<{ error?: string }>(response);
    setWorking(false);
    if (!response.ok) return notify(body.error ?? "Could not delete the campaign.");
    notify("Campaign deleted");
    back();
  }

  const { summary } = data;
  const conversionRate = percent(summary.converted, summary.sent);

  return (
    <div className="cp-page">
      <button className="cp-back" onClick={back}>
        <ArrowLeft size={15} /> All campaigns
      </button>

      <header className="cp-detail-head">
        <div>
          <SegmentBadge segment={data.segment} />
          <h1>{data.name}</h1>
          <p>
            Created {dateFormat.format(new Date(data.createdAt))}
            {data.createdByName ? ` by ${data.createdByName}` : ""} · results counted for {data.attributionDays} days
            after each message
          </p>
        </div>
        {canSend && (
          <div className="cp-detail-actions">
            {summary.sent === 0 && (
              <button className="button secondary" onClick={() => void discard()} disabled={working}>
                <Trash2 size={14} /> Delete
              </button>
            )}
            {summary.pending > 0 && (
              <button className="button secondary" onClick={() => void finish()} disabled={working}>
                <CircleSlash size={14} /> Finish
              </button>
            )}
            {next && (
              <a
                className="button primary"
                href={whatsappLink(next.phone, next.message)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => void act(next, "sent")}
              >
                <Send size={14} /> Send to {next.fullName.split(/\s+/)[0]}
              </a>
            )}
          </div>
        )}
      </header>

      <section className="cp-results">
        <article>
          <small>Progress</small>
          <strong>
            {summary.sent}
            <span>/{summary.total}</span>
          </strong>
          <Progress summary={summary} />
        </article>
        <article>
          <small>{meta.goalLabel}</small>
          <strong>{summary.converted}</strong>
          <em>{summary.sent ? `${conversionRate}% of people messaged` : "Shows up as people respond"}</em>
        </article>
        <article>
          <small>Revenue after message</small>
          <strong>{money.format(Number(summary.revenue))}</strong>
          <em>Payments recorded within {data.attributionDays} days</em>
        </article>
        <article>
          <small>Not sent</small>
          <strong>{summary.skipped + summary.optedOut}</strong>
          <em>
            {summary.skipped} skipped · {summary.optedOut} opted out
          </em>
        </article>
      </section>

      <Toolbar query={query} setQuery={setQuery} placeholder="Search by name or number">
        <Tab active={filter === "PENDING"} onClick={() => setFilter("PENDING")}>
          To send ({summary.pending})
        </Tab>
        <Tab active={filter === "SENT"} onClick={() => setFilter("SENT")}>
          Sent ({summary.sent})
        </Tab>
        <Tab active={filter === "OTHER"} onClick={() => setFilter("OTHER")}>
          Skipped ({summary.skipped + summary.optedOut})
        </Tab>
        <Tab active={filter === "ALL"} onClick={() => setFilter("ALL")}>
          All
        </Tab>
      </Toolbar>

      {visible.length ? (
        <ul className="cp-recipients">
          {visible.map((recipient) => (
            <RecipientRow
              key={recipient.id}
              recipient={recipient}
              canSend={canSend}
              busy={busyId === recipient.id}
              goalLabel={meta.goalLabel}
              onAction={(item, action) => void act(item, action)}
              onCopy={(item) => void copy(item)}
            />
          ))}
        </ul>
      ) : filter === "PENDING" && summary.total > 0 ? (
        <div className="panel cp-done">
          <Check size={22} />
          <strong>Everyone has been handled</strong>
          <span>Results keep updating as payments and renewals are recorded.</span>
        </div>
      ) : (
        <Empty icon={Users} label="Nobody here" />
      )}
    </div>
  );
}

function QuickStart({ onPick }: { onPick: (segment: CampaignSegment) => void }) {
  return (
    <section className="panel cp-quickstart">
      <div>
        <h2>Start with the people most likely to pay</h2>
        <p>
          Each audience is built from your members, payments, and leads. Gecco fills in names, plans, and dues, then
          tracks the renewals and payments that follow.
        </p>
      </div>
      <div className="cp-quickstart-grid">
        {campaignSegments.map((segment) => {
          const Icon = segmentIcons[segment];
          return (
            <button key={segment} className={`cp-segment-option tone-${segmentTones[segment]}`} onClick={() => onPick(segment)}>
              <span>
                <Icon size={15} />
              </span>
              <strong>{segmentMeta[segment].label}</strong>
              <small>{segmentMeta[segment].description}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Campaigns({ notify }: { notify: Notify }) {
  const canSend = useCan("campaigns:send");
  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [builderSegment, setBuilderSegment] = useState<CampaignSegment | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Active" | "Completed">("All");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (openId) return;
    void (async () => {
      try {
        const response = await fetch("/api/campaigns");
        const data = await readJson<{ campaigns?: CampaignListItem[]; error?: string }>(response);
        if (!response.ok || !data.campaigns) throw new Error(data.error ?? "Could not load campaigns.");
        setCampaigns(data.campaigns);
        setLoadError("");
      } catch (reason) {
        setLoadError(reason instanceof Error ? reason.message : "Could not load campaigns.");
      } finally {
        setLoading(false);
      }
    })();
  }, [openId, reload]);

  const totals = useMemo(
    () =>
      campaigns.reduce(
        (sum, campaign) => ({
          sent: sum.sent + campaign.summary.sent,
          pending: sum.pending + campaign.summary.pending,
          converted: sum.converted + campaign.summary.converted,
          revenue: sum.revenue + Number(campaign.summary.revenue),
        }),
        { sent: 0, pending: 0, converted: 0, revenue: 0 },
      ),
    [campaigns],
  );

  const visible = campaigns.filter(
    (campaign) =>
      (filter === "All" || (filter === "Active" ? campaign.status === "ACTIVE" : campaign.status === "COMPLETED")) &&
      `${campaign.name} ${segmentMeta[campaign.segment].label}`.toLowerCase().includes(query.toLowerCase()),
  );

  if (openId) {
    return (
      <CampaignDetail
        id={openId}
        canSend={canSend}
        notify={notify}
        back={() => {
          setOpenId(null);
          setReload((value) => value + 1);
        }}
      />
    );
  }

  return (
    <div className="cp-page">
      {canSend ? (
        <PageHeader
          eyebrow="WORKSPACE"
          title="Campaigns"
          copy="Send WhatsApp messages to members and leads, and see the renewals and payments that follow."
          action="New campaign"
          icon={Megaphone}
          onAction={() => setBuilderSegment("EXPIRING_SOON")}
        />
      ) : (
        <div className="page-heading managed-heading">
          <div>
            <h1>Campaigns</h1>
            <p>WhatsApp campaigns to members and leads, and the renewals and payments that followed.</p>
          </div>
        </div>
      )}

      <SummaryGrid>
        <SummaryCard icon={MessageCircle} tone="purple" label="Messages sent" value={String(totals.sent)} detail="Across all campaigns" loading={loading} />
        <SummaryCard icon={TrendingUp} tone="green" label="Converted" value={String(totals.converted)} detail="Renewed, paid, or joined" loading={loading} />
        <SummaryCard icon={BadgeIndianRupee} tone="blue" label="Revenue after messages" value={money.format(totals.revenue)} detail="Payments within each campaign's window" loading={loading} />
        <SummaryCard icon={Send} tone="amber" label="Waiting to send" value={String(totals.pending)} detail="People not messaged yet" loading={loading} />
      </SummaryGrid>

      {loading ? (
        <div className="cp-loading">
          <LoaderCircle size={22} className="plan-spinner" /> Loading campaigns…
        </div>
      ) : loadError ? (
        <Empty icon={Megaphone} label={loadError} />
      ) : !campaigns.length ? (
        canSend ? (
          <QuickStart onPick={setBuilderSegment} />
        ) : (
          <Empty icon={Megaphone} label="No campaigns yet" />
        )
      ) : (
        <>
          <Toolbar query={query} setQuery={setQuery} placeholder="Search campaigns">
            {(["All", "Active", "Completed"] as const).map((item) => (
              <Tab key={item} active={filter === item} onClick={() => setFilter(item)}>
                {item}
              </Tab>
            ))}
          </Toolbar>
          {visible.length ? (
            <div className="panel cp-table-wrap">
              <table className="cp-table">
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Progress</th>
                    <th>Converted</th>
                    <th>Revenue</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((campaign) => (
                    <tr key={campaign.id} onClick={() => setOpenId(campaign.id)} tabIndex={0} onKeyDown={(event) => event.key === "Enter" && setOpenId(campaign.id)}>
                      <td>
                        <strong>{campaign.name}</strong>
                        <div className="cp-table-sub">
                          <SegmentBadge segment={campaign.segment} />
                          <small>{dateFormat.format(new Date(campaign.createdAt))}</small>
                        </div>
                      </td>
                      <td>
                        <Progress summary={campaign.summary} />
                      </td>
                      <td>
                        <strong>{campaign.summary.converted}</strong>
                        <small>
                          {segmentMeta[campaign.segment].goalLabel.toLowerCase()} ·{" "}
                          {percent(campaign.summary.converted, campaign.summary.sent)}%
                        </small>
                      </td>
                      <td>
                        <strong>{money.format(Number(campaign.summary.revenue))}</strong>
                        <small>within {campaign.attributionDays} days</small>
                      </td>
                      <td>
                        <span className={`managed-status ${campaign.status === "ACTIVE" ? "warning" : "active"}`}>
                          {campaign.status === "ACTIVE" ? `${campaign.summary.pending} to send` : "Completed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty icon={Megaphone} label="No matching campaigns" />
          )}
        </>
      )}

      {builderSegment && (
        <CampaignBuilder
          initialSegment={builderSegment}
          close={() => setBuilderSegment(null)}
          onCreated={(id) => {
            setBuilderSegment(null);
            notify("Campaign ready to send");
            setOpenId(id);
          }}
        />
      )}
    </div>
  );
}

export default function CampaignsView() {
  const notify = useDashboardToast();
  return <Campaigns notify={notify} />;
}
