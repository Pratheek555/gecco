"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Activity, ArrowUpRight, Bell, CalendarDays, Check, ChevronDown,
  ChevronLeft, ChevronRight, CreditCard, Download,
  Filter, HelpCircle, LayoutDashboard, Mail, Menu, MessageCircle, Moon,
  MoreHorizontal, Phone, Plus, Search, ShieldCheck, Sparkles,
  Sun, Upload, UserCheck, UserPlus, UserRoundX, Users, X,
} from "lucide-react";
import { useMemo, useState } from "react";
import DashboardSidebar, { Brand } from "../dashboard-sidebar";

type Status = "Active" | "Expiring" | "Paused" | "Inactive";
type StatusFilter = "All" | Status;
type Member = {
  id: number;
  name: string;
  initials: string;
  phone: string;
  email: string;
  plan: string;
  status: Status;
  visits: number;
  lastVisit: string;
  renewal: string;
  amount: string;
  joined: string;
  attendance: number;
  color: string;
};

const seedMembers: Member[] = [
  { id: 1, name: "Aarav Mehta", initials: "AM", phone: "+91 98765 42108", email: "aarav.m@example.com", plan: "Strength Pro", status: "Active", visits: 18, lastVisit: "Today, 7:42 AM", renewal: "18 Aug 2026", amount: "\u20B93,499", joined: "12 Jan 2024", attendance: 82, color: "violet" },
  { id: 2, name: "Neha Sharma", initials: "NS", phone: "+91 98114 27506", email: "neha.sharma@example.com", plan: "Annual Unlimited", status: "Expiring", visits: 12, lastVisit: "Yesterday, 6:18 PM", renewal: "11 Aug 2026", amount: "\u20B918,000", joined: "11 Aug 2023", attendance: 64, color: "pink" },
  { id: 3, name: "Rohan Kapoor", initials: "RK", phone: "+91 99583 61042", email: "rohan.k@example.com", plan: "Monthly Flex", status: "Active", visits: 9, lastVisit: "6 Aug, 8:05 AM", renewal: "24 Aug 2026", amount: "\u20B92,499", joined: "24 Mar 2025", attendance: 58, color: "blue" },
  { id: 4, name: "Ishita Rao", initials: "IR", phone: "+91 98912 77431", email: "ishita.rao@example.com", plan: "Strength Pro", status: "Paused", visits: 4, lastVisit: "28 Jul, 7:14 PM", renewal: "Paused", amount: "\u20B93,499", joined: "04 Sep 2024", attendance: 28, color: "amber" },
  { id: 5, name: "Kabir Singh", initials: "KS", phone: "+91 97117 40286", email: "kabir.s@example.com", plan: "Annual Unlimited", status: "Active", visits: 22, lastVisit: "Today, 6:32 AM", renewal: "08 Aug 2027", amount: "\u20B918,000", joined: "08 Aug 2026", attendance: 94, color: "green" },
  { id: 6, name: "Ananya Verma", initials: "AV", phone: "+91 88604 91823", email: "ananya.v@example.com", plan: "Monthly Flex", status: "Expiring", visits: 7, lastVisit: "4 Aug, 5:51 PM", renewal: "13 Aug 2026", amount: "\u20B92,499", joined: "13 Feb 2025", attendance: 46, color: "purple" },
  { id: 7, name: "Vihaan Malhotra", initials: "VM", phone: "+91 99105 38744", email: "vihaan.m@example.com", plan: "Strength Pro", status: "Inactive", visits: 0, lastVisit: "21 Jun, 8:20 AM", renewal: "Expired 22 Jul", amount: "\u20B93,499", joined: "22 Jul 2024", attendance: 8, color: "slate" },
  { id: 8, name: "Meera Iyer", initials: "MI", phone: "+91 98102 65319", email: "meera.iyer@example.com", plan: "Annual Unlimited", status: "Active", visits: 16, lastVisit: "Yesterday, 7:08 AM", renewal: "17 Nov 2026", amount: "\u20B918,000", joined: "17 Nov 2024", attendance: 76, color: "rose" },
  { id: 9, name: "Arjun Nair", initials: "AN", phone: "+91 96547 10283", email: "arjun.nair@example.com", plan: "Monthly Flex", status: "Active", visits: 11, lastVisit: "5 Aug, 6:44 PM", renewal: "28 Aug 2026", amount: "\u20B92,499", joined: "28 May 2026", attendance: 69, color: "cyan" },
  { id: 10, name: "Diya Patel", initials: "DP", phone: "+91 99992 76104", email: "diya.patel@example.com", plan: "Strength Pro", status: "Active", visits: 14, lastVisit: "Today, 8:16 AM", renewal: "02 Sep 2026", amount: "\u20B93,499", joined: "02 Apr 2025", attendance: 73, color: "indigo" },
];

function ThemeToggle() {
  function toggleTheme() {
    const dark = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("gymwise-theme", dark ? "dark" : "light");
  }
  return <button className="icon-button theme-button" onClick={toggleTheme} aria-label="Toggle color theme"><Sun className="theme-sun" size={18} /><Moon className="theme-moon" size={18} /></button>;
}

function Header({ onMenu, focusSearch, notify }: { onMenu: () => void; focusSearch: () => void; notify: (message: string) => void }) {
  return <header className="topbar"><div className="topbar-left"><button className="icon-button menu-button" onClick={onMenu} aria-label="Open navigation"><Menu size={20} /></button><div className="mobile-brand"><Brand /></div><button className="search-box" onClick={focusSearch}><Search size={16} /><span>Search members, payments...</span><kbd>Ctrl K</kbd></button></div><div className="topbar-actions"><button className="icon-button help-button" onClick={() => notify("Help centre opened")} aria-label="Help"><HelpCircle size={18} /></button><ThemeToggle /><button className="icon-button notification-button" onClick={() => notify("You have 3 new notifications")} aria-label="Notifications"><Bell size={18} /><i /></button><div className="topbar-divider" /><button className="profile" onClick={() => notify("Profile menu opened")}><span className="avatar avatar-main">PK</span><span className="profile-copy"><strong>Priya Khanna</strong><small>Owner</small></span><ChevronDown size={15} /></button></div></header>;
}

function StatCard({ icon: Icon, tone, label, value, change, note }: { icon: LucideIcon; tone: string; label: string; value: string; change: string; note: string }) {
  return <article className="member-stat-card"><div className={`member-stat-icon ${tone}`}><Icon size={18} /></div><div className="member-stat-copy"><span>{label}</span><div><strong>{value}</strong><em><ArrowUpRight size={11} />{change}</em></div><small>{note}</small></div></article>;
}

function StatusPill({ status }: { status: Status }) {
  return <span className={`status-pill ${status.toLowerCase()}`}><i />{status}</span>;
}

function AddMemberModal({ close, addMember }: { close: () => void; addMember: (member: Member) => void }) {
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="add-member-title" onMouseDown={(event) => event.currentTarget === event.target && close()}><form className="modal" onSubmit={(event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name"));
    const selectedPlan = String(data.get("plan"));
    addMember({ id: Date.now(), name, initials: name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(), phone: String(data.get("phone")), email: String(data.get("email")) || "No email provided", plan: selectedPlan, status: "Active", visits: 0, lastVisit: "Not checked in yet", renewal: "08 Sep 2026", amount: selectedPlan === "Annual Unlimited" ? "\u20B918,000" : selectedPlan === "Strength Pro" ? "\u20B93,499" : "\u20B92,499", joined: "08 Aug 2026", attendance: 0, color: "violet" });
  }}><div className="modal-header"><div><h2 id="add-member-title">Add new member</h2><p>Create their profile and send a welcome invite.</p></div><button type="button" className="icon-button" onClick={close} aria-label="Close"><X size={18} /></button></div><label>Full name<input name="name" required autoFocus placeholder="e.g. Ananya Verma" /></label><div className="form-row"><label>Phone number<input name="phone" required placeholder="+91 98765 43210" /></label><label>Email <span>Optional</span><input name="email" type="email" placeholder="name@example.com" /></label></div><label>Membership plan<select name="plan" defaultValue="" required><option value="" disabled>Select a plan</option><option>Monthly Flex</option><option>Strength Pro</option><option>Annual Unlimited</option></select></label><div className="modal-note"><ShieldCheck size={16} /><span>A welcome message and digital membership card will be sent automatically.</span></div><div className="modal-actions"><button type="button" className="button secondary" onClick={close}>Cancel</button><button className="button primary" type="submit"><UserPlus size={16} /> Add member</button></div></form></div>;
}

function MemberDrawer({ member, close, notify }: { member: Member; close: () => void; notify: (message: string) => void }) {
  return <div className="drawer-layer" role="dialog" aria-modal="true" aria-labelledby="member-name" onMouseDown={(event) => event.currentTarget === event.target && close()}><aside className="member-drawer"><div className="drawer-top"><span>Member profile</span><button className="icon-button" onClick={close} aria-label="Close profile"><X size={18} /></button></div><div className="profile-hero"><span className={`avatar avatar-xl ${member.color}`}>{member.initials}</span><h2 id="member-name">{member.name}</h2><StatusPill status={member.status} /><p>Member since {member.joined}</p></div><div className="drawer-actions"><button onClick={() => notify(`Message sent to ${member.name}`)}><Mail size={16} /> Message</button><button onClick={() => notify(`Calling ${member.phone}`)}><Phone size={16} /> Call</button><button onClick={() => notify("More actions opened")}><MoreHorizontal size={16} /> More</button></div><section className="drawer-section"><h3>Membership</h3><div className="membership-card"><div><span>{member.plan}</span><strong>{member.amount}</strong></div><div><small>Next renewal</small><b>{member.renewal}</b></div></div></section><section className="drawer-section"><h3>Activity this month</h3><div className="drawer-metrics"><div><strong>{member.visits}</strong><span>Visits</span></div><div><strong>{member.attendance}%</strong><span>Attendance</span></div><div><strong>4.8</strong><span>Avg. / week</span></div></div><div className="activity-progress"><span><i style={{ width: `${member.attendance}%` }} /></span><small>{member.attendance >= 70 ? "On track with their monthly goal" : "Below their usual attendance"}</small></div></section><section className="drawer-section"><h3>Contact</h3><dl className="contact-list"><div><dt><Mail size={14} /> Email</dt><dd>{member.email}</dd></div><div><dt><Phone size={14} /> Phone</dt><dd>{member.phone}</dd></div></dl></section><section className="drawer-section"><h3>Recent activity</h3><div className="timeline"><div><i className="green" /><span><strong>Gym check-in</strong><small>{member.lastVisit}</small></span></div><div><i className="purple" /><span><strong>Payment completed</strong><small>24 Jul 2026 - {member.amount}</small></span></div><div><i className="blue" /><span><strong>Profile updated</strong><small>19 Jul 2026</small></span></div></div></section></aside></div>;
}

export default function MembersPage() {
  const [members, setMembers] = useState(seedMembers);
  const [status, setStatus] = useState<StatusFilter>("All");
  const [query, setQuery] = useState("");
  const [plan, setPlan] = useState("All plans");
  const [attendance, setAttendance] = useState("Any attendance");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [activeMember, setActiveMember] = useState<Member | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  const [page, setPage] = useState(1);

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };
  const filteredMembers = useMemo(() => members.filter((member) => {
    const text = `${member.name} ${member.email} ${member.phone} ${member.plan}`.toLowerCase();
    const attendanceMatches = attendance === "Any attendance" || (attendance === "Above 70%" ? member.attendance >= 70 : attendance === "40-70%" ? member.attendance >= 40 && member.attendance < 70 : member.attendance < 40);
    return (status === "All" || member.status === status) && (plan === "All plans" || member.plan === plan) && attendanceMatches && text.includes(query.trim().toLowerCase());
  }), [members, status, plan, attendance, query]);
  const allVisibleSelected = filteredMembers.length > 0 && filteredMembers.every((member) => selected.has(member.id));

  function toggleAll() {
    setSelected((current) => { const next = new Set(current); if (allVisibleSelected) filteredMembers.forEach((member) => next.delete(member.id)); else filteredMembers.forEach((member) => next.add(member.id)); return next; });
  }

  function exportMembers() {
    const csv = ["Name,Email,Phone,Plan,Status,Visits,Renewal", ...filteredMembers.map((member) => [member.name, member.email, member.phone, member.plan, member.status, member.visits, member.renewal].map((value) => `"${value}"`).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a"); link.href = url; link.download = "gymwise-members.csv"; link.click(); URL.revokeObjectURL(url); notify("Member list exported");
  }

  function addMember(member: Member) {
    setMembers((current) => [member, ...current]); setModalOpen(false); setStatus("All"); setQuery(""); notify(`${member.name} was added successfully`);
  }

  return <div className="app-shell"><DashboardSidebar open={mobileNav} onClose={() => setMobileNav(false)} onNotify={notify} /><div className="app-content"><Header onMenu={() => setMobileNav(true)} focusSearch={() => document.getElementById("member-search")?.focus()} notify={notify} /><main className="dashboard members-dashboard"><div className="page-heading members-heading"><div><p className="members-breadcrumb">Workspace <ChevronRight size={12} /> Members</p><h1>Members</h1><p>Manage your community, memberships, and renewals.</p></div><div className="heading-actions"><button className="button secondary import-button" onClick={() => notify("Import template is ready")}><Upload size={16} /> Import</button><button className="button secondary" onClick={exportMembers}><Download size={16} /> Export</button><button className="button primary" onClick={() => setModalOpen(true)}><Plus size={17} /> Add member</button></div></div>

    <section className="member-stats" aria-label="Member statistics"><StatCard icon={Users} tone="purple" label="Total members" value="1,284" change="4.8%" note="58 joined this month" /><StatCard icon={UserCheck} tone="green" label="Active members" value="1,176" change="3.2%" note="91.6% of total members" /><StatCard icon={CalendarDays} tone="amber" label="Expiring soon" value="32" change="6.7%" note="Within the next 14 days" /><StatCard icon={UserRoundX} tone="rose" label="Needs attention" value="18" change="2.1%" note="Inactive for 21+ days" /></section>

    <section className="panel members-panel"><div className="members-panel-head"><div><h2>All members</h2><p>{filteredMembers.length === members.length ? "1,284 people in your community" : `${filteredMembers.length} matching members`}</p></div><div className="panel-head-actions"><button className="button secondary" onClick={() => notify("Saved member views opened")}><Sparkles size={14} /> Saved views <ChevronDown size={13} /></button><button className="icon-button" onClick={() => notify("Table options opened")} aria-label="Table options"><MoreHorizontal size={17} /></button></div></div><div className="member-toolbar"><div className="status-tabs" role="tablist">{(["All", "Active", "Expiring", "Paused", "Inactive"] as StatusFilter[]).map((item) => <button role="tab" aria-selected={status === item} className={status === item ? "selected" : ""} onClick={() => { setStatus(item); setPage(1); }} key={item}>{item}<span>{item === "All" ? "1,284" : item === "Active" ? "1,176" : item === "Expiring" ? "32" : item === "Paused" ? "21" : "55"}</span></button>)}</div><div className="member-tools"><label className="member-search"><Search size={15} /><input id="member-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search members..." />{query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={13} /></button>}</label><button className={`button secondary filter-trigger ${filtersOpen ? "active" : ""}`} onClick={() => setFiltersOpen((open) => !open)}><Filter size={15} /> Filter{(plan !== "All plans" || attendance !== "Any attendance") && <i />}</button></div></div>
      {filtersOpen && <div className="member-filters"><div><label>Membership<select value={plan} onChange={(event) => setPlan(event.target.value)}><option>All plans</option><option>Monthly Flex</option><option>Strength Pro</option><option>Annual Unlimited</option></select></label><label>Attendance<select value={attendance} onChange={(event) => setAttendance(event.target.value)}><option>Any attendance</option><option>Above 70%</option><option>40-70%</option><option>Below 40%</option></select></label><label>Joined<select onChange={() => notify("Join date filter applied")} defaultValue="Any time"><option>Any time</option><option>This month</option><option>Last 3 months</option><option>This year</option></select></label></div><button onClick={() => { setPlan("All plans"); setAttendance("Any attendance"); }}>Clear filters</button></div>}
      {selected.size > 0 && <div className="bulk-bar"><div><span>{selected.size}</span><strong>{selected.size === 1 ? "member" : "members"} selected</strong></div><button onClick={() => notify(`Message queued for ${selected.size} members`)}><Mail size={14} /> Send message</button><button onClick={() => notify("Membership action opened")}><CreditCard size={14} /> Change membership</button><button className="bulk-more" onClick={() => notify("More bulk actions opened")}><MoreHorizontal size={15} /></button><button className="bulk-close" onClick={() => setSelected(new Set())}><X size={15} /></button></div>}
      <div className="member-table-wrap roster-wrap"><table className="member-table roster-table"><thead><tr><th className="check-column"><input type="checkbox" aria-label="Select all visible members" checked={allVisibleSelected} onChange={toggleAll} /></th><th>Member</th><th>Membership</th><th>Status</th><th>Visits</th><th>Last visit</th><th>Next renewal</th><th aria-label="Actions" /></tr></thead><tbody>{filteredMembers.map((member) => <tr key={member.id} onClick={() => setActiveMember(member)}><td className="check-column" onClick={(event) => event.stopPropagation()}><input type="checkbox" aria-label={`Select ${member.name}`} checked={selected.has(member.id)} onChange={() => setSelected((current) => { const next = new Set(current); if (next.has(member.id)) next.delete(member.id); else next.add(member.id); return next; })} /></td><td><div className="member-cell"><span className={`avatar ${member.color}`}>{member.initials}</span><div><strong>{member.name}</strong><small>{member.email}</small></div></div></td><td><div className="plan-cell"><strong>{member.plan}</strong><small>{member.amount} &middot; {member.plan === "Annual Unlimited" ? "Yearly" : "Monthly"}</small></div></td><td><StatusPill status={member.status} /></td><td><div className="visits-cell"><strong>{member.visits}</strong><span><i style={{ width: `${member.attendance}%` }} /></span></div></td><td><span className={member.lastVisit.includes("Today") ? "recent-visit" : "last-visit"}>{member.lastVisit}</span></td><td><div className={`renewal-cell ${member.status === "Expiring" || member.status === "Inactive" ? "attention" : ""}`}><strong>{member.renewal}</strong><small>{member.status === "Expiring" ? "Due soon" : member.status === "Inactive" ? "Payment overdue" : "Auto-renew on"}</small></div></td><td><button className="icon-button small row-more" onClick={(event) => { event.stopPropagation(); setActiveMember(member); }} aria-label={`Open ${member.name}`}><MoreHorizontal size={16} /></button></td></tr>)}{filteredMembers.length === 0 && <tr><td colSpan={8}><div className="member-empty"><div><Search size={20} /></div><strong>No members found</strong><span>Try adjusting your search or filters.</span><button onClick={() => { setQuery(""); setStatus("All"); setPlan("All plans"); setAttendance("Any attendance"); }}>Clear all filters</button></div></td></tr>}</tbody></table></div>
      <div className="table-footer"><span>Showing <strong>{filteredMembers.length ? 1 : 0}-{filteredMembers.length}</strong> of <strong>{status === "All" && !query && plan === "All plans" ? "1,284" : filteredMembers.length}</strong> members</span><div><label>Rows per page<select defaultValue="10"><option>10</option><option>25</option><option>50</option></select></label><button className="icon-button small" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft size={16} /></button><span className="page-number">{page}</span><button className="icon-button small" onClick={() => { setPage((value) => value + 1); notify("Loaded the next page"); }}><ChevronRight size={16} /></button></div></div></section><footer className="dashboard-footer"><span>&copy; 2026 Gymwise Technologies</span><span><ShieldCheck size={11} /> Your member data is encrypted and secure</span></footer></main></div>
    <nav className="mobile-tabs" aria-label="Mobile navigation"><Link href="/"><LayoutDashboard size={18} />Overview</Link><Link className="active" href="/members"><Users size={18} />Members</Link><button className="mobile-add" onClick={() => setModalOpen(true)} aria-label="Add member"><Plus size={21} /></button><Link href="/attendance"><Activity size={18} />Attendance</Link><Link href="/messages"><MessageCircle size={18} />Messages</Link></nav>
    {modalOpen && <AddMemberModal close={() => setModalOpen(false)} addMember={addMember} />}{activeMember && <MemberDrawer member={activeMember} close={() => setActiveMember(null)} notify={notify} />}{toast && <div className="toast" role="status"><span><Check size={15} /></span>{toast}</div>}
  </div>;
}
