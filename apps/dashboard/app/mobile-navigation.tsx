"use client";

import Link from "next/link";
import { Home, Plus, Settings, Users, WalletCards } from "lucide-react";

type MobileNavigationProps = {
  active?: "home" | "members" | "payments";
  onNotify: (message: string) => void;
  onAdd?: () => void;
};

export default function MobileNavigation({ active, onNotify, onAdd }: MobileNavigationProps) {
  return <nav className="mobile-tabs" aria-label="Mobile navigation">
    <Link className={active === "home" ? "active" : undefined} href="/dashboard" aria-current={active === "home" ? "page" : undefined}><Home size={19} /><span>Home</span></Link>
    <Link className={active === "members" ? "active" : undefined} href="/members" aria-current={active === "members" ? "page" : undefined}><Users size={19} /><span>Members</span></Link>
    <button className="mobile-add" type="button" onClick={onAdd ?? (() => onNotify("Quick add opened"))} aria-label="Quick add"><Plus size={21} /></button>
    <Link className={active === "payments" ? "active" : undefined} href="/payments" aria-current={active === "payments" ? "page" : undefined}><WalletCards size={19} /><span>Payments</span></Link>
    <button type="button" onClick={() => onNotify("Settings opened")}><Settings size={19} /><span>Settings</span></button>
  </nav>;
}
