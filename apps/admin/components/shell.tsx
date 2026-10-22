"use client";

import { ArrowUpRight, ChartLine, Dumbbell, LayoutGrid, LogOut, Menu, Search, Send, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { signOutAction } from "@/app/actions";
import { Mark } from "./mark";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutGrid },
  { href: "/onboarding", label: "Onboarding", icon: Send },
  { href: "/gyms", label: "Gyms", icon: Dumbbell },
  { href: "/accounts", label: "Accounts", icon: Users },
  { href: "/growth", label: "Growth", icon: ChartLine },
];

type ShellProps = {
  admin: { name: string; email: string; initials: string };
  scope: { gyms: number; waitingLinks: number };
  stamp: string;
  dashboardUrl: string | null;
  sample: boolean;
  children: ReactNode;
};

export function Shell({ admin, scope, stamp, dashboardUrl, sample, children }: ShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const current = NAV.find((item) => (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      const target = event.target as HTMLElement | null;
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey &&
          !target?.closest("input, textarea, select, [contenteditable=true], dialog[open]")) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="app">
      <aside className="sidebar" data-open={open} aria-label="Gecco HQ">
        <div className="brand">
          <Mark />
          Gecco HQ
          <button type="button" className="btn ghost small menu-close" onClick={() => setOpen(false)} aria-label="Close menu">
            <X />
          </button>
        </div>
        <div className="scope">
          <span>Scope</span>
          <strong>All gyms on Gecco</strong>
          <span className="num">
            {scope.gyms} active · {scope.waitingLinks} {scope.waitingLinks === 1 ? "link" : "links"} out
          </span>
        </div>
        <nav className="nav">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="nav-item" onClick={() => setOpen(false)} aria-current={current?.href === href ? "page" : undefined}>
              <Icon />
              {label}
            </Link>
          ))}
        </nav>
        {dashboardUrl && (
          <>
            <p className="group-label">Elsewhere</p>
            <a className="nav-item" href={dashboardUrl} target="_blank" rel="noreferrer">
              <ArrowUpRight />
              Customer dashboard
            </a>
          </>
        )}
        <div className="sidebar-foot">
          {sample && <p className="notice">Sample data. Nothing you change here is saved.</p>}
          <div className="user-row">
            <span className="avatar" aria-hidden="true">{admin.initials}</span>
            <div>
              <strong>{admin.name}</strong>
              <small>{admin.email}</small>
            </div>
          </div>
          <form action={signOutAction}>
            <button type="submit" className="nav-item nav-button">
              <LogOut />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <header className="topbar">
        <button type="button" className="btn ghost small menu-toggle" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu />
        </button>
        <span className="mobile-title">{current?.label ?? "Gecco HQ"}</span>
        <form className="search" action="/gyms" role="search">
          <Search aria-hidden="true" />
          <label className="sr-only" htmlFor="global-search">Search gyms and owners</label>
          <input ref={searchRef} id="global-search" name="q" type="search" placeholder="Search gyms and owners" autoComplete="off" />
          <kbd>/</kbd>
        </form>
        <div className="topbar-right">
          <span className="stamp">{stamp}</span>
        </div>
      </header>

      <main className="sheet">{children}</main>
    </div>
  );
}
