"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  CircleHelp,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  TrendingUp,
  Users,
  WalletCards,
  X,
  Zap,
} from "lucide-react";

const navigation = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
      { label: "Members", icon: Users, href: "/members" },
      // { label: "Attendance", icon: Activity, href: "/attendance" },
      { label: "Payments", icon: WalletCards, href: "/payments" },
      // { label: "Messages", icon: MessageCircle, href: "/messages", badge: "8" },
    ],
  },
  {
    label: "Manage",
    items: [
      { label: "Memberships", icon: CreditCard, href: "/memberships" },
      // { label: "Trainers", icon: Dumbbell, href: "/trainers" },
      // { label: "Reports", icon: BarChart3, href: "/reports" },
      { label: "Automations", icon: Zap, href: "/automations", badge: "NEW" },
    ],
  },
];

function Brand() {
  return <div className="brand"><div className="brand-mark"><TrendingUp size={18} strokeWidth={2.8} /></div><span>Gecco</span></div>;
}

type DashboardSidebarProps = {
  open: boolean;
  onClose: () => void;
  onNotify: (message: string) => void;
};

export { Brand };

export default function DashboardSidebar({ open, onClose, onNotify }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  function signOut() {
    onClose();
    router.replace("/login");
  }

  return <>
    {open && <button className="sidebar-scrim" aria-label="Close navigation" onClick={onClose} />}
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="sidebar-top"><Brand /><button className="icon-button sidebar-close" onClick={onClose} aria-label="Close navigation"><X size={18} /></button></div>
      <button className="location-switcher" onClick={() => onNotify("Location switcher opened")}><span className="location-icon"><Dumbbell size={17} /></span><span><strong>Pulse Fitness</strong><small>South Delhi</small></span><ChevronDown size={15} /></button>
      <nav className="main-nav" aria-label="Primary navigation">
        {navigation.map((group) => <div className="nav-group" key={group.label}>
          <div className="nav-label">{group.label}</div>
          {group.items.map(({ label, icon: Icon, href, badge }) => {
            const active = pathname === href;
            return <Link key={label} href={href} onClick={onClose} className={`nav-item ${active ? "active" : ""}`}><Icon size={18} strokeWidth={active ? 2.2 : 1.8} /><span>{label}</span>{badge && <span className={`nav-badge ${badge === "NEW" ? "new" : ""}`}>{badge}</span>}</Link>;
          })}
        </div>)}
      </nav>
      <div className="sidebar-bottom">
        <button className="nav-item" onClick={() => window.open("https://mail.google.com/mail/?view=cm&fs=1&to=support%40gecco.in", "_blank", "noopener,noreferrer")}><CircleHelp size={18} /><span>Help & support</span></button>
        <button className="nav-item" onClick={signOut}><LogOut size={18} /><span>Sign out</span></button>
      </div>
    </aside>
  </>;
}
