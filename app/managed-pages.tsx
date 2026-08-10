"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity,
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
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

export type ManagedView = "Overview" | "Members" | "Memberships" | "Trainers" | "Reports" | "Automations";
type Notify = (message: string) => void;

const plans = [
  { name: "Annual Unlimited", detail: "Unlimited access across every location", price: "₹18,000", cadence: "/ year", members: 486, revenue: "₹87.5L", growth: "+12.4%", state: "Active", tone: "purple" },
  { name: "Strength Pro", detail: "Gym access with four coached sessions", price: "₹3,499", cadence: "/ month", members: 352, revenue: "₹12.3L", growth: "+8.1%", state: "Active", tone: "blue" },
  { name: "Monthly Flex", detail: "Flexible monthly access, cancel anytime", price: "₹2,499", cadence: "/ month", members: 318, revenue: "₹7.9L", growth: "+3.6%", state: "Active", tone: "green" },
  { name: "Starter Pass", detail: "Eight gym visits every month", price: "₹999", cadence: "/ month", members: 128, revenue: "₹1.3L", growth: "−1.2%", state: "Archived", tone: "amber" },
];

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

function PageHeader({ eyebrow, title, copy, action, icon: Icon = Plus, onAction }: { eyebrow: string; title: string; copy: string; action: string; icon?: LucideIcon; onAction: () => void }) {
  const parent = eyebrow.includes("WORKSPACE") ? "Workspace" : "Manage";
  return <div className="page-heading managed-heading"><div><p className="managed-breadcrumb" title={eyebrow}>{parent} <ChevronRight size={12} /> {title}</p><h1>{title}</h1><p>{copy}</p></div><button className="button primary" onClick={onAction}><Icon size={16} />{action}</button></div>;
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

function Memberships({ notify }: { notify: Notify }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Active" | "Archived">("All");
  const visible = useMemo(() => plans.filter((plan) => (filter === "All" || plan.state === filter) && `${plan.name} ${plan.detail}`.toLowerCase().includes(query.toLowerCase())), [filter, query]);
  return <>
    <PageHeader eyebrow="MEMBERSHIP MANAGEMENT" title="Memberships" copy="Create plans, track adoption, and stay ahead of upcoming renewals." action="Create plan" onAction={() => notify("Membership plan builder opened")} />
    <SummaryGrid>
      <SummaryCard icon={Users} tone="purple" label="Active memberships" value="1,284" detail="+4.8% from last month" />
      <SummaryCard icon={WalletCards} tone="green" label="Recurring revenue" value="₹12.8L" detail="₹97K above last month" />
      <SummaryCard icon={CalendarDays} tone="blue" label="Renewing this month" value="164" detail="82% set to auto-renew" />
      <SummaryCard icon={TrendingUp} tone="amber" label="Average plan value" value="₹2,642" detail="+6.2% over 90 days" />
    </SummaryGrid>
    <Toolbar query={query} setQuery={setQuery} placeholder="Search membership plans"><Tab active={filter === "All"} onClick={() => setFilter("All")}>All</Tab><Tab active={filter === "Active"} onClick={() => setFilter("Active")}>Active</Tab><Tab active={filter === "Archived"} onClick={() => setFilter("Archived")}>Archived</Tab></Toolbar>
    <section className="plan-grid">{visible.map((plan) => <article className="panel plan-card" key={plan.name}>
      <div className="plan-top"><span className={`managed-glyph ${plan.tone}`}><CreditCard size={19} /></span><span className={`managed-status ${plan.state === "Active" ? "active" : "paused"}`}>{plan.state}</span><button className="icon-button small" aria-label={`${plan.name} options`} onClick={() => notify(`${plan.name} options opened`)}><MoreHorizontal size={17} /></button></div>
      <h2>{plan.name}</h2><p>{plan.detail}</p><div className="plan-price"><strong>{plan.price}</strong><span>{plan.cadence}</span></div>
      <div className="plan-data"><div><small>Members</small><strong>{plan.members}</strong></div><div><small>Revenue</small><strong>{plan.revenue}</strong></div><div><small>Growth</small><strong className={plan.growth.startsWith("+") ? "good" : "bad"}>{plan.growth}</strong></div></div>
      <button className="managed-row-action" onClick={() => notify(`${plan.name} opened for editing`)}>Manage plan <ChevronRight size={15} /></button>
    </article>)}{visible.length === 0 && <Empty icon={CreditCard} label="No matching plans" />}</section>
    <Renewals notify={notify} />
  </>;
}

function Renewals({ notify }: { notify: Notify }) {
  const rows = [["Ananya Verma", "AV", "Annual Unlimited", "10 Aug", "₹18,000", "Auto-renew", "violet"], ["Dev Patel", "DP", "Strength Pro", "11 Aug", "₹3,499", "Reminder sent", "blue"], ["Kavya Iyer", "KI", "Monthly Flex", "12 Aug", "₹2,499", "Action needed", "amber"]];
  return <article className="panel managed-table-panel"><div className="managed-card-head"><div><h2>Upcoming renewals</h2><p>Highest-value renewals in the next seven days</p></div><button onClick={() => notify("All upcoming renewals opened")}>View all <ChevronRight size={14} /></button></div><div className="member-table-wrap"><table className="member-table"><thead><tr><th>Member</th><th>Plan</th><th>Renewal</th><th>Amount</th><th>Status</th><th /></tr></thead><tbody>{rows.map(([name, initials, plan, date, amount, status, color]) => <tr key={name}><td><div className="member-cell"><span className={`avatar ${color}`}>{initials}</span><strong>{name}</strong></div></td><td>{plan}</td><td>{date}</td><td><strong>{amount}</strong></td><td><span className={`managed-status ${status === "Action needed" ? "warning" : "active"}`}>{status}</span></td><td><button className="icon-button small" onClick={() => notify(`${name}'s renewal opened`)}><ChevronRight size={15} /></button></td></tr>)}</tbody></table></div></article>;
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

function Overview({ notify }: { notify: Notify }) {
  const activity = [["Kabir Singh joined", "Annual Unlimited", "4m"], ["Neha Sharma checked in", "Morning session", "12m"], ["Payment received", "Rahul Jain · ₹2,499", "28m"], ["Win-back message delivered", "12 members reached", "1h"]];
  const priorities: { title: string; detail: string; icon: LucideIcon; tone: string }[] = [
    { title: "32 renewals due soon", detail: "Reach out before memberships expire", icon: CalendarDays, tone: "amber" },
    { title: "18 members need attention", detail: "Inactive for more than 21 days", icon: Users, tone: "purple" },
    { title: "7 failed payments", detail: "₹18,493 available to recover", icon: CreditCard, tone: "red" },
  ];
  return <>
    <PageHeader eyebrow="WORKSPACE OVERVIEW" title="Good evening, Priya" copy="Here’s what’s happening at Pulse Fitness today." action="Add member" icon={UserPlus} onAction={() => notify("New member form opened")} />
    <SummaryGrid><SummaryCard icon={Users} tone="purple" label="Active members" value="1,284" detail="+4.8% from last month" /><SummaryCard icon={WalletCards} tone="green" label="Monthly revenue" value="₹12.8L" detail="₹97K above last month" /><SummaryCard icon={TrendingUp} tone="blue" label="Member retention" value="88.4%" detail="+2.1% from last month" /><SummaryCard icon={Activity} tone="amber" label="Visits today" value="386" detail="42 more than last Saturday" /></SummaryGrid>
    <section className="report-layout overview-layout"><article className="panel report-chart"><div className="report-head"><div><small>MEMBERSHIP HEALTH</small><h2>88.4%</h2><p><strong><ArrowUpRight size={13} />2.1%</strong> compared with last month</p></div><button className="button secondary" onClick={() => notify("Membership report opened")}>View report <ChevronRight size={14} /></button></div><div className="report-tabs"><Tab active onClick={() => undefined}>Retention</Tab><Tab active={false} onClick={() => notify("Churn trend selected")}>Churn</Tab><Tab active={false} onClick={() => notify("Renewals trend selected")}>Renewals</Tab></div><div className="report-bars">{[48, 54, 52, 63, 68, 72, 78, 75, 84, 88, 92, 96].map((height, index) => <div key={index}><span><i style={{ height: `${height}%` }} /></span><small>{["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"][index]}</small></div>)}</div></article><article className="panel run-card"><div className="managed-card-head"><div><h2>Live activity</h2><p>Across all locations</p></div><span className="managed-live"><i />Live</span></div><div className="run-list">{activity.map(([title, detail, time], index) => <div key={title}><i className={index === 3 ? "error" : "ok"} /><span><strong>{title}</strong><small>{detail}</small></span><time>{time}</time></div>)}</div><button className="managed-row-action" onClick={() => notify("Full activity timeline opened")}>View all activity <ChevronRight size={14} /></button></article></section>
    <section className="saved-section"><div className="section-title"><div><h2>Today’s priorities</h2><p>Actions with the biggest impact right now.</p></div></div><div className="saved-grid">{priorities.map(({ title, detail, icon: ActionIcon, tone }) => <button className="panel saved-report overview-priority" key={title} onClick={() => notify(`${title} opened`)}><span className={`managed-glyph ${tone}`}><ActionIcon size={19} /></span><span><strong>{title}</strong><small>{detail}</small></span><ChevronRight size={16} /></button>)}</div></section>
  </>;
}

export function ManagedPage({ view, notify }: { view: Exclude<ManagedView, "Members">; notify: Notify }) {
  if (view === "Overview") return <Overview notify={notify} />;
  if (view === "Memberships") return <Memberships notify={notify} />;
  if (view === "Trainers") return <Trainers notify={notify} />;
  if (view === "Reports") return <Reports notify={notify} />;
  return <Automations notify={notify} />;
}
