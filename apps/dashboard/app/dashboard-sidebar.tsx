"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MessageCircle,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  TrendingUp,
  Target,
  UserPlus,
  Users,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useSession, type CurrentSession } from "./session-provider";
import type { Permission } from "./api/auth/permissions";

const navigation: Array<{
  label: string;
  items: Array<{ label: string; icon: typeof Users; href: string; permission: Permission; badge?: string }>;
}> = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", icon: LayoutDashboard, href: "/dashboard", permission: "overview:read" },
      { label: "Members", icon: Users, href: "/members", permission: "members:read" },
      { label: "Leads", icon: Target, href: "/leads", permission: "leads:read" },
      // { label: "Attendance", icon: Activity, href: "/attendance" },
      { label: "Payments", icon: WalletCards, href: "/payments", permission: "payments:read" },
      { label: "Messages", icon: MessageCircle, href: "/messages", permission: "members:read" },
    ],
  },
  {
    label: "Manage",
    items: [
      { label: "Memberships", icon: CreditCard, href: "/memberships", permission: "memberships:read" },
      { label: "Trainers", icon: Dumbbell, href: "/trainers", permission: "trainers:read" },
      { label: "Team", icon: UserPlus, href: "/team", permission: "team:manage" },
      // { label: "Reports", icon: BarChart3, href: "/reports" },
      { label: "Automations", icon: Zap, href: "/automations", permission: "gym:manage", badge: "NEW" },
    ],
  },
];

function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark">
        <TrendingUp size={18} strokeWidth={2.8} />
      </div>
      <span>Gecco</span>
    </div>
  );
}

type DashboardSidebarProps = {
  open: boolean;
  onClose: () => void;
  onNotify: (message: string) => void;
};

export { Brand };

type GymOption = CurrentSession["activeGym"];

export default function DashboardSidebar({ open, onClose, onNotify }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, setActiveGym } = useSession();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [switchingGymId, setSwitchingGymId] = useState("");

  async function switchGym(gym: GymOption) {
    if (!session || gym.id === session.activeGym.id) {
      setSwitcherOpen(false);
      return;
    }

    setSwitchingGymId(gym.id);
    try {
      const response = await fetch("/api/session/gym", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gymId: gym.id }),
      });
      const data = (await response.json()) as { activeGym?: GymOption; error?: string };
      if (!response.ok || !data.activeGym) throw new Error(data.error ?? "Could not switch gym.");

      setActiveGym(data.activeGym);
      setSwitcherOpen(false);
      onNotify(`Switched to ${data.activeGym.name}`);
      router.refresh();
      window.location.reload();
    } catch (error) {
      onNotify(error instanceof Error ? error.message : "Could not switch gym.");
    } finally {
      setSwitchingGymId("");
    }
  }

  async function signOut() {
    onClose();
    try {
      await fetch("/api/session", { method: "DELETE" });
    } finally {
      router.replace("/login");
    }
  }

  const activeGym = session?.activeGym;
  return (
    <>
      {open && <button className="sidebar-scrim" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <Brand />
          <button
            className="icon-button sidebar-close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
        <div className="location-switcher-wrap">
          <button
            className="location-switcher"
            onClick={() => setSwitcherOpen((current) => !current)}
            aria-expanded={switcherOpen}
            aria-haspopup="listbox"
          >
            <span className="location-icon">
              <Dumbbell size={17} />
            </span>
            <span>
              <strong>{activeGym?.name ?? "Loading gym…"}</strong>
              <small>{activeGym?.timezone ?? "Loading current gym"}</small>
            </span>
            <ChevronDown size={15} />
          </button>
          {switcherOpen && (
            <div className="gym-switcher-menu" role="listbox" aria-label="Choose gym">
              {session?.gyms.map((gym) => (
                <button
                  key={gym.id}
                  role="option"
                  aria-selected={gym.id === activeGym?.id}
                  className={gym.id === activeGym?.id ? "selected" : ""}
                  disabled={Boolean(switchingGymId)}
                  onClick={() => void switchGym(gym)}
                >
                  <span>
                    <strong>{gym.name}</strong>
                    <small>{gym.timezone}</small>
                  </span>
                  {switchingGymId === gym.id ? (
                    <span className="gym-switcher-spinner" aria-label="Switching" />
                  ) : gym.id === activeGym?.id ? (
                    <span className="gym-switcher-check">✓</span>
                  ) : null}
                </button>
              ))}
              {session && session.gyms.length === 0 && <p>No active gyms available.</p>}
              {!session && <p>Loading gyms…</p>}
            </div>
          )}
        </div>
        <nav className="main-nav" aria-label="Primary navigation">
          {navigation.map((group) => {
            const items = group.items.filter((item) =>
              session?.activeGym.permissions.includes(item.permission),
            );
            if (!items.length) return null;
            return (
            <div className="nav-group" key={group.label}>
              <div className="nav-label">{group.label}</div>
              {items.map(({ label, icon: Icon, href, badge }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={label}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onClick={onClose}
                    className={`nav-item ${active ? "active" : ""}`}
                  >
                    <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                    <span>{label}</span>
                    {badge && (
                      <span className={`nav-badge ${badge === "NEW" ? "new" : ""}`}>{badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <button
            className="nav-item"
            onClick={() =>
              window.open(
                "https://mail.google.com/mail/?view=cm&fs=1&to=support%40gecco.in",
                "_blank",
                "noopener,noreferrer",
              )
            }
          >
            <CircleHelp size={18} />
            <span>Help & support</span>
          </button>
          <button className="nav-item" onClick={() => void signOut()}>
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
