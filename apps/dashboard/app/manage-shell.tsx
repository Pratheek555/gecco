"use client";

import Link from "next/link";
import {
  BarChart3, Bell, Check, ChevronDown, HelpCircle, Home, Menu, Moon,
  Search, Sun, Users, Zap, Dumbbell,
} from "lucide-react";
import { useState } from "react";
import { ManagedPage, type ManagedView } from "./managed-pages";
import DashboardSidebar, { Brand } from "./dashboard-sidebar";

function ThemeToggle() {
  function toggle() { const dark = document.documentElement.dataset.theme !== "dark"; document.documentElement.dataset.theme = dark ? "dark" : "light"; localStorage.setItem("gecco-theme", dark ? "dark" : "light"); }
  return <button className="icon-button theme-button" onClick={toggle} aria-label="Toggle color theme"><Sun className="theme-sun" size={18} /><Moon className="theme-moon" size={18} /></button>;
}

export default function ManageShell({ view }: { view: Exclude<ManagedView, "Members"> }) {
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2600); }
  return <div className="app-shell">
    <DashboardSidebar open={mobileNav} onClose={() => setMobileNav(false)} onNotify={notify} />
    <div className="app-content"><header className="topbar"><div className="topbar-left"><button className="icon-button menu-button" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="mobile-brand"><Brand /></div><button className="search-box" onClick={() => notify("Global search opened")}><Search size={16} /><span>Search members, payments...</span><kbd>⌘ K</kbd></button></div><div className="topbar-actions"><button className="icon-button help-button" onClick={() => notify("Help centre opened")} aria-label="Help"><HelpCircle size={18} /></button><ThemeToggle /><button className="icon-button notification-button" onClick={() => notify("You have 3 new notifications")} aria-label="Notifications"><Bell size={18} /><i /></button><div className="topbar-divider" /><button className="profile" onClick={() => notify("Profile menu opened")}><span className="avatar avatar-main">PK</span><span className="profile-copy"><strong>Priya Khanna</strong><small>Owner</small></span><ChevronDown size={15} /></button></div></header><main className="dashboard managed-dashboard"><ManagedPage view={view} notify={notify} /></main></div>
    <nav className="mobile-tabs" aria-label="Mobile navigation"><Link href="/dashboard"><Home size={19} /><span>Home</span></Link><Link href="/members"><Users size={19} /><span>Members</span></Link><Link className="mobile-add" href="/automations" aria-label="Automations"><Zap size={21} /></Link><Link href="/reports"><BarChart3 size={19} /><span>Reports</span></Link><Link href="/trainers"><Dumbbell size={19} /><span>Trainers</span></Link></nav>
    {toast && <div className="toast" role="status"><span><Check size={15} /></span>{toast}</div>}
  </div>;
}
