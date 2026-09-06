"use client";

import Link from "next/link";
import { Home, Plus, CreditCard, Users, WalletCards } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

type MobileNavigationProps = {
  active?: "home" | "members" | "payments";
  onNotify: (message: string) => void;
  onAdd?: () => void;
};

export default function MobileNavigation({ active: suppliedActive, onAdd }: MobileNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const active =
    suppliedActive ??
    (pathname === "/dashboard"
      ? "home"
      : pathname === "/members"
        ? "members"
        : pathname === "/payments"
          ? "payments"
          : undefined);
  return (
    <nav className="mobile-tabs" aria-label="Mobile navigation">
      <Link
        className={active === "home" ? "active" : undefined}
        href="/dashboard"
        aria-current={active === "home" ? "page" : undefined}
      >
        <Home size={19} />
        <span>Home</span>
      </Link>
      <Link
        className={active === "members" ? "active" : undefined}
        href="/members"
        aria-current={active === "members" ? "page" : undefined}
      >
        <Users size={19} />
        <span>Members</span>
      </Link>
      <button
        className="mobile-add"
        type="button"
        onClick={onAdd ?? (() => router.push("/members?add=1"))}
        aria-label={active === "payments" ? "Record payment" : "Add member"}
      >
        <Plus size={21} />
      </button>
      <Link
        className={active === "payments" ? "active" : undefined}
        href="/payments"
        aria-current={active === "payments" ? "page" : undefined}
      >
        <WalletCards size={19} />
        <span>Payments</span>
      </Link>
      <Link
        href="/memberships"
        className={pathname === "/memberships" ? "active" : undefined}
        aria-current={pathname === "/memberships" ? "page" : undefined}
      >
        <CreditCard size={19} />
        <span>Plans</span>
      </Link>
    </nav>
  );
}
