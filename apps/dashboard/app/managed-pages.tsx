"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  CreditCard,
  Download,
  Dumbbell,
  IndianRupee,
  LoaderCircle,
  MessageCircle,
  MoreHorizontal,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type ManagedView = "Overview" | "Members" | "Memberships" | "Trainers" | "Reports" | "Automations";
type Notify = (message: string) => void;

type PlanOption = { id: string; code: string; name: string; type: "GT" | "PT"; standardMonthlyFee: string | number; isActive: boolean };
type MembershipRecord = {
  id: string;
  startsOn: string;
  endsOn: string;
  agreedFee: string | number;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  member: { id: string; fullName: string };
  plan: { id: string; name: string; code: string };
  trainerAssignments: { trainer: { id: string; fullName: string } }[];
};
type PlanCard = {
  id: string;
  code: string;
  name: string;
  detail: string;
  price: string;
  cadence: string;
  members: number;
  revenue: string;
  growth: string;
  state: "Active" | "Archived";
  tone: string;
};

function planToCard(plan: PlanOption): PlanCard {
  return {
    id: plan.id,
    code: plan.code,
    name: plan.name,
    detail: `${plan.type === "GT" ? "Gym Training" : "Personal Training"} · ${plan.code}`,
    price: new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(plan.standardMonthlyFee)),
    cadence: "/ month",
    members: 0,
    revenue: "₹0",
    growth: "—",
    state: plan.isActive ? "Active" : "Archived",
    tone: plan.type === "GT" ? "purple" : "blue",
  };
}

const trainers = [
  { name: "Arjun Malhotra", initials: "AM", focus: "Strength & conditioning", clients: 42, sessions: 28, rating: "4.9", load: 82, state: "Busy", next: "10:30 AM", color: "violet" },
  { name: "Meera Nair", initials: "MN", focus: "Mobility & yoga", clients: 36, sessions: 22, rating: "4.8", load: 64, state: "Available", next: "1:00 PM", color: "pink" },
  { name: "Vikram Shah", initials: "VS", focus: "HIIT & functional", clients: 39, sessions: 25, rating: "4.9", load: 76, state: "Busy", next: "11:15 AM", color: "blue" },
  { name: "Sana Qureshi", initials: "SQ", focus: "Nutrition & wellness", clients: 28, sessions: 18, rating: "4.7", load: 51, state: "Available", next: "2:30 PM", color: "amber" },
];

const workflowSeed = [
  { id: 1, name: "Welcome new members", detail: "Send a welcome message and onboarding guide after signup.", trigger: "Member joins", runs: "128 runs", success: "98.4%", active: true, icon: UserPlus, tone: "purple" },
  { id: 2, name: "Failed payment recovery", detail: "Retry payment and notify the member over WhatsApp.", trigger: "Payment fails", runs: "31 runs", success: "87.1%", active: true, icon: CreditCard, tone: "red" },
  { id: 3, name: "Win back inactive members", detail: "Reach out when a member has not visited for 14 days.", trigger: "14 days inactive", runs: "64 runs", success: "72.6%", active: true, icon: MessageCircle, tone: "blue" },
  { id: 4, name: "Renewal reminder", detail: "Remind members seven and two days before renewal.", trigger: "Renewal approaching", runs: "92 runs", success: "96.8%", active: false, icon: CalendarDays, tone: "amber" },
];

function PageHeader({ eyebrow, title, copy, action, icon: Icon = Plus, onAction, secondaryAction, onSecondaryAction }: { eyebrow: string; title: string; copy: string; action: string; icon?: LucideIcon; onAction: () => void; secondaryAction?: string; onSecondaryAction?: () => void }) {
  const parent = eyebrow.includes("WORKSPACE") ? "Workspace" : "Manage";
  return <div className="page-heading managed-heading"><div><p className="managed-breadcrumb" title={eyebrow}>{parent} <ChevronRight size={12} /> {title}</p><h1>{title}</h1><p>{copy}</p></div><div className="heading-actions">{secondaryAction && <button className="button secondary" onClick={onSecondaryAction}><UserPlus size={16} />{secondaryAction}</button>}<button className="button primary" onClick={onAction}><Icon size={16} />{action}</button></div></div>;
}

function SummaryCard({ icon: Icon, tone, label, value, detail }: { icon: LucideIcon; tone: string; label: string; value: string; detail: string }) {
  return <article className="managed-stat"><span className={`managed-stat-icon ${tone}`}><Icon size={18} /></span><div><small>{label}</small><strong>{value}</strong><em>{detail}</em></div></article>;
}

function SummaryGrid({ children }: { children: React.ReactNode }) {
  return <section className="managed-stats">{children}</section>;
}

function Toolbar({ query, setQuery, placeholder, children }: { query: string; setQuery: (value: string) => void; placeholder: string; children: React.ReactNode }) {
  return <div className="managed-toolbar"><label><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} /></label><div className="managed-tabs">{children}</div></div>;
}

function Tab({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button className={active ? "active" : ""} onClick={onClick}>{children}</button>;
}

function AddPlanModal({ close, onCreated }: { close: () => void; onCreated: (plan: PlanCard) => void }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<"GT" | "PT">("GT");
  const [monthlyFee, setMonthlyFee] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, name, type, standardMonthlyFee: monthlyFee, isActive }),
      });
      const data = await response.json() as { error?: string; id?: string; code?: string; name?: string; type?: "GT" | "PT"; standardMonthlyFee?: string | number; isActive?: boolean };
      if (!response.ok) throw new Error(data.error ?? "Could not create the plan.");

      if (!data.id || !data.code || !data.name || !data.type || data.standardMonthlyFee === undefined) throw new Error("The created plan response was incomplete.");
      onCreated(planToCard({ id: data.id, code: data.code, name: data.name, type: data.type, standardMonthlyFee: data.standardMonthlyFee, isActive: data.isActive ?? isActive }));
      close();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create the plan.");
    } finally {
      setSubmitting(false);
    }
  }

  return <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="add-plan-title" onMouseDown={event => event.currentTarget === event.target && close()}><form className="modal" onSubmit={submit}><div className="modal-header"><div><h2 id="add-plan-title">Add plan</h2><p>Create a membership plan for your gym.</p></div><button type="button" className="icon-button" onClick={close} aria-label="Close" disabled={submitting}><X size={18} /></button></div><div className="form-row"><label>Plan code<input required autoFocus value={code} onChange={event => setCode(event.target.value)} placeholder="e.g. GT-MONTHLY" disabled={submitting} /></label><label>Plan type<select value={type} onChange={event => setType(event.target.value as "GT" | "PT")} disabled={submitting}><option value="GT">Gym Training</option><option value="PT">Personal Training</option></select></label></div><label>Plan name<input required value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Monthly Flex" disabled={submitting} /></label><label>Monthly fee<input required type="number" min="0" step="0.01" value={monthlyFee} onChange={event => setMonthlyFee(event.target.value)} placeholder="₹ 0" disabled={submitting} /></label><label className="plan-active-toggle"><input type="checkbox" checked={isActive} onChange={event => setIsActive(event.target.checked)} disabled={submitting} /> Make this plan active</label>{error && <p role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button secondary" onClick={close} disabled={submitting}>Cancel</button><button className="button primary" type="submit" disabled={submitting}>{submitting ? "Creating…" : "Create plan"}</button></div></form></div>;
}

type MemberOption = { id: string; fullName: string };

function dateInputValue(date: Date) { return date.toISOString().slice(0, 10); }

function AssignPlanModal({ close, onAssigned }: { close: () => void; onAssigned: () => void }) {
  const today = dateInputValue(new Date());
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [availablePlans, setAvailablePlans] = useState<PlanOption[]>([]);
  const [memberId, setMemberId] = useState("");
  const [planId, setPlanId] = useState("");
  const [startsOn, setStartsOn] = useState(today);
  const [endsOn, setEndsOn] = useState(dateInputValue(nextMonth));
  const [agreedFee, setAgreedFee] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { void (async () => {
    try {
      const [membersResponse, plansResponse] = await Promise.all([fetch("/api/members/allMembers"), fetch("/api/plans")]);
      const membersData = await membersResponse.json() as { members?: MemberOption[]; error?: string };
      const plansData = await plansResponse.json() as { plans?: PlanOption[]; error?: string };
      if (!membersResponse.ok || !plansResponse.ok || !membersData.members || !plansData.plans) throw new Error(membersData.error ?? plansData.error ?? "Could not load members and plans.");
      setMembers(membersData.members);
      setAvailablePlans(plansData.plans.filter(plan => plan.isActive));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load members and plans."); }
    finally { setLoading(false); }
  })(); }, []);

  function selectPlan(id: string) { setPlanId(id); const plan = availablePlans.find(item => item.id === id); if (plan) setAgreedFee(String(plan.standardMonthlyFee)); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true); setError("");
    try {
      const response = await fetch(`/api/members/${memberId}/memberships`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId, startsOn, endsOn, agreedFee }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not assign the plan.");
      onAssigned(); close();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not assign the plan."); }
    finally { setSubmitting(false); }
  }

  return <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="assign-plan-title" onMouseDown={event => event.currentTarget === event.target && close()}><form className="modal" onSubmit={submit}><div className="modal-header"><div><h2 id="assign-plan-title">Assign plan</h2><p>Give a member an active membership plan.</p></div><button type="button" className="icon-button" onClick={close} aria-label="Close" disabled={submitting}><X size={18} /></button></div>{loading && <div className="modal-loading" role="status"><LoaderCircle className="plan-spinner" size={16} /> Loading members and plans…</div>}<label>Member<select required autoFocus value={memberId} onChange={event => setMemberId(event.target.value)} disabled={loading || submitting}><option value="" disabled>Select a member</option>{members.map(member => <option key={member.id} value={member.id}>{member.fullName}</option>)}</select></label><label>Plan<select required value={planId} onChange={event => selectPlan(event.target.value)} disabled={loading || submitting}><option value="" disabled>{availablePlans.length ? "Select an active plan" : "No active plans available"}</option>{availablePlans.map(plan => <option key={plan.id} value={plan.id}>{plan.name} ({plan.code}) · ₹{plan.standardMonthlyFee}</option>)}</select></label><div className="form-row"><label>Starts on<input required type="date" value={startsOn} onChange={event => setStartsOn(event.target.value)} disabled={submitting} /></label><label>Ends on<input required type="date" value={endsOn} onChange={event => setEndsOn(event.target.value)} disabled={submitting} /></label></div><label>Agreed fee<input required type="number" min="0" step="0.01" value={agreedFee} onChange={event => setAgreedFee(event.target.value)} placeholder="₹ 0" disabled={submitting} /></label>{error && <p role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button secondary" onClick={close} disabled={submitting}>Cancel</button><button className="button primary" type="submit" disabled={loading || submitting || !memberId || !planId}>{submitting ? "Assigning…" : "Assign plan"}</button></div></form></div>;
}

function Memberships({ notify }: { notify: Notify }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Active" | "Archived">("All");
  const [items, setItems] = useState<PlanCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [memberships, setMemberships] = useState<MembershipRecord[]>([]);
  const [membershipsLoading, setMembershipsLoading] = useState(true);
  const [membershipsError, setMembershipsError] = useState("");
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [isAssignPlanOpen, setIsAssignPlanOpen] = useState(false);
  const visible = useMemo(() => items.filter((plan) => (filter === "All" || plan.state === filter) && `${plan.name} ${plan.detail}`.toLowerCase().includes(query.toLowerCase())), [filter, items, query]);
  useEffect(() => { void (async () => {
    try {
      const response = await fetch("/api/plans");
      const data = await response.json() as { plans?: PlanOption[]; error?: string };
      if (!response.ok || !data.plans) throw new Error(data.error ?? "Could not load membership plans.");
      setItems(data.plans.map(planToCard));
    } catch (reason) { setLoadError(reason instanceof Error ? reason.message : "Could not load membership plans."); }
    finally { setLoading(false); }
  })(); }, []);
  useEffect(() => { void (async () => {
    try {
      const response = await fetch("/api/memberships");
      const data = await response.json() as { memberships?: MembershipRecord[]; error?: string };
      if (!response.ok || !data.memberships) throw new Error(data.error ?? "Could not load active memberships.");
      setMemberships(data.memberships);
    } catch (reason) { setMembershipsError(reason instanceof Error ? reason.message : "Could not load active memberships."); }
    finally { setMembershipsLoading(false); }
  })(); }, []);
  return <>
    <PageHeader eyebrow="MEMBERSHIP MANAGEMENT" title="Memberships" copy="Create plans, track adoption, and stay ahead of upcoming renewals." action="Create plan" onAction={() => setIsAddPlanOpen(true)} secondaryAction="Assign plan" onSecondaryAction={() => setIsAssignPlanOpen(true)} />
    <SummaryGrid>
      <SummaryCard icon={Users} tone="purple" label="Active memberships" value="1,284" detail="+4.8% from last month" />
      <SummaryCard icon={WalletCards} tone="green" label="Recurring revenue" value="₹12.8L" detail="₹97K above last month" />
      <SummaryCard icon={CalendarDays} tone="blue" label="Renewing this month" value="164" detail="82% set to auto-renew" />
      <SummaryCard icon={TrendingUp} tone="amber" label="Average plan value" value="₹2,642" detail="+6.2% over 90 days" />
    </SummaryGrid>
    <Toolbar query={query} setQuery={setQuery} placeholder="Search membership plans"><Tab active={filter === "All"} onClick={() => setFilter("All")}>All</Tab><Tab active={filter === "Active"} onClick={() => setFilter("Active")}>Active</Tab><Tab active={filter === "Archived"} onClick={() => setFilter("Archived")}>Archived</Tab></Toolbar>
    <section className="plan-grid">{loading ? <LoadingPlans /> : loadError ? <Empty icon={CreditCard} label={loadError} /> : visible.map((plan) => <article className="panel plan-card" key={plan.id}>
      <div className="plan-top"><span className={`managed-glyph ${plan.tone}`}><CreditCard size={19} /></span><span className={`managed-status ${plan.state === "Active" ? "active" : "paused"}`}>{plan.state}</span><button className="icon-button small" aria-label={`${plan.name} options`} onClick={() => notify(`${plan.name} options opened`)}><MoreHorizontal size={17} /></button></div>
      <h2>{plan.name}</h2><p>{plan.detail}</p><div className="plan-price"><strong>{plan.price}</strong><span>{plan.cadence}</span></div>
      <div className="plan-data"><div><small>Members</small><strong>{plan.members}</strong></div><div><small>Revenue</small><strong>{plan.revenue}</strong></div></div>
      <button className="managed-row-action" onClick={() => notify(`${plan.name} opened for editing`)}>Manage plan <ChevronRight size={15} /></button>
    </article>)}{!loading && !loadError && visible.length === 0 && <Empty icon={CreditCard} label="No matching plans" />}</section>
    <Renewals notify={notify} memberships={memberships} loading={membershipsLoading} error={membershipsError} onDeleted={membershipId => setMemberships(current => current.filter(membership => membership.id !== membershipId))} />
    {isAddPlanOpen && <AddPlanModal close={() => setIsAddPlanOpen(false)} onCreated={plan => { setItems(current => [plan, ...current]); notify("Membership plan created successfully"); }} />}
    {isAssignPlanOpen && <AssignPlanModal close={() => setIsAssignPlanOpen(false)} onAssigned={() => notify("Plan assigned successfully")} />}
  </>;
}

function Renewals({ notify, memberships, loading, error, onDeleted }: { notify: Notify; memberships: MembershipRecord[]; loading: boolean; error: string; onDeleted: (membershipId: string) => void }) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  async function deleteMembership(membership: MembershipRecord) {
    if (!window.confirm(`Cancel ${membership.member.fullName}'s ${membership.plan.name} membership?`)) return;
    const response = await fetch(`/api/memberships/${membership.id}`, { method: "DELETE" });
    const data = await response.json() as { error?: string };
    if (!response.ok) { notify(data.error ?? "Could not delete membership."); return; }
    onDeleted(membership.id);
    notify("Membership deleted successfully");
  }
  return <article className="panel managed-table-panel"><div className="managed-card-head"><div><h2>Active memberships</h2><p>All active memberships, status, and trainer assignments</p></div><button onClick={() => notify("All active memberships opened")}>View all <ChevronRight size={14} /></button></div><div className="member-table-wrap"><table className="member-table"><thead><tr><th>Member</th><th>Plan</th><th>Ends</th><th>Amount</th><th>Status</th><th>Trainer</th><th aria-label="Actions" /></tr></thead><tbody>{loading ? <tr><td colSpan={7}><div className="payment-empty"><LoaderCircle size={22} className="plan-spinner" /><strong>Loading memberships</strong><span>Fetching active memberships…</span></div></td></tr> : error ? <tr><td colSpan={7}><div className="payment-empty"><strong>Could not load memberships</strong><span>{error}</span></div></td></tr> : memberships.length === 0 ? <tr><td colSpan={7}><div className="payment-empty"><strong>No active memberships</strong><span>Assign a plan to a member to see it here.</span></div></td></tr> : memberships.map((membership) => <tr key={membership.id}><td><div className="member-cell"><span className="avatar violet">{membership.member.fullName.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase()}</span><strong>{membership.member.fullName}</strong></div></td><td><div><strong>{membership.plan.name}</strong><small>{membership.plan.code}</small></div></td><td>{new Date(membership.endsOn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td><td><strong>₹{Number(membership.agreedFee).toLocaleString("en-IN")}</strong></td><td><span className="managed-status active">{membership.status === "ACTIVE" ? "Active" : membership.status}</span></td><td>{membership.trainerAssignments[0]?.trainer.fullName ?? <span className="last-visit">Unassigned</span>}</td><td className="membership-actions"><button className="icon-button small" aria-label={`Actions for ${membership.member.fullName}`} onClick={() => setOpenMenu(current => current === membership.id ? null : membership.id)}><MoreHorizontal size={17} /></button>{openMenu === membership.id && <div className="membership-menu" role="menu"><button role="menuitem" onClick={() => { setOpenMenu(null); notify(`Edit opened for ${membership.member.fullName}'s membership`); }}>Edit</button><button role="menuitem" onClick={() => { setOpenMenu(null); void deleteMembership(membership); }}>Delete</button></div>}</td></tr>)}</tbody></table></div></article>;
}

function Trainers({ notify }: { notify: Notify }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Available" | "Busy">("All");
  const visible = trainers.filter((trainer) => (filter === "All" || trainer.state === filter) && `${trainer.name} ${trainer.focus}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <PageHeader eyebrow="TEAM & SCHEDULING" title="Trainers" copy="Balance coaching load, schedules, and client outcomes in one place." action="Add trainer" icon={UserPlus} onAction={() => notify("Trainer invitation form opened")} />
    <SummaryGrid><SummaryCard icon={Dumbbell} tone="purple" label="Active trainers" value="18" detail="14 on the floor today" /><SummaryCard icon={CalendarDays} tone="blue" label="Sessions this week" value="126" detail="+9.6% from last week" /><SummaryCard icon={Sparkles} tone="amber" label="Average rating" value="4.8" detail="Across 342 reviews" /><SummaryCard icon={Activity} tone="green" label="Capacity used" value="72%" detail="36 open slots this week" /></SummaryGrid>
    <Toolbar query={query} setQuery={setQuery} placeholder="Search trainers or specialties"><Tab active={filter === "All"} onClick={() => setFilter("All")}>All</Tab><Tab active={filter === "Available"} onClick={() => setFilter("Available")}>Available</Tab><Tab active={filter === "Busy"} onClick={() => setFilter("Busy")}>Busy</Tab></Toolbar>
    <section className="trainer-layout"><div className="trainer-grid">{visible.map((trainer) => <article className="panel trainer-card" key={trainer.name}>
      <div className="trainer-head"><span className={`avatar trainer-avatar ${trainer.color}`}>{trainer.initials}</span><div><h2>{trainer.name}</h2><p>{trainer.focus}</p></div><span className={`managed-status ${trainer.state === "Available" ? "active" : "warning"}`}>{trainer.state}</span></div>
      <div className="trainer-data"><div><strong>{trainer.clients}</strong><small>Clients</small></div><div><strong>{trainer.sessions}</strong><small>Sessions</small></div><div><strong>{trainer.rating}</strong><small>Rating</small></div></div>
      <div className="capacity"><div><span>Weekly capacity</span><strong>{trainer.load}%</strong></div><span><i style={{ width: `${trainer.load}%` }} /></span></div>
      <div className="trainer-foot"><span><Clock3 size={14} />Next at {trainer.next}</span><button className="button secondary" onClick={() => notify(`${trainer.name}'s schedule opened`)}>View schedule</button></div>
    </article>)}{visible.length === 0 && <Empty icon={Users} label="No matching trainers" />}</div><Schedule notify={notify} /></section>
  </>;
}

function Schedule({ notify }: { notify: Notify }) {
  const sessions = [["10:30", "Rahul Jain", "Strength with Arjun"], ["11:15", "Ishita Rao", "HIIT with Vikram"], ["13:00", "Neha Sharma", "Mobility with Meera"], ["14:30", "Aarav Mehta", "Wellness with Sana"]];
  return <article className="panel schedule-card"><div className="managed-card-head"><div><h2>Today’s schedule</h2><p>9 sessions remaining</p></div><button className="icon-button small" onClick={() => notify("Team calendar opened")}><CalendarDays size={16} /></button></div><div className="schedule-list">{sessions.map(([time, client, detail], index) => <button key={time} onClick={() => notify(`${client}'s session opened`)}><time>{time}</time><i className={index === 0 ? "now" : ""} /><span><strong>{client}</strong><small>{detail}</small></span><ChevronRight size={14} /></button>)}</div><div className="schedule-slot"><Clock3 size={16} /><span><strong>Next open slot</strong><small>3:15 PM with Meera Nair</small></span><button onClick={() => notify("Session booking opened")}>Book</button></div></article>;
}

function Reports({ notify }: { notify: Notify }) {
  const [metric, setMetric] = useState<"Revenue" | "Members" | "Attendance">("Revenue");
  const [period, setPeriod] = useState("30 days");
  const data = metric === "Revenue" ? [48, 56, 51, 68, 73, 79, 88, 91, 84, 97, 94, 100] : metric === "Members" ? [52, 55, 58, 61, 65, 70, 74, 79, 83, 89, 94, 98] : [71, 68, 79, 74, 88, 82, 91, 77, 93, 89, 96, 86];
  function exportReport(name = "Performance report") { const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob(["Metric,Value\nRevenue,1280000\nMembers,1284\nVisits,12482"], { type: "text/csv" })); link.download = "gymwise-report.csv"; link.click(); URL.revokeObjectURL(link.href); notify(`${name} exported`); }
  return <>
    <PageHeader eyebrow="BUSINESS INTELLIGENCE" title="Reports" copy="Understand performance, spot trends, and share what matters." action="Export report" icon={Download} onAction={() => exportReport()} />
    <SummaryGrid><SummaryCard icon={WalletCards} tone="green" label="Gross revenue" value="₹12.8L" detail="+8.2% vs last month" /><SummaryCard icon={Users} tone="purple" label="Net growth" value="+58" detail="136 joins, 78 cancellations" /><SummaryCard icon={Activity} tone="blue" label="Total visits" value="12,482" detail="+12.4% vs last month" /><SummaryCard icon={TrendingUp} tone="amber" label="Revenue per member" value="₹997" detail="+3.1% vs last month" /></SummaryGrid>
    <section className="report-layout"><article className="panel report-chart"><div className="report-head"><div><small>PERFORMANCE OVERVIEW</small><h2>{metric === "Revenue" ? "₹12.8L" : metric === "Members" ? "1,284" : "12,482"}</h2><p><strong><ArrowUpRight size={13} />{metric === "Revenue" ? "8.2" : metric === "Members" ? "4.8" : "12.4"}%</strong> compared with last month</p></div><label className="managed-select"><CalendarDays size={15} /><select value={period} onChange={(event) => setPeriod(event.target.value)}><option>7 days</option><option>30 days</option><option>90 days</option></select><ChevronDown size={14} /></label></div><div className="report-tabs">{(["Revenue", "Members", "Attendance"] as const).map((item) => <Tab key={item} active={metric === item} onClick={() => setMetric(item)}>{item}</Tab>)}</div><div className="report-bars">{data.map((height, index) => <div key={index}><span><i style={{ height: `${height}%` }} /></span><small>{["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"][index]}</small></div>)}</div></article><Insights notify={notify} /></section>
    <section className="saved-section"><div className="section-title"><div><h2>Saved reports</h2><p>Ready-to-share views for your team.</p></div><button className="button secondary" onClick={() => notify("Custom report builder opened")}><Plus size={15} />New report</button></div><div className="saved-grid">{[["Monthly business review", "Revenue, growth and retention", "Today", "purple"], ["Trainer performance", "Sessions, ratings and capacity", "Yesterday", "blue"], ["Member retention cohort", "Joins, churn and engagement", "3 days ago", "green"]].map(([name, detail, updated, tone]) => <article className="panel saved-report" key={name}><span className={`managed-glyph ${tone}`}><BarChart3 size={19} /></span><div><h3>{name}</h3><p>{detail}</p><small>Updated {updated}</small></div><button className="icon-button small" onClick={() => exportReport(name)}><Download size={16} /></button></article>)}</div></section>
  </>;
}

function Insights({ notify }: { notify: Notify }) {
  return <article className="panel insights-card"><div className="managed-card-head"><div><h2>AI insights</h2><p>What changed this period</p></div><Sparkles size={18} /></div><div className="insight-list"><div className="green"><ArrowUpRight size={16} /><span><strong>Annual plans are accelerating</strong><small>Conversions rose 18% after the July offer.</small></span></div><div className="amber"><Clock3 size={16} /><span><strong>Friday evenings are at capacity</strong><small>Add one trainer between 6–8 PM.</small></span></div><div className="blue"><Users size={16} /><span><strong>New-member retention improved</strong><small>Onboarding lifted repeat visits by 9%.</small></span></div></div><button className="managed-row-action" onClick={() => notify("Detailed insights opened")}>Explore all insights <ChevronRight size={14} /></button></article>;
}

function Automations({ notify }: { notify: Notify }) {
  const [items, setItems] = useState(workflowSeed);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Active" | "Paused">("All");
  const visible = items.filter((item) => (filter === "All" || (filter === "Active" ? item.active : !item.active)) && `${item.name} ${item.trigger}`.toLowerCase().includes(query.toLowerCase()));
  function toggle(id: number) { const item = items.find((entry) => entry.id === id); setItems((current) => current.map((entry) => entry.id === id ? { ...entry, active: !entry.active } : entry)); notify(`${item?.name} ${item?.active ? "paused" : "activated"}`); }
  return <>
    <PageHeader eyebrow="SMART WORKFLOWS" title="Automations" copy="Put member communication and routine follow-ups on autopilot." action="Create automation" icon={Zap} onAction={() => notify("Automation builder opened")} />
    <SummaryGrid><SummaryCard icon={Zap} tone="purple" label="Active automations" value={String(items.filter((item) => item.active).length)} detail="Workflows running now" /><SummaryCard icon={Activity} tone="blue" label="Runs this month" value="315" detail="+22% from last month" /><SummaryCard icon={Clock3} tone="green" label="Hours saved" value="38.5" detail="About 9 hours each week" /><SummaryCard icon={MessageCircle} tone="amber" label="Messages delivered" value="97.2%" detail="1.8% above benchmark" /></SummaryGrid>
    <Toolbar query={query} setQuery={setQuery} placeholder="Search automations or triggers"><Tab active={filter === "All"} onClick={() => setFilter("All")}>All</Tab><Tab active={filter === "Active"} onClick={() => setFilter("Active")}>Active</Tab><Tab active={filter === "Paused"} onClick={() => setFilter("Paused")}>Paused</Tab></Toolbar>
    <section className="automation-layout"><div className="workflow-list">{visible.map((item) => { const Icon = item.icon; return <article className="panel workflow-card" key={item.id}><span className={`managed-glyph ${item.tone}`}><Icon size={19} /></span><div className="workflow-copy"><div><h2>{item.name}</h2><span className={`managed-status ${item.active ? "active" : "paused"}`}>{item.active ? "Active" : "Paused"}</span></div><p>{item.detail}</p><footer><span><Zap size={12} />{item.trigger}</span><span><Activity size={12} />{item.runs}</span><span><Check size={12} />{item.success}</span></footer></div><div className="workflow-actions"><button className={`toggle ${item.active ? "on" : ""}`} role="switch" aria-checked={item.active} aria-label={`${item.active ? "Pause" : "Activate"} ${item.name}`} onClick={() => toggle(item.id)}><i /></button><button className="icon-button small" onClick={() => notify(`${item.name} editor opened`)}><ChevronRight size={17} /></button></div></article>; })}{visible.length === 0 && <Empty icon={Zap} label="No matching automations" />}</div><RunLog notify={notify} /></section>
  </>;
}

function RunLog({ notify }: { notify: Notify }) {
  const events = [["Welcome sent to Riya Das", "Welcome new members", "2m", "ok"], ["Payment recovered for Dev Patel", "Failed payment recovery", "18m", "ok"], ["WhatsApp delivery failed", "Renewal reminder", "41m", "error"], ["12 inactive members contacted", "Win back inactive members", "1h", "ok"]];
  return <article className="panel run-card"><div className="managed-card-head"><div><h2>Recent runs</h2><p>Live workflow activity</p></div><span className="managed-live"><i />Live</span></div><div className="run-list">{events.map(([title, detail, time, state]) => <div key={title}><i className={state} /><span><strong>{title}</strong><small>{detail}</small></span><time>{time}</time></div>)}</div><button className="managed-row-action" onClick={() => notify("Complete automation history opened")}>View run history <ChevronRight size={14} /></button></article>;
}

function Empty({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return <div className="panel managed-empty"><Icon size={23} /><strong>{label}</strong><span>Try adjusting your search or filter.</span></div>;
}

function LoadingPlans() {
  return <div className="panel managed-empty" role="status" aria-live="polite"><LoaderCircle className="plan-spinner" size={24} /><strong>Loading plans</strong><span>Fetching plans from your gym.</span></div>;
}

type OverviewWindow = 7 | 14 | 30;
type OverviewData = {
  generatedAt: string;
  today: string;
  windowDays: OverviewWindow;
  user: { firstName: string };
  gym: { name: string; timezone: string };
  summary: {
    activeMemberships: number;
    totalMembers: number;
    expiringCount: number;
    expiringValue: string;
    totalCollected: string;
    totalCollectedChange: string | null;
    outstandingAmount: string;
    overdueAmount: string;
    overdueMembers: number;
    collectionRate: string;
  };
  expiringMemberships: {
    id: string;
    member: { id: string; fullName: string };
    planName: string;
    endsOn: string;
    agreedFee: string;
    outstandingAmount: string;
    overdueAmount: string;
  }[];
  recentPayments: {
    id: string;
    amount: string;
    paidOn: string;
    status: "SUCCEEDED" | "VOIDED" | "REFUNDED";
    member: { id: string; fullName: string };
    membership: { id: string; planName: string } | null;
    paymentMode: string;
  }[];
};

const overviewMoney = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const overviewDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });

function memberInitials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function daysBetween(startKey: string, endKey: string) {
  return Math.round((Date.parse(`${endKey}T00:00:00Z`) - Date.parse(`${startKey}T00:00:00Z`)) / 86_400_000);
}

function expiryLabel(today: string, endsOn: string) {
  const remaining = daysBetween(today, endsOn);
  if (remaining === 0) return "Today";
  if (remaining === 1) return "Tomorrow";
  return `In ${remaining} days`;
}

function paymentStatus(status: OverviewData["recentPayments"][number]["status"]) {
  if (status === "SUCCEEDED") return "Paid";
  return status === "REFUNDED" ? "Refunded" : "Voided";
}

function Overview() {
  const [days, setDays] = useState<OverviewWindow>(7);
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/overview?days=${days}`, { signal });
      const result = await response.json() as OverviewData | { error?: string };
      if (!response.ok || !("summary" in result)) throw new Error("error" in result ? result.error ?? "Could not load the overview." : "Could not load the overview.");
      setData(result);
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      setError(reason instanceof Error ? reason.message : "Could not load the overview.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => void loadOverview(controller.signal), 0);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [loadOverview]);

  const summary = data?.summary;
  const collectedChange = summary?.totalCollectedChange === null || summary?.totalCollectedChange === undefined
    ? "No prior-month comparison"
    : `${Number(summary.totalCollectedChange) >= 0 ? "+" : ""}${summary.totalCollectedChange}% from last month`;

  return <>
    <div className="page-heading managed-heading overview-heading"><div><p className="managed-breadcrumb">Workspace <ChevronRight size={12} /> Overview</p><h1>{data ? `Welcome back, ${data.user.firstName}` : "Welcome back"}</h1><p>{data ? `Here’s what needs attention at ${data.gym.name} today.` : "Your membership and collections workspace."}</p></div><div className="heading-actions"><Button variant="outline" size="lg" asChild><Link href="/payments?record=1"><IndianRupee />Record payment</Link></Button><Button size="lg" asChild><Link href="/members?add=1"><UserPlus />Add member</Link></Button></div></div>

    {error && <Card className="overview-error" role="alert"><AlertCircle /><div><strong>Could not load the overview</strong><span>{error}</span></div><Button variant="outline" size="sm" onClick={() => void loadOverview()}><RefreshCw />Try again</Button></Card>}

    <section className="overview-stats" aria-label="Business summary">
      <Card className="overview-stat"><span className="managed-stat-icon purple"><Users /></span><div><small>Active memberships</small><strong>{loading && !data ? "—" : summary?.activeMemberships ?? 0}</strong><em>{summary ? `${summary.totalMembers} total members` : "Loading member totals…"}</em></div></Card>
      <Card className="overview-stat"><span className="managed-stat-icon amber"><CalendarDays /></span><div><small>Expiring in {days} days</small><strong>{loading ? "—" : summary?.expiringCount ?? 0}</strong><em>{loading ? "Loading upcoming expiries…" : summary ? `${overviewMoney.format(Number(summary.expiringValue))} membership value` : "Loading upcoming expiries…"}</em></div></Card>
      <Card className="overview-stat"><span className="managed-stat-icon green"><WalletCards /></span><div><small>Collected this month</small><strong>{summary ? overviewMoney.format(Number(summary.totalCollected)) : "—"}</strong><em className={Number(summary?.totalCollectedChange ?? 0) < 0 ? "bad" : "good"}>{summary ? collectedChange : "Loading collections…"}</em></div></Card>
      <Card className="overview-stat"><span className="managed-stat-icon blue"><ReceiptText /></span><div><small>Outstanding dues</small><strong>{summary ? overviewMoney.format(Number(summary.outstandingAmount)) : "—"}</strong><em>{summary ? `${summary.overdueMembers} overdue ${summary.overdueMembers === 1 ? "member" : "members"}` : "Loading outstanding dues…"}</em></div></Card>
    </section>

    <section className="overview-action-grid">
      <Card className="overview-expiring-card">
        <CardHeader className="overview-section-head"><div><CardTitle>Memberships expiring soon</CardTitle><CardDescription>Active memberships ending in the selected window.</CardDescription></div><div className="overview-window" aria-label="Expiry window">{([7, 14, 30] as OverviewWindow[]).map((window) => <Button key={window} size="sm" variant={days === window ? "secondary" : "ghost"} aria-pressed={days === window} onClick={() => setDays(window)}>{window} days</Button>)}</div></CardHeader>
        <CardContent className="overview-expiring-content" aria-busy={loading}>
          <div className="overview-expiry-table-head" aria-hidden><span>Member</span><span>Expires</span><span>Payment position</span><span /></div>
          {loading ? <div className="overview-loading" role="status"><LoaderCircle /><span>Loading upcoming expiries…</span></div> : data?.expiringMemberships.length ? <div className="overview-expiry-list">{data.expiringMemberships.slice(0, 5).map((membership) => {
            const overdue = Number(membership.overdueAmount) > 0;
            const outstanding = Number(membership.outstandingAmount) > 0;
            return <div className="overview-expiry-row" key={membership.id}><div className="overview-person"><Avatar size="lg"><AvatarFallback>{memberInitials(membership.member.fullName)}</AvatarFallback></Avatar><span><strong>{membership.member.fullName}</strong><small>{membership.planName}</small></span></div><div className="overview-expiry-date"><strong>{expiryLabel(data.today, membership.endsOn)}</strong><small>{overviewDate.format(new Date(`${membership.endsOn}T00:00:00Z`))}</small></div><div>{overdue ? <Badge variant="destructive">{overviewMoney.format(Number(membership.overdueAmount))} overdue</Badge> : outstanding ? <Badge variant="outline">{overviewMoney.format(Number(membership.outstandingAmount))} outstanding</Badge> : <Badge variant="secondary"><Check />Paid</Badge>}</div><Button variant="ghost" size="sm" asChild><Link href={`/members?member=${membership.member.id}`}>View member<ChevronRight /></Link></Button></div>;
          })}</div> : <div className="overview-empty"><span className="managed-glyph green"><Check /></span><strong>No memberships expire in the next {days} days</strong><p>You’re all caught up. Try a wider date range to look further ahead.</p></div>}
        </CardContent>
        <div className="overview-card-footer"><span>{loading ? "Updating upcoming expiries…" : summary ? `${summary.expiringCount} upcoming ${summary.expiringCount === 1 ? "expiry" : "expiries"}` : "Upcoming expiries"}</span><Button variant="link" size="sm" asChild><Link href="/members">View all members<ArrowRight /></Link></Button></div>
      </Card>

      <Card className="overview-collection-card">
        <CardHeader><CardTitle>Collection health</CardTitle><CardDescription>This month against open membership dues.</CardDescription></CardHeader>
        <CardContent>
          <div className="overview-rate"><div><strong>{summary ? `${summary.collectionRate}%` : "—"}</strong><span>Collection rate</span></div><span className="overview-rate-icon"><TrendingUp /></span></div>
          <div className="overview-progress" aria-label={`${summary?.collectionRate ?? 0}% collection rate`}><i style={{ width: `${Math.min(Number(summary?.collectionRate ?? 0), 100)}%` }} /></div>
          <dl className="overview-collection-list"><div><dt>Collected this month</dt><dd>{summary ? overviewMoney.format(Number(summary.totalCollected)) : "—"}</dd></div><div><dt>Outstanding</dt><dd>{summary ? overviewMoney.format(Number(summary.outstandingAmount)) : "—"}</dd></div><div><dt>Overdue now</dt><dd className={Number(summary?.overdueAmount ?? 0) > 0 ? "bad" : ""}>{summary ? overviewMoney.format(Number(summary.overdueAmount)) : "—"}</dd></div><div><dt>Members overdue</dt><dd>{summary?.overdueMembers ?? "—"}</dd></div></dl>
        </CardContent>
        <div className="overview-card-footer"><span>Updated with member balances</span><Button variant="link" size="sm" asChild><Link href="/payments">View payments<ArrowRight /></Link></Button></div>
      </Card>
    </section>

    <Card className="overview-payments-card">
      <CardHeader className="overview-section-head"><div><CardTitle>Recent payments</CardTitle><CardDescription>The latest member transactions across payment methods.</CardDescription></div><Button variant="outline" size="sm" asChild><Link href="/payments">View all payments<ArrowRight /></Link></Button></CardHeader>
      <CardContent className="overview-payment-list">{loading && !data ? <div className="overview-loading"><LoaderCircle /><span>Loading recent payments…</span></div> : data?.recentPayments.length ? data.recentPayments.map((payment) => <div className="overview-payment-row" key={payment.id}><div className="overview-person"><Avatar><AvatarFallback>{memberInitials(payment.member.fullName)}</AvatarFallback></Avatar><span><strong>{payment.member.fullName}</strong><small>{payment.membership?.planName ?? "Unallocated payment"}</small></span></div><span className="overview-payment-method">{payment.paymentMode}</span><span className="overview-payment-date">{overviewDate.format(new Date(`${payment.paidOn}T00:00:00Z`))}</span><strong className="overview-payment-amount">{overviewMoney.format(Number(payment.amount))}</strong><Badge variant={payment.status === "SUCCEEDED" ? "secondary" : payment.status === "REFUNDED" ? "outline" : "destructive"}>{paymentStatus(payment.status)}</Badge></div>) : <div className="overview-empty compact"><span className="managed-glyph purple"><IndianRupee /></span><strong>No payments recorded yet</strong><p>New member payments will appear here.</p></div>}</CardContent>
    </Card>
  </>;
}

export function ManagedPage({ view, notify }: { view: Exclude<ManagedView, "Members">; notify: Notify }) {
  if (view === "Overview") return <Overview />;
  if (view === "Memberships") return <Memberships notify={notify} />;
  if (view === "Trainers") return <Trainers notify={notify} />;
  if (view === "Reports") return <Reports notify={notify} />;
  return <Automations notify={notify} />;
}
