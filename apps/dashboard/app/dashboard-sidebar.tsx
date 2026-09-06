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
  Users,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useSession, type CurrentSession } from "./session-provider";

const navigation = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
      { label: "Members", icon: Users, href: "/members" },
      // { label: "Attendance", icon: Activity, href: "/attendance" },
      { label: "Payments", icon: WalletCards, href: "/payments" },
      { label: "Messages", icon: MessageCircle, href: "/messages", badge: undefined },
    ],
  },
  {
    label: "Manage",
    items: [
      { label: "Memberships", icon: CreditCard, href: "/memberships" },
      { label: "Trainers", icon: Dumbbell, href: "/trainers" },
      // { label: "Reports", icon: BarChart3, href: "/reports" },
      { label: "Automations", icon: Zap, href: "/automations", badge: "NEW" },
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

  function signOut() {
    onClose();
    router.replace("/login");
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
          {navigation.map((group) => (
            <div className="nav-group" key={group.label}>
              <div className="nav-label">{group.label}</div>
              {group.items.map(({ label, icon: Icon, href, badge }) => {
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
          ))}
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
          <button className="nav-item" onClick={signOut}>
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
