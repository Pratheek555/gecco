"use client";

import Link from "next/link";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Edit3,
  LoaderCircle,
  Mail,
  MessageCircle,
  Phone,
  PhoneCall,
  Plus,
  Target,
  Trophy,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader, SummaryCard, SummaryGrid, Tab, Toolbar } from "../_components/managed-page-ui";
import { useDashboardToast } from "../manage-shell";

type LeadStatus = "NEW" | "CONTACTED" | "TRIAL_BOOKED" | "TRIAL_COMPLETED" | "WON" | "LOST";
type LeadSource =
  "WALK_IN" | "REFERRAL" | "INSTAGRAM" | "FACEBOOK" | "GOOGLE" | "WEBSITE" | "PHONE" | "OTHER";
type ActivityType =
  "NOTE" | "CALL" | "WHATSAPP" | "EMAIL" | "STATUS_CHANGE" | "FOLLOW_UP" | "CONVERSION";

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
  lostReason: string | null;
  convertedAt: string | null;
  convertedMemberId: string | null;
  createdAt: string;
  updatedAt: string;
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
type LeadSummary = {
  active: number;
  dueToday: number;
  overdue: number;
  trials: number;
  converted: number;
  conversionRate: number;
};

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "TRIAL_BOOKED", label: "Trial booked" },
  { value: "TRIAL_COMPLETED", label: "Trial completed" },
  { value: "LOST", label: "Lost" },
];

const sourceOptions: { value: LeadSource; label: string }[] = [
  { value: "WALK_IN", label: "Walk-in" },
  { value: "REFERRAL", label: "Referral" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "GOOGLE", label: "Google" },
  { value: "WEBSITE", label: "Website" },
  { value: "PHONE", label: "Phone enquiry" },
  { value: "OTHER", label: "Other" },
];

const statusLabel = (status: LeadStatus) =>
  status === "WON"
    ? "Converted"
    : status
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/^./, (letter) => letter.toUpperCase());

const sourceLabel = (source: LeadSource) =>
  sourceOptions.find((item) => item.value === source)?.label ?? "Other";

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

function toLocalInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function followUpState(lead: Lead) {
  if (!lead.nextFollowUpAt || lead.status === "WON" || lead.status === "LOST") return "none";
  const due = new Date(lead.nextFollowUpAt);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (due < start) return "overdue";
  if (due < tomorrow) return "today";
  return "upcoming";
}

function LeadEditor({
  lead,
  close,
  onSaved,
}: {
  lead?: Lead;
  close: () => void;
  onSaved: () => Promise<void>;
}) {
  const [fullName, setFullName] = useState(lead?.fullName ?? "");
  const [phone, setPhone] = useState(lead?.phone ?? "");
  const [email, setEmail] = useState(lead?.email ?? "");
  const [source, setSource] = useState<LeadSource>(lead?.source ?? "WALK_IN");
  const [interestedPlan, setInterestedPlan] = useState(lead?.interestedPlan ?? "");
  const [status, setStatus] = useState<LeadStatus>(
    lead?.status === "WON" ? "TRIAL_COMPLETED" : (lead?.status ?? "NEW"),
  );
  const [nextFollowUpAt, setNextFollowUpAt] = useState(toLocalInput(lead?.nextFollowUpAt ?? null));
  const [lostReason, setLostReason] = useState(lead?.lostReason ?? "");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
          nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt).toISOString() : null,
          lostReason: status === "LOST" ? lostReason : null,
          note,
        }),
      });
      const result = await readJson<{ error?: string }>(response);
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

  return (
    <div
      className="modal-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-editor-title"
      onMouseDown={(event) => event.currentTarget === event.target && close()}
    >
      <form className="modal lead-editor" onSubmit={submit}>
        <div className="modal-header">
          <div>
            <h2 id="lead-editor-title">{lead ? "Edit lead" : "Add a new lead"}</h2>
            <p>
              {lead
                ? "Keep contact details and the next action current."
                : "Capture enough detail to follow up without losing context."}
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
        <div className="lead-form-grid">
          <label className="lead-form-full">
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
              onChange={(event) => setPhone(event.target.value)}
              maxLength={30}
              inputMode="tel"
              placeholder="+91 98765 43210"
              disabled={saving}
            />
          </label>
          <label>
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              maxLength={254}
              placeholder="riya@example.com"
              disabled={saving}
            />
          </label>
          <label>
            Source
            <select
              value={source}
              onChange={(event) => setSource(event.target.value as LeadSource)}
              disabled={saving}
            >
              {sourceOptions.map((item) => (
                <option value={item.value} key={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Interested in
            <select
              value={interestedPlan}
              onChange={(event) => setInterestedPlan(event.target.value as "" | "GT" | "PT")}
              disabled={saving}
            >
              <option value="">Not decided</option>
              <option value="GT">Gym training</option>
              <option value="PT">Personal training</option>
            </select>
          </label>
          {lead && (
            <label>
              Pipeline stage
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as LeadStatus)}
                disabled={saving}
              >
                {statusOptions.map((item) => (
                  <option value={item.value} key={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className={lead ? "" : "lead-form-full"}>
            Next follow-up
            <input
              type="datetime-local"
              value={nextFollowUpAt}
              onChange={(event) => setNextFollowUpAt(event.target.value)}
              disabled={saving}
            />
          </label>
          {status === "LOST" && (
            <label className="lead-form-full">
              Why was it lost?
              <textarea
                value={lostReason}
                onChange={(event) => setLostReason(event.target.value)}
                maxLength={500}
                rows={2}
                placeholder="Price, timing, location, no response…"
                disabled={saving}
              />
            </label>
          )}
          {!lead && (
            <label className="lead-form-full">
              First note <span>(optional)</span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={2000}
                rows={3}
                placeholder="Goals, preferred timing, questions, or anything useful for the next call."
                disabled={saving}
              />
            </label>
          )}
        </div>
        <p className="lead-form-hint">At least a phone number or email is required.</p>
        {error && (
          <p className="lead-form-error" role="alert">
            <AlertCircle size={15} />
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={close} disabled={saving}>
            Cancel
          </button>
          <button className="button primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : lead ? "Save changes" : "Add lead"}
          </button>
        </div>
      </form>
    </div>
  );
}

function LeadDrawer({
  leadId,
  close,
  onEdit,
  onChanged,
}: {
  leadId: string;
  close: () => void;
  onEdit: (lead: Lead) => void;
  onChanged: () => Promise<void>;
}) {
  const notify = useDashboardToast();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [activityType, setActivityType] = useState<"NOTE" | "CALL" | "WHATSAPP" | "EMAIL">("NOTE");
  const [activityBody, setActivityBody] = useState("");
  const [savingActivity, setSavingActivity] = useState(false);
  const [converting, setConverting] = useState(false);

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

  async function addActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activityBody.trim()) return;
    setSavingActivity(true);
    setError("");
    try {
      const response = await fetch(`/api/leads/${leadId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: activityType, body: activityBody }),
      });
      const result = await readJson<{ error?: string }>(response);
      if (!response.ok) throw new Error(result.error ?? "Could not save activity.");
      setActivityBody("");
      setReloadKey((key) => key + 1);
      await onChanged();
      notify("Lead activity saved");
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
      await onChanged();
      setReloadKey((key) => key + 1);
      notify(`${result.member?.fullName ?? "Lead"} is now a member`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not convert this lead.");
    } finally {
      setConverting(false);
    }
  }

  const whatsappNumber = lead?.phone?.replace(/\D/g, "") ?? "";
  return (
    <div
      className="drawer-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-drawer-title"
      onMouseDown={(event) => event.currentTarget === event.target && close()}
    >
      <aside className="lead-drawer">
        <div className="drawer-top">
          <span>Lead details</span>
          <div className="lead-drawer-actions">
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
          <div className="lead-detail-loading">
            <LoaderCircle className="plan-spinner" size={19} />
            Loading lead…
          </div>
        )}
        {error && (
          <div className="lead-detail-error" role="alert">
            <AlertCircle size={17} />
            {error}
          </div>
        )}
        {lead && (
          <>
            <section className="lead-profile">
              <span className="avatar lead-avatar">{initials(lead.fullName)}</span>
              <div>
                <span className={`lead-status ${lead.status.toLowerCase().replaceAll("_", "-")}`}>
                  {statusLabel(lead.status)}
                </span>
                <h2 id="lead-drawer-title">{lead.fullName}</h2>
                <p>
                  {sourceLabel(lead.source)} ·{" "}
                  {lead.interestedPlan === "PT"
                    ? "Personal training"
                    : lead.interestedPlan === "GT"
                      ? "Gym training"
                      : "Plan undecided"}
                </p>
              </div>
            </section>
            <section className="lead-contact-actions">
              {lead.phone && (
                <a href={`tel:${lead.phone}`}>
                  <Phone size={15} />
                  Call
                </a>
              )}
              {whatsappNumber && (
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer">
                  <MessageCircle size={15} />
                  WhatsApp
                </a>
              )}
              {lead.email && (
                <a href={`mailto:${lead.email}`}>
                  <Mail size={15} />
                  Email
                </a>
              )}
            </section>
            <section className={`lead-next-action ${followUpState(lead)}`}>
              <CalendarClock size={18} />
              <div>
                <small>Next follow-up</small>
                <strong>{formatDateTime(lead.nextFollowUpAt)}</strong>
                {followUpState(lead) === "overdue" && (
                  <span>Overdue — update after contacting</span>
                )}
              </div>
            </section>
            {lead.convertedMember && (
              <Link
                className="lead-converted-link"
                href={`/members?member=${lead.convertedMember.id}`}
              >
                <UserCheck size={17} />
                <span>
                  <strong>Converted member</strong>
                  <small>#{lead.convertedMember.memberNumber}</small>
                </span>
                <ChevronRight size={16} />
              </Link>
            )}
            {!lead.convertedMemberId && lead.status !== "LOST" && (
              <button
                className="button primary lead-convert"
                onClick={() => void convertLead()}
                disabled={converting}
              >
                <Trophy size={16} />
                {converting ? "Converting…" : "Convert to member"}
              </button>
            )}
            {!lead.convertedMemberId && (
              <section className="lead-activity-composer">
                <div>
                  <h3>Log an activity</h3>
                  <p>Keep the full follow-up history with the lead.</p>
                </div>
                <form onSubmit={addActivity}>
                  <select
                    value={activityType}
                    onChange={(event) => setActivityType(event.target.value as typeof activityType)}
                    disabled={savingActivity}
                  >
                    <option value="NOTE">Note</option>
                    <option value="CALL">Call</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="EMAIL">Email</option>
                  </select>
                  <textarea
                    value={activityBody}
                    onChange={(event) => setActivityBody(event.target.value)}
                    maxLength={2000}
                    rows={3}
                    placeholder="What happened? Add useful context for the next follow-up."
                    disabled={savingActivity}
                  />
                  <button
                    className="button secondary"
                    disabled={savingActivity || !activityBody.trim()}
                  >
                    {savingActivity ? "Saving…" : "Save activity"}
                  </button>
                </form>
              </section>
            )}
            <section className="lead-history">
              <div className="lead-section-head">
                <h3>Activity history</h3>
                <span>{lead.activities.length} updates</span>
              </div>
              {lead.activities.length ? (
                <div className="lead-timeline">
                  {lead.activities.map((activity) => (
                    <article key={activity.id}>
                      <span className={`lead-activity-icon ${activity.type.toLowerCase()}`}>
                        {activity.type === "CALL" ? (
                          <PhoneCall size={14} />
                        ) : activity.type === "EMAIL" ? (
                          <Mail size={14} />
                        ) : activity.type === "CONVERSION" ? (
                          <Trophy size={14} />
                        ) : activity.type === "FOLLOW_UP" ? (
                          <CalendarClock size={14} />
                        ) : (
                          <MessageCircle size={14} />
                        )}
                      </span>
                      <div>
                        <strong>{activity.type.toLowerCase().replaceAll("_", " ")}</strong>
                        <p>{activity.body}</p>
                        <small>
                          {activity.createdBy?.fullName ?? "Team member"} ·{" "}
                          {formatDateTime(activity.createdAt)}
                        </small>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="lead-empty-history">No activity yet.</p>
              )}
            </section>
          </>
        )}
      </aside>
    </div>
  );
}

export default function Leads() {
  const notify = useDashboardToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [summary, setSummary] = useState<LeadSummary>({
    active: 0,
    dueToday: 0,
    overdue: 0,
    trials: 0,
    converted: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Active" | "Follow-ups" | "Converted" | "Lost">(
    "All",
  );
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    try {
      const response = await fetch("/api/leads");
      const result = await readJson<{ leads?: Lead[]; summary?: LeadSummary; error?: string }>(
        response,
      );
      if (!response.ok || !result.leads || !result.summary)
        throw new Error(result.error ?? "Could not load leads.");
      setLeads(result.leads);
      setSummary(result.summary);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load leads.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/leads");
        const result = await readJson<{
          leads?: Lead[];
          summary?: LeadSummary;
          error?: string;
        }>(response);
        if (!response.ok || !result.leads || !result.summary) {
          throw new Error(result.error ?? "Could not load leads.");
        }
        if (!cancelled) {
          setLeads(result.leads);
          setSummary(result.summary);
          setError("");
        }
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
  }, []);

  const visible = useMemo(
    () =>
      leads.filter((lead) => {
        const matchesQuery =
          `${lead.fullName} ${lead.phone ?? ""} ${lead.email ?? ""} ${sourceLabel(lead.source)}`
            .toLowerCase()
            .includes(query.trim().toLowerCase());
        const state = followUpState(lead);
        const matchesFilter =
          filter === "All" ||
          (filter === "Active" && lead.status !== "WON" && lead.status !== "LOST") ||
          (filter === "Follow-ups" && (state === "today" || state === "overdue")) ||
          (filter === "Converted" && lead.status === "WON") ||
          (filter === "Lost" && lead.status === "LOST");
        return matchesQuery && matchesFilter;
      }),
    [filter, leads, query],
  );

  return (
    <>
      <PageHeader
        eyebrow="WORKSPACE · SALES"
        title="Leads"
        copy="Capture every enquiry, stay on top of follow-ups, and turn interest into memberships."
        action="Add lead"
        icon={Plus}
        onAction={() => setAdding(true)}
      />
      <SummaryGrid>
        <SummaryCard
          icon={Users}
          tone="violet"
          label="Active leads"
          value={String(summary.active)}
          detail="Still moving through the pipeline"
          loading={loading}
        />
        <SummaryCard
          icon={Clock3}
          tone={summary.overdue ? "amber" : "blue"}
          label="Follow-ups"
          value={String(summary.dueToday + summary.overdue)}
          detail={
            summary.overdue
              ? `${summary.overdue} overdue · ${summary.dueToday} due today`
              : `${summary.dueToday} due today`
          }
          loading={loading}
        />
        <SummaryCard
          icon={Target}
          tone="blue"
          label="Trials in progress"
          value={String(summary.trials)}
          detail="Booked or completed trials"
          loading={loading}
        />
        <SummaryCard
          icon={Trophy}
          tone="green"
          label="Conversion rate"
          value={`${summary.conversionRate}%`}
          detail={`${summary.converted} leads converted`}
          loading={loading}
        />
      </SummaryGrid>
      <Toolbar query={query} setQuery={setQuery} placeholder="Search name, phone, email, or source">
        {(["All", "Active", "Follow-ups", "Converted", "Lost"] as const).map((item) => (
          <Tab key={item} active={filter === item} onClick={() => setFilter(item)}>
            {item}
          </Tab>
        ))}
      </Toolbar>
      <section className="panel lead-table-panel">
        <div className="lead-table-heading">
          <div>
            <h2>Lead pipeline</h2>
            <p>Prioritised by the next follow-up, then recent activity.</p>
          </div>
          <span>
            {visible.length} of {leads.length}
          </span>
        </div>
        <div className="lead-table-scroll">
          <table className="lead-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Stage</th>
                <th>Interest & source</th>
                <th>Next follow-up</th>
                <th>Last contact</th>
                <th>
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6}>
                    <div className="lead-table-state">
                      <LoaderCircle className="plan-spinner" size={20} />
                      Loading leads…
                    </div>
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={6}>
                    <div className="lead-table-state error">
                      <AlertCircle size={20} />
                      {error}
                      <button onClick={() => void loadLeads()}>Try again</button>
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                visible.map((lead) => {
                  const followUp = followUpState(lead);
                  return (
                    <tr key={lead.id} onClick={() => setSelectedLeadId(lead.id)}>
                      <td>
                        <div className="lead-person">
                          <span className="avatar lead-list-avatar">{initials(lead.fullName)}</span>
                          <span>
                            <strong>{lead.fullName}</strong>
                            <small>{lead.phone ?? lead.email ?? "No contact details"}</small>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`lead-status ${lead.status.toLowerCase().replaceAll("_", "-")}`}
                        >
                          {statusLabel(lead.status)}
                        </span>
                      </td>
                      <td>
                        <strong className="lead-cell-primary">
                          {lead.interestedPlan === "PT"
                            ? "Personal training"
                            : lead.interestedPlan === "GT"
                              ? "Gym training"
                              : "Undecided"}
                        </strong>
                        <small className="lead-cell-secondary">{sourceLabel(lead.source)}</small>
                      </td>
                      <td>
                        <span className={`lead-follow-up ${followUp}`}>
                          <CalendarClock size={14} />
                          <span>
                            <strong>
                              {lead.nextFollowUpAt
                                ? formatDateTime(lead.nextFollowUpAt)
                                : "Not scheduled"}
                            </strong>
                            {followUp === "overdue" && <small>Overdue</small>}
                            {followUp === "today" && <small>Due today</small>}
                          </span>
                        </span>
                      </td>
                      <td>
                        {lead.lastContactedAt ? (
                          formatDateTime(lead.lastContactedAt)
                        ) : (
                          <span className="lead-muted">Not contacted</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="lead-row-button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedLeadId(lead.id);
                          }}
                          aria-label={`View ${lead.fullName}`}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              {!loading && !error && !visible.length && (
                <tr>
                  <td colSpan={6}>
                    <div className="lead-table-state">
                      <Target size={21} />
                      <strong>No leads found</strong>
                      <span>
                        {leads.length
                          ? "Try another search or filter."
                          : "Add your first enquiry to start the pipeline."}
                      </span>
                      {!leads.length && <button onClick={() => setAdding(true)}>Add a lead</button>}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!loading && !error && (
          <div className="table-footer">
            <span>
              Showing <strong>{visible.length}</strong> of <strong>{leads.length}</strong> leads
            </span>
            <span className="lead-data-note">
              <CheckCircle2 size={14} />
              Updates are shared with your gym team
            </span>
          </div>
        )}
      </section>
      {adding && (
        <LeadEditor
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
          close={() => setEditing(null)}
          onSaved={async () => {
            await loadLeads();
            notify("Lead updated successfully");
          }}
        />
      )}
      {selectedLeadId && (
        <LeadDrawer
          leadId={selectedLeadId}
          close={() => setSelectedLeadId(null)}
          onEdit={(lead) => {
            setEditing(lead);
            setSelectedLeadId(null);
          }}
          onChanged={loadLeads}
        />
      )}
    </>
  );
}
