"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Activity, ArrowDownRight, ArrowUpRight, BarChart3, Bell, CalendarDays,
  Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3,
  CreditCard, Download, Dumbbell, Filter, HelpCircle, Home, LayoutDashboard,
  LogIn, LogOut, Menu, MessageCircle, Moon, MoreHorizontal, Plus, ScanLine,
  Search, Settings, ShieldCheck, Sparkles, Sun, Timer, TrendingUp,
  UserRoundCheck, Users, WalletCards, X, Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import DashboardSidebar from "./dashboard-sidebar";

type VisitStatus = "In gym" | "Checked out";
type VisitFilter = "All visits" | VisitStatus;
type Range = "Today" | "7 days" | "30 days";
type Visit = { id: number; name: string; initials: string; plan: string; checkIn: string; checkOut: string; duration: string; status: VisitStatus; source: string; tone: string };

const initialVisits: Visit[] = [
  { id: 1, name: "Neha Sharma", initials: "NS", plan: "Annual Unlimited", checkIn: "7:42 PM", checkOut: "—", duration: "48 min", status: "In gym", source: "Front desk", tone: "pink" },
  { id: 2, name: "Arjun Malhotra", initials: "AM", plan: "Strength Pro", checkIn: "7:31 PM", checkOut: "—", duration: "59 min", status: "In gym", source: "QR kiosk", tone: "violet" },
  { id: 3, name: "Riya Kapoor", initials: "RK", plan: "Monthly Flex", checkIn: "7:18 PM", checkOut: "—", duration: "1h 12m", status: "In gym", source: "QR kiosk", tone: "blue" },
  { id: 4, name: "Kabir Singh", initials: "KS", plan: "Annual Unlimited", checkIn: "6:54 PM", checkOut: "7:46 PM", duration: "52 min", status: "Checked out", source: "Front desk", tone: "amber" },
  { id: 5, name: "Ishita Rao", initials: "IR", plan: "Strength Pro", checkIn: "6:37 PM", checkOut: "7:28 PM", duration: "51 min", status: "Checked out", source: "QR kiosk", tone: "green" },
  { id: 6, name: "Dev Patel", initials: "DP", plan: "Monthly Flex", checkIn: "6:22 PM", checkOut: "7:19 PM", duration: "57 min", status: "Checked out", source: "Front desk", tone: "violet" },
];

const liveMembers = [
  { name: "Neha Sharma", plan: "Annual Unlimited", time: "48m", initials: "NS", tone: "pink" },
  { name: "Arjun Malhotra", plan: "Strength Pro", time: "59m", initials: "AM", tone: "violet" },
  { name: "Riya Kapoor", plan: "Monthly Flex", time: "1h 12m", initials: "RK", tone: "blue" },
  { name: "Aarav Mehta", plan: "Strength Pro", time: "1h 28m", initials: "AR", tone: "amber" },
];

const hourlyTraffic = [18, 34, 45, 31, 24, 20, 27, 22, 17, 25, 38, 54, 72, 61, 42, 19];
const hourLabels = ["6a", "7a", "8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p"];

const navGroups = [
  { label: "Workspace", items: [
    { label: "Overview", icon: LayoutDashboard }, { label: "Members", icon: Users },
    { label: "Attendance", icon: Activity, active: true }, { label: "Payments", icon: WalletCards },
    { label: "Messages", icon: MessageCircle, badge: "8" },
  ] },
  { label: "Manage", items: [
    { label: "Memberships", icon: CreditCard }, { label: "Trainers", icon: Dumbbell },
    { label: "Reports", icon: BarChart3 }, { label: "Automations", icon: Zap, badge: "NEW" },
  ] },
];

function Brand() {
  return <div className="brand"><div className="brand-mark"><TrendingUp size={18} strokeWidth={2.8} /></div><span>Gymwise</span></div>;
}

function LegacySidebar({ open, close }: { open: boolean; close: () => void }) {
  return <>
    {open && <button className="sidebar-scrim" aria-label="Close navigation" onClick={close} />}
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="sidebar-top"><Brand /><button className="icon-button sidebar-close" onClick={close} aria-label="Close navigation"><X size={18} /></button></div>
      <button className="location-switcher"><span className="location-icon"><Dumbbell size={17} /></span><span><strong>Pulse Fitness</strong><small>South Delhi</small></span><ChevronDown size={15} /></button>
      <nav className="main-nav" aria-label="Primary navigation">
        {navGroups.map((group) => <div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.items.map(({ label, icon: Icon, active, badge }) => { const route = ({ Overview: "/", Members: "/members", Attendance: "/attendance", Payments: "/payments", Messages: "/messages", Memberships: "/memberships", Trainers: "/trainers", Reports: "/reports", Automations: "/automations" } as Record<string, string>)[label]; return <Link className={`nav-item ${active ? "active" : ""}`} href={route} key={label} onClick={close}><Icon size={18} strokeWidth={active ? 2.2 : 1.8} /><span>{label}</span>{badge && <span className={`nav-badge ${badge === "NEW" ? "new" : ""}`}>{badge}</span>}</Link>; })}</div>)}
      </nav>
      <div className="sidebar-bottom"><div className="insight-card"><span className="insight-icon"><Sparkles size={16} /></span><strong>Attendance insight</strong><p>Your busiest window starts in 20 minutes.</p><button>View forecast <ArrowUpRight size={14} /></button></div><button className="nav-item"><Settings size={18} /><span>Settings</span></button><button className="nav-item"><CircleHelp size={18} /><span>Help & support</span></button></div>
    </aside>
  </>;
}

function ThemeToggle() {
  function toggle() { const dark = document.documentElement.dataset.theme !== "dark"; document.documentElement.dataset.theme = dark ? "dark" : "light"; localStorage.setItem("gymwise-theme", dark ? "dark" : "light"); }
  return <button className="icon-button theme-button" onClick={toggle} aria-label="Toggle color theme"><Sun className="theme-sun" size={18} /><Moon className="theme-moon" size={18} /></button>;
}

function Header({ onMenu }: { onMenu: () => void }) {
  return <header className="topbar"><div className="topbar-left"><button className="icon-button menu-button" onClick={onMenu} aria-label="Open navigation"><Menu size={20} /></button><div className="mobile-brand"><Brand /></div><button className="search-box"><Search size={16} /><span>Search members, payments...</span><kbd>⌘ K</kbd></button></div><div className="topbar-actions"><button className="icon-button help-button" aria-label="Help"><HelpCircle size={18} /></button><ThemeToggle /><button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button><div className="topbar-divider" /><button className="profile"><span className="avatar avatar-main">PK</span><span className="profile-copy"><strong>Priya Khanna</strong><small>Owner</small></span><ChevronDown size={15} /></button></div></header>;
}

function StatCard({ icon: Icon, label, value, detail, trend, tone = "purple" }: { icon: LucideIcon; label: string; value: string; detail: string; trend?: "up" | "down"; tone?: string }) {
  return <article className="attendance-stat-card"><div className={`attendance-stat-icon ${tone}`}><Icon size={18} /></div><div className="attendance-stat-label">{label}<button aria-label={`About ${label}`} title={detail}><CircleHelp size={13} /></button></div><strong>{value}</strong><p className={trend ? "stat-trend" : ""}>{trend === "up" && <ArrowUpRight size={13} />}{trend === "down" && <ArrowDownRight size={13} />}{detail}</p></article>;
}

function TrafficChart({ range }: { range: Range }) {
  const multiplier = range === "Today" ? 1 : range === "7 days" ? 5.8 : 24.2;
  return <div className="traffic-chart" aria-label={`Attendance traffic for ${range}`}><div className="traffic-y-axis"><span>{range === "Today" ? "75" : range === "7 days" ? "450" : "1.8k"}</span><span>{range === "Today" ? "50" : range === "7 days" ? "300" : "1.2k"}</span><span>{range === "Today" ? "25" : range === "7 days" ? "150" : "600"}</span><span>0</span></div><div className="traffic-plot"><div className="traffic-grid"><i /><i /><i /><i /></div><div className="traffic-bars">{hourlyTraffic.map((visits, index) => <div className="traffic-column" key={hourLabels[index]}><button className={`traffic-bar ${index === 12 ? "peak" : ""}`} style={{ height: `${Math.max(7, visits / 72 * 100)}%` }} aria-label={`${hourLabels[index]}, ${Math.round(visits * multiplier)} check-ins`}><span className="traffic-tooltip">{Math.round(visits * multiplier)}<small>check-ins</small></span></button><span>{index % 2 === 0 || index === 15 ? hourLabels[index] : ""}</span></div>)}</div></div></div>;
}

function CheckInModal({ close, checkIn }: { close: () => void; checkIn: (name: string) => void }) {
  const [name, setName] = useState("");
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="checkin-title" onMouseDown={(event) => event.currentTarget === event.target && close()}><form className="modal checkin-modal" onSubmit={(event) => { event.preventDefault(); checkIn(name); }}><div className="modal-header"><div><span className="modal-kicker"><ScanLine size={14} /> Manual entry</span><h2 id="checkin-title">Check in a member</h2><p>Search for a member and record their arrival.</p></div><button type="button" className="icon-button" onClick={close} aria-label="Close"><X size={18} /></button></div><label>Member name<div className="modal-search"><Search size={16} /><input required autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Search by name or phone number" /></div></label><div className="recent-member"><span className="avatar blue">AV</span><div><strong>Ananya Verma</strong><small>Annual Unlimited · Active</small></div><button type="button" onClick={() => setName("Ananya Verma")}>Select</button></div><label>Entry point<select defaultValue="Front desk"><option>Front desk</option><option>QR kiosk</option><option>Trainer entry</option></select></label><div className="modal-actions"><button type="button" className="button secondary" onClick={close}>Cancel</button><button className="button primary" type="submit"><LogIn size={16} /> Check in</button></div></form></div>;
}

export default function AttendancePage() {
  const [mobileNav, setMobileNav] = useState(false);
  const [range, setRange] = useState<Range>("Today");
  const [filter, setFilter] = useState<VisitFilter>("All visits");
  const [query, setQuery] = useState("");
  const [visits, setVisits] = useState(initialVisits);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState("");

  const filteredVisits = useMemo(() => visits.filter((visit) => (filter === "All visits" || visit.status === filter) && (!query.trim() || `${visit.name} ${visit.plan} ${visit.source}`.toLowerCase().includes(query.trim().toLowerCase()))), [filter, query, visits]);
  const insideDelta = visits.filter((visit) => visit.status === "In gym").length - 3;
  const checkoutDelta = visits.filter((visit) => visit.status === "Checked out").length - 3;
  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2600); }
  function checkOut(id: number) { setVisits((current) => current.map((visit) => visit.id === id ? { ...visit, status: "Checked out", checkOut: "8:30 PM" } : visit)); notify("Member checked out successfully"); }
  function checkIn(name: string) { const memberName = name.trim() || "Ananya Verma"; setVisits((current) => [{ id: Date.now(), name: memberName, initials: memberName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(), plan: "Annual Unlimited", checkIn: "8:30 PM", checkOut: "—", duration: "Just now", status: "In gym", source: "Front desk", tone: "green" }, ...current]); setShowModal(false); notify(`${memberName} checked in`); }
  function exportVisits() { const rows = visits.map((visit) => [visit.name, visit.plan, visit.checkIn, visit.checkOut, visit.duration, visit.status, visit.source].join(",")); const csv = ["Member,Plan,Check in,Check out,Duration,Status,Source", ...rows].join("\n"); const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); const link = document.createElement("a"); link.href = url; link.download = "pulse-fitness-attendance.csv"; link.click(); URL.revokeObjectURL(url); notify("Attendance report exported"); }

  return <div className="app-shell attendance-app">
    <DashboardSidebar open={mobileNav} onClose={() => setMobileNav(false)} onNotify={notify} />
    <div className="app-content"><Header onMenu={() => setMobileNav(true)} /><main className="dashboard attendance-dashboard">
      <div className="attendance-heading"><div><div className="heading-breadcrumb"><span>Workspace</span><ChevronRight size={13} /><strong>Attendance</strong></div><h1>Attendance</h1><p>Track member visits and manage today’s check-ins.</p></div><div className="heading-actions"><div className="date-stepper"><button aria-label="Previous day"><ChevronLeft size={16} /></button><div><CalendarDays size={15} /><span>Today, 8 Aug</span></div><button aria-label="Next day" disabled><ChevronRight size={16} /></button></div><button className="button secondary export-button" onClick={exportVisits}><Download size={16} /> Export</button><button className="button primary" onClick={() => setShowModal(true)}><Plus size={17} /> Check in member</button></div></div>
      <section className="attendance-stats" aria-label="Today’s attendance overview"><StatCard icon={UserRoundCheck} label="In gym now" value={`${84 + insideDelta}`} detail="12% above usual" trend="up" tone="green" /><StatCard icon={LogIn} label="Today's visits" value={`${386 + visits.length - initialVisits.length}`} detail="42 more than last Sat" trend="up" /><StatCard icon={Clock3} label="Peak hour" value="6–7 PM" detail="72 member check-ins" tone="amber" /><StatCard icon={Timer} label="Avg. visit" value="74 min" detail="4 min shorter this week" trend="down" tone="blue" /></section>
      <section className="attendance-overview-grid">
        <article className="panel traffic-panel"><div className="attendance-card-header"><div><h2>Check-in traffic</h2><p>Hourly member arrivals at South Delhi</p></div><div className="range-tabs">{(["Today", "7 days", "30 days"] as Range[]).map((item) => <button key={item} className={range === item ? "selected" : ""} onClick={() => setRange(item)}>{item}</button>)}</div></div><div className="traffic-summary"><div><strong>{range === "Today" ? "386" : range === "7 days" ? "2,238" : "9,341"}</strong><span>check-ins</span><em><ArrowUpRight size={13} /> 12.4%</em></div><div className="peak-legend"><i /> Peak hour · 6–7 PM</div></div><TrafficChart range={range} /></article>
        <article className="panel live-panel"><div className="attendance-card-header"><div><h2>Currently in gym</h2><p>{84 + insideDelta} active visits</p></div><span className="live-status"><i /> Live</span></div><div className="capacity-block"><div className="capacity-ring" style={{ "--capacity": "67%" } as React.CSSProperties}><div><strong>67%</strong><span>capacity</span></div></div><div className="capacity-copy"><strong>{84 + insideDelta} of 125</strong><span>members inside</span><small><i /> Comfortable capacity</small></div></div><div className="live-member-list">{liveMembers.map((member) => <button key={member.name} onClick={() => notify(`${member.name} profile opened`)}><span className={`avatar ${member.tone}`}>{member.initials}</span><span><strong>{member.name}</strong><small>{member.plan}</small></span><time>{member.time}</time><ChevronRight size={14} /></button>)}</div><button className="panel-footer-button" onClick={() => { setFilter("In gym"); document.getElementById("visit-log")?.scrollIntoView({ behavior: "smooth" }); }}>View everyone inside <ChevronRight size={15} /></button></article>
      </section>
      <section className="panel visit-log" id="visit-log"><div className="visit-log-header"><div><h2>Visit log</h2><p>All check-ins recorded today</p></div><button className="icon-button small" aria-label="Visit log options"><MoreHorizontal size={18} /></button></div><div className="visit-toolbar"><div className="visit-tabs">{(["All visits", "In gym", "Checked out"] as VisitFilter[]).map((item) => <button key={item} className={filter === item ? "selected" : ""} onClick={() => setFilter(item)}>{item}<span>{item === "All visits" ? 386 + visits.length - initialVisits.length : item === "In gym" ? 84 + insideDelta : 302 + checkoutDelta}</span></button>)}</div><div className="visit-tools"><label className="visit-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search members" aria-label="Search visits" />{query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={13} /></button>}</label><button className={`button secondary filter-button ${showFilters ? "active" : ""}`} onClick={() => setShowFilters((current) => !current)}><Filter size={15} /> Filter</button></div></div>
        {showFilters && <div className="visit-advanced-filters"><label>Entry source<select defaultValue="All sources"><option>All sources</option><option>Front desk</option><option>QR kiosk</option></select></label><label>Membership<select defaultValue="All plans"><option>All plans</option><option>Annual Unlimited</option><option>Strength Pro</option><option>Monthly Flex</option></select></label><button onClick={() => setShowFilters(false)}>Clear filters</button></div>}
        <div className="visit-table-wrap"><table className="visit-table"><thead><tr><th>Member</th><th>Check in</th><th>Check out</th><th>Duration</th><th>Status</th><th>Entry source</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{filteredVisits.map((visit) => <tr key={visit.id}><td><button className="visit-member" onClick={() => notify(`${visit.name} profile opened`)}><span className={`avatar ${visit.tone}`}>{visit.initials}</span><span><strong>{visit.name}</strong><small>{visit.plan}</small></span></button></td><td><strong className="visit-time">{visit.checkIn}</strong></td><td>{visit.checkOut}</td><td>{visit.duration}</td><td><span className={`visit-status ${visit.status === "In gym" ? "active" : "complete"}`}><i />{visit.status}</span></td><td><span className="entry-source">{visit.source === "QR kiosk" ? <ScanLine size={14} /> : <UserRoundCheck size={14} />}{visit.source}</span></td><td>{visit.status === "In gym" ? <button className="checkout-button" onClick={() => checkOut(visit.id)}><LogOut size={14} /> Check out</button> : <button className="icon-button small" aria-label={`More actions for ${visit.name}`}><MoreHorizontal size={17} /></button>}</td></tr>)}{filteredVisits.length === 0 && <tr><td colSpan={7}><div className="visit-empty"><Search size={20} /><strong>No visits found</strong><span>Try changing the search or status filter.</span><button onClick={() => { setQuery(""); setFilter("All visits"); }}>Clear filters</button></div></td></tr>}</tbody></table></div><div className="table-pagination"><span>Showing 1–{filteredVisits.length} of {filter === "All visits" ? 386 : filter === "In gym" ? 84 : 302} visits</span><div><button disabled><ChevronLeft size={15} /></button><button className="current">1</button><button>2</button><button>3</button><span>…</span><button>65</button><button><ChevronRight size={15} /></button></div></div>
      </section>
      <footer className="dashboard-footer"><span>Attendance synced just now</span><span><ShieldCheck size={14} /> Your data is securely encrypted</span></footer>
    </main></div>
    <nav className="mobile-tabs" aria-label="Mobile navigation"><Link href="/"><Home size={19} /><span>Home</span></Link><Link href="/members"><Users size={19} /><span>Members</span></Link><button className="mobile-add" onClick={() => setShowModal(true)}><Plus size={21} /></button><Link className="active" href="/attendance"><Activity size={19} /><span>Visits</span></Link><button><Settings size={19} /><span>Settings</span></button></nav>
    {showModal && <CheckInModal close={() => setShowModal(false)} checkIn={checkIn} />}{toast && <div className="toast" role="status"><span><Check size={15} /></span>{toast}</div>}
  </div>;
}
