"use client";

import Link from "next/link";
import {
  Activity, BarChart3, Bell, Check, ChevronDown, CircleHelp, CreditCard,
  Dumbbell, HelpCircle, Home, LayoutDashboard, Menu, MessageCircle, Moon,
  Search, Settings, Sparkles, Sun, TrendingUp, Users, WalletCards, X, Zap,
} from "lucide-react";
import { useState } from "react";
import { ManagedPage, type ManagedView } from "./managed-pages";

const navigation = [
  { label: "Workspace", items: [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Members", icon: Users, href: "/members" },
    { label: "Attendance", icon: Activity, href: "/attendance" },
    { label: "Payments", icon: WalletCards, href: "/payments" },
    { label: "Messages", icon: MessageCircle, href: "/messages", badge: "8" },
  ] },
  { label: "Manage", items: [
    { label: "Memberships", icon: CreditCard, href: "/memberships" },
    { label: "Trainers", icon: Dumbbell, href: "/trainers" },
    { label: "Reports", icon: BarChart3, href: "/reports" },
    { label: "Automations", icon: Zap, href: "/automations", badge: "NEW" },
  ] },
];

function Brand() {
  return <div className="brand"><div className="brand-mark"><TrendingUp size={18} strokeWidth={2.8} /></div><span>Gecco</span></div>;
}

function ThemeToggle() {
  function toggle() { const dark = document.documentElement.dataset.theme !== "dark"; document.documentElement.dataset.theme = dark ? "dark" : "light"; localStorage.setItem("gecco-theme", dark ? "dark" : "light"); }
  return <button className="icon-button theme-button" onClick={toggle} aria-label="Toggle color theme"><Sun className="theme-sun" size={18} /><Moon className="theme-moon" size={18} /></button>;
}

export default function ManageShell({ view }: { view: Exclude<ManagedView, "Members"> }) {
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2600); }
  return <div className="app-shell">
    {mobileNav && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="sidebar-top"><Brand /><button className="icon-button sidebar-close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18} /></button></div>
      <button className="location-switcher" onClick={() => notify("Location switcher opened")}><span className="location-icon"><Dumbbell size={17} /></span><span><strong>Pulse Fitness</strong><small>South Delhi</small></span><ChevronDown size={15} /></button>
      <nav className="main-nav" aria-label="Primary navigation">{navigation.map((group) => <div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.items.map(({ label, icon: Icon, href, badge }) => <Link key={label} href={href} onClick={() => setMobileNav(false)} className={`nav-item ${label === view ? "active" : ""}`}><Icon size={18} strokeWidth={label === view ? 2.2 : 1.8} /><span>{label}</span>{badge && <span className={`nav-badge ${badge === "NEW" ? "new" : ""}`}>{badge}</span>}</Link>)}</div>)}</nav>
      <div className="sidebar-bottom"><div className="insight-card"><span className="insight-icon"><Sparkles size={16} /></span><strong>Growth insight</strong><p>Annual-plan conversion is up 18% this month.</p><button onClick={() => notify("Growth insight opened")}>View insight</button></div><button className="nav-item" onClick={() => notify("Settings opened")}><Settings size={18} /><span>Settings</span></button><button className="nav-item" onClick={() => notify("Help centre opened")}><CircleHelp size={18} /><span>Help & support</span></button></div>
    </aside>
    <div className="app-content"><header className="topbar"><div className="topbar-left"><button className="icon-button menu-button" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="mobile-brand"><Brand /></div><button className="search-box" onClick={() => notify("Global search opened")}><Search size={16} /><span>Search members, payments...</span><kbd>⌘ K</kbd></button></div><div className="topbar-actions"><button className="icon-button help-button" onClick={() => notify("Help centre opened")} aria-label="Help"><HelpCircle size={18} /></button><ThemeToggle /><button className="icon-button notification-button" onClick={() => notify("You have 3 new notifications")} aria-label="Notifications"><Bell size={18} /><i /></button><div className="topbar-divider" /><button className="profile" onClick={() => notify("Profile menu opened")}><span className="avatar avatar-main">PK</span><span className="profile-copy"><strong>Priya Khanna</strong><small>Owner</small></span><ChevronDown size={15} /></button></div></header><main className="dashboard managed-dashboard"><ManagedPage view={view} notify={notify} /></main></div>
    <nav className="mobile-tabs" aria-label="Mobile navigation"><Link href="/dashboard"><Home size={19} /><span>Home</span></Link><Link href="/members"><Users size={19} /><span>Members</span></Link><Link className="mobile-add" href="/automations" aria-label="Automations"><Zap size={21} /></Link><Link href="/reports"><BarChart3 size={19} /><span>Reports</span></Link><Link href="/trainers"><Dumbbell size={19} /><span>Trainers</span></Link></nav>
    {toast && <div className="toast" role="status"><span><Check size={15} /></span>{toast}</div>}
  </div>;
}
