"use client";

import { Check, Menu, Moon, Sun } from "lucide-react";
import { createContext, type ReactNode, useContext, useState } from "react";
import DashboardSidebar, { Brand } from "./dashboard-sidebar";
import MobileNavigation from "./mobile-navigation";
import ProfileMenu from "./profile-menu";

export type Notify = (message: string) => void;

const DashboardToastContext = createContext<Notify | null>(null);

export function useDashboardToast() {
  const notify = useContext(DashboardToastContext);

  if (!notify) {
    throw new Error("useDashboardToast must be used inside ManageShell.");
  }

  return notify;
}

function ThemeToggle() {
  function toggle() {
    const dark = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("gecco-theme", dark ? "dark" : "light");
  }
  return (
    <button className="icon-button theme-button" onClick={toggle} aria-label="Toggle color theme">
      <Sun className="theme-sun" size={18} />
      <Moon className="theme-moon" size={18} />
    </button>
  );
}

export default function ManageShell({ children }: { children: ReactNode }) {
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }
  return (
    <DashboardToastContext value={notify}>
      <div className="app-shell">
        <DashboardSidebar open={mobileNav} onClose={() => setMobileNav(false)} onNotify={notify} />
        <div className="app-content">
          <header className="topbar">
            <div className="topbar-left">
              <button
                className="icon-button menu-button"
                onClick={() => setMobileNav(true)}
                aria-label="Open navigation"
              >
                <Menu size={20} />
              </button>
              <div className="mobile-brand">
                <Brand />
              </div>
            </div>
            <div className="topbar-actions">
              <ThemeToggle />
              <div className="topbar-divider" />
              <ProfileMenu name="Priya Khanna" initials="PK" role="Owner" onNotify={notify} />
            </div>
          </header>
          <main className="dashboard managed-dashboard">{children}</main>
        </div>
        <MobileNavigation onNotify={notify} />
        {toast && (
          <div className="toast" role="status">
            <span>
              <Check size={15} />
            </span>
            {toast}
          </div>
        )}
      </div>
    </DashboardToastContext>
  );
}
