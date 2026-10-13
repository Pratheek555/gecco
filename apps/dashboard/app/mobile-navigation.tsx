"use client";

import Link from "next/link";
import { Home, Plus, Target, Users, WalletCards } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCan } from "./session-provider";

type MobileNavigationProps = {
  active?: "home" | "members" | "leads" | "payments";
  onNotify: (message: string) => void;
  onAdd?: () => void;
};

export default function MobileNavigation({ active: suppliedActive, onAdd }: MobileNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const canSeeOverview = useCan("overview:read");
  const canSeeMembers = useCan("members:read");
  const canAddMembers = useCan("members:write");
  const canSeeLeads = useCan("leads:read");
  const canAddLeads = useCan("leads:write");
  const canSeePayments = useCan("payments:read");
  const active =
    suppliedActive ??
    (pathname === "/dashboard"
      ? "home"
      : pathname === "/members"
        ? "members"
        : pathname === "/leads"
          ? "leads"
          : pathname === "/payments"
            ? "payments"
            : undefined);
  const canAdd = onAdd ? true : active === "leads" ? canAddLeads : canAddMembers;
  return (
    <nav className="mobile-tabs" aria-label="Mobile navigation">
      {canSeeOverview && (
        <Link
          className={active === "home" ? "active" : undefined}
          href="/dashboard"
          aria-current={active === "home" ? "page" : undefined}
        >
          <Home size={19} />
          <span>Home</span>
        </Link>
      )}
      {canSeeMembers && (
        <Link
          className={active === "members" ? "active" : undefined}
          href="/members"
          aria-current={active === "members" ? "page" : undefined}
        >
          <Users size={19} />
          <span>Members</span>
        </Link>
      )}
      {canAdd && (
        <button
          className="mobile-add"
          type="button"
          onClick={
            onAdd ??
            (() =>
              active === "leads"
                ? window.dispatchEvent(new CustomEvent("gecco:add-lead"))
                : router.push("/members?add=1"))
          }
          aria-label={
            active === "payments" ? "Record payment" : active === "leads" ? "Add lead" : "Add member"
          }
        >
          <Plus size={21} />
        </button>
      )}
      {canSeePayments && (
        <Link
          className={active === "payments" ? "active" : undefined}
          href="/payments"
          aria-current={active === "payments" ? "page" : undefined}
        >
          <WalletCards size={19} />
          <span>Payments</span>
        </Link>
      )}
      {canSeeLeads && (
        <Link
          href="/leads"
          className={active === "leads" ? "active" : undefined}
          aria-current={active === "leads" ? "page" : undefined}
        >
          <Target size={19} />
          <span>Leads</span>
        </Link>
      )}
    </nav>
  );
}
