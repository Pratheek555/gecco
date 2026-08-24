"use client";

import type { FormEvent } from "react";
import {
  Bell, CalendarDays, Check, ChevronDown, ChevronRight, Download, HelpCircle,
  CreditCard, Mail, Menu, Moon, Phone, Plus, Search,
  IndianRupee, MoreHorizontal, ShieldCheck, Sun, Upload, UserCheck, UserRoundX, Users, X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import DashboardSidebar, { Brand } from "../dashboard-sidebar";
import MobileNavigation from "../mobile-navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type MembershipStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

type Membership = {
  id: string;
  planTypeSnapshot: "GT" | "PT";
  agreedFee: string;
  startsOn: string;
  endsOn: string;
  status: MembershipStatus;
};

type Member = {
  id: string;
  fullName: string;
  memberships: Membership[];
  balance: {
    totalOutstanding: string;
    overdueAmount: string;
    availableCredit: string;
    oldestDueOn: string | null;
    paymentState: "OPEN" | "OVERDUE" | "PAID" | "CREDIT";
  };
};

type MembersResponse = {
  members: Member[];
  error?: string;
};

type SessionResponse = {
  user: { fullName: string };
  activeGym: { role: string };
};

type MemberDetailsResponse = {
  member: {
    contacts: { id: string; kind: "PHONE" | "EMAIL" | "WHATSAPP" | "OTHER"; value: string; isPrimary: boolean }[];
    notes: { id: string; body: string; createdAt: string; createdBy: { fullName: string } | null }[];
  };
  payments: {
    id: string;
    amount: string;
    paidOn: string;
    status: "SUCCEEDED" | "VOIDED" | "REFUNDED";
    reference: string | null;
    paymentMode: { name: string };
    recipient: { displayName: string };
  }[];
  error?: string;
};

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function initials(name: string) {
  return name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function membershipDuration(startsOn: string, endsOn: string) {
  const durationInDays = Math.round((new Date(endsOn).getTime() - new Date(startsOn).getTime()) / 86_400_000);
  const days = Math.max(1, durationInDays);
  return `${days} ${days === 1 ? "day" : "days"}`;
}

function ThemeToggle() {
  function toggleTheme() {
    const dark = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("gecco-theme", dark ? "dark" : "light");
  }

  return <button className="icon-button theme-button" onClick={toggleTheme} aria-label="Toggle color theme"><Sun className="theme-sun" size={18} /><Moon className="theme-moon" size={18} /></button>;
}

function Header({ onMenu, focusSearch, notify, session }: { onMenu: () => void; focusSearch: () => void; notify: (message: string) => void; session: SessionResponse | null }) {
  const displayRole = session?.activeGym.role ? session.activeGym.role.charAt(0) + session.activeGym.role.slice(1).toLowerCase() : "";
  return <header className="topbar"><div className="topbar-left"><button className="icon-button menu-button" onClick={onMenu} aria-label="Open navigation"><Menu size={20} /></button><div className="mobile-brand"><Brand /></div><button className="search-box" onClick={focusSearch}><Search size={16} /><span>Search members...</span><kbd>Ctrl K</kbd></button></div><div className="topbar-actions"><button className="icon-button help-button" onClick={() => notify("Help centre opened")} aria-label="Help"><HelpCircle size={18} /></button><ThemeToggle /><button className="icon-button notification-button" onClick={() => notify("You have 3 new notifications")} aria-label="Notifications"><Bell size={18} /><i /></button><div className="topbar-divider" /><button className="profile" onClick={() => notify("Profile menu opened")}><span className="avatar avatar-main">{session ? initials(session.user.fullName) : "…"}</span><span className="profile-copy"><strong>{session?.user.fullName ?? "Loading…"}</strong><small>{displayRole}</small></span><ChevronDown size={15} /></button></div></header>;
}

function MemberDrawer({ member, close }: { member: Member; close: () => void }) {
  return <div className="drawer-layer" role="dialog" aria-modal="true" aria-labelledby="member-name" onMouseDown={(event) => event.currentTarget === event.target && close()}><aside className="member-drawer"><div className="drawer-top"><span>Member details</span><button className="icon-button" onClick={close} aria-label="Close member details"><X size={18} /></button></div><div className="profile-hero"><span className="avatar avatar-xl violet">{initials(member.fullName)}</span><h2 id="member-name">{member.fullName}</h2><p>{member.memberships.length} active {member.memberships.length === 1 ? "membership" : "memberships"}</p></div><section className="drawer-section"><div className="mb-3 flex items-center justify-between gap-3"><h3>Active memberships</h3><Badge variant="secondary">{member.memberships.length} active</Badge></div>{member.memberships.length ? <div className="grid gap-3">{member.memberships.map((membership) => <Card key={membership.id} size="sm"><CardHeader><CardTitle>{membership.planTypeSnapshot === "GT" ? "Gym Training" : "Personal Training"}</CardTitle><CardDescription>Membership #{membership.id.slice(-6).toUpperCase()}</CardDescription><CardAction><Badge>{membership.status.charAt(0) + membership.status.slice(1).toLowerCase()}</Badge></CardAction></CardHeader><CardContent className="flex flex-col gap-3"><div className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="size-4" /><span>{new Date(membership.startsOn).toLocaleDateString("en-IN")} – {new Date(membership.endsOn).toLocaleDateString("en-IN")}</span></div><Separator /><div className="flex items-center gap-2"><IndianRupee className="size-4 text-muted-foreground" /><span className="font-medium">{money.format(Number(membership.agreedFee))}</span><span className="text-muted-foreground">Agreed fee</span></div></CardContent></Card>)}</div> : <p className="last-visit">No active memberships</p>}</section><section className="drawer-section"><h3>Balance</h3><div className="drawer-metrics"><div><strong>{money.format(Number(member.balance.totalOutstanding))}</strong><span>Outstanding</span></div><div><strong>{money.format(Number(member.balance.overdueAmount))}</strong><span>Overdue</span></div><div><strong>{money.format(Number(member.balance.availableCredit))}</strong><span>Credit</span></div></div></section><MemberDetailSections memberId={member.id} /></aside></div>;
}

function MemberDetailSections({ memberId }: { memberId: string }) {
  const [details, setDetails] = useState<MemberDetailsResponse | null>(null);
  const [error, setError] = useState("");
  const [remark, setRemark] = useState("");
  const [isSavingRemark, setIsSavingRemark] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDetails() {
      try {
        const response = await fetch(`/api/members/${memberId}`);
        const result = await response.json() as MemberDetailsResponse;
        if (!response.ok) throw new Error(result.error ?? "We could not load member details.");
        if (!cancelled) setDetails(result);
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "We could not load member details.");
      }
    }

    void loadDetails();
    return () => { cancelled = true; };
  }, [memberId]);

  async function addRemark(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = remark.trim();
    if (!body) return;

    setIsSavingRemark(true);
    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const created = await response.json() as MemberDetailsResponse["member"]["notes"][number] & { error?: string };
      if (!response.ok) throw new Error(created.error ?? "We could not save the remark.");
      setDetails((current) => current ? { ...current, member: { ...current.member, notes: [created, ...current.member.notes] } } : current);
      setRemark("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We could not save the remark.");
    } finally {
      setIsSavingRemark(false);
    }
  }

  if (error) return <section className="drawer-section"><p className="last-visit">{error}</p></section>;
  if (!details) return <section className="drawer-section"><p className="last-visit">Loading contact and payment details…</p></section>;

  const phoneContacts = details.member.contacts.filter((contact) => contact.kind === "PHONE" || contact.kind === "WHATSAPP");
  const emailContacts = details.member.contacts.filter((contact) => contact.kind === "EMAIL");

  return <><section className="drawer-section"><h3>Contact details</h3><dl className="contact-list"><div><dt><Phone size={14} /> Phone</dt><dd>{phoneContacts.map((contact) => contact.value).join(", ") || "Not provided"}</dd></div><div><dt><Mail size={14} /> Email</dt><dd>{emailContacts.map((contact) => contact.value).join(", ") || "Not provided"}</dd></div></dl></section><section className="drawer-section"><h3>Recent payments</h3>{details.payments.length ? <div className="timeline">{details.payments.map((payment) => <div key={payment.id}><i className="green" /><span><strong><CreditCard size={12} /> {money.format(Number(payment.amount))} · {payment.paymentMode.name}</strong><small>Paid to {payment.recipient.displayName} · {new Date(payment.paidOn).toLocaleDateString("en-IN")} · {payment.status.toLowerCase()}</small></span></div>)}</div> : <p className="last-visit">No payments recorded yet</p>}</section><section className="drawer-section"><h3>Remarks</h3><form className="member-remark-form" onSubmit={addRemark}><textarea value={remark} onChange={(event) => setRemark(event.target.value)} maxLength={2000} placeholder="Add a remark…" aria-label="Add a remark" /><button className="button secondary" type="submit" disabled={isSavingRemark || !remark.trim()}>{isSavingRemark ? "Saving…" : "Add remark"}</button></form>{details.member.notes.length ? <div className="timeline member-remarks">{details.member.notes.map((note) => <div key={note.id}><i className="purple" /><span><strong>{note.createdBy?.fullName ?? "Team member"}</strong><small>{note.body} · {new Date(note.createdAt).toLocaleDateString("en-IN")}</small></span></div>)}</div> : <p className="last-visit">No remarks yet</p>}</section></>;
}

function AddMemberDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (open: boolean) => void; onCreated: () => Promise<void> }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/members/addMember", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          memberNumber: `MEM-${Date.now()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`,
          joinedOn: new Date().toISOString(),
          contacts: [
            phone.trim() && { kind: "PHONE", value: phone.trim(), isPrimary: true },
            email.trim() && { kind: "EMAIL", value: email.trim(), isPrimary: true },
          ].filter(Boolean),
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "We could not create the member.");

      await onCreated();
      onOpenChange(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We could not create the member.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="gap-5 p-6 sm:max-w-lg"><DialogHeader><DialogTitle>Add member</DialogTitle><DialogDescription>Create a member profile for this gym.</DialogDescription></DialogHeader><form className="grid gap-4" onSubmit={submit}><div className="grid gap-2"><Label htmlFor="member-full-name">Full name</Label><Input id="member-full-name" value={fullName} onChange={(event) => setFullName(event.target.value)} required autoFocus placeholder="e.g. Ananya Verma" /></div><div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label htmlFor="member-phone">Phone number <span className="font-normal text-muted-foreground">Optional</span></Label><Input id="member-phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" /></div><div className="grid gap-2"><Label htmlFor="member-email">Email <span className="font-normal text-muted-foreground">Optional</span></Label><Input id="member-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /></div></div>{error && <p className="form-error" role="alert">{error}</p>}<DialogFooter className="mt-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating…" : "Add member"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [activeMember, setActiveMember] = useState<Member | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadMembers() {
      try {
        const response = await fetch("/api/members/allMembers");
        const result = await response.json() as MembersResponse;

        if (!response.ok) throw new Error(result.error ?? "We could not load members.");
        if (!cancelled) {
          setMembers(result.members);
          const searchParams = new URLSearchParams(window.location.search);
          if (searchParams.get("add") === "1") setIsAddMemberOpen(true);
          const requestedMember = result.members.find((member) => member.id === searchParams.get("member"));
          if (requestedMember) setActiveMember(requestedMember);
        }
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "We could not load members.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadMembers();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch("/api/session");
        if (!response.ok) return;
        const result = await response.json() as SessionResponse;
        if (!cancelled) setSession(result);
      } catch {
        // The members view remains usable if session display data cannot be loaded.
      }
    }

    void loadSession();
    return () => { cancelled = true; };
  }, []);

  async function refreshMembers() {
    const response = await fetch("/api/members/allMembers");
    const result = await response.json() as MembersResponse;
    if (!response.ok) throw new Error(result.error ?? "We could not load members.");
    setMembers(result.members);
  }

  const filteredMembers = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return members;
    return members.filter((member) => `${member.fullName} ${member.memberships.map((membership) => membership.planTypeSnapshot).join(" ")}`.toLowerCase().includes(search));
  }, [members, query]);

  const totals = useMemo(() => ({
    activeMemberships: members.reduce((total, member) => total + member.memberships.length, 0),
    outstanding: members.reduce((total, member) => total + Number(member.balance.totalOutstanding), 0),
    overdue: members.filter((member) => Number(member.balance.overdueAmount) > 0).length,
  }), [members]);

  function exportMembers() {
    const csv = [
      "Client name,Active memberships,Membership status,Dues",
      ...filteredMembers.map((member) => [
        member.fullName,
        member.memberships.map((membership) => `${membership.planTypeSnapshot} · ${money.format(Number(membership.agreedFee))}`).join("; ") || "No active memberships",
        member.memberships.map((membership) => membership.status).join("; ") || "—",
        money.format(Number(member.balance.totalOutstanding)),
      ].map((value) => `"${value.replaceAll("\"", "\"\"")}"`).join(",")),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "gecco-members.csv";
    link.click();
    URL.revokeObjectURL(url);
    notify("Member list exported");
  }

  return <div className="app-shell"><DashboardSidebar open={mobileNav} onClose={() => setMobileNav(false)} onNotify={notify} /><div className="app-content"><Header onMenu={() => setMobileNav(true)} focusSearch={() => document.getElementById("member-search")?.focus()} notify={notify} session={session} /><main className="dashboard members-dashboard"><div className="page-heading members-heading"><div><p className="members-breadcrumb">Workspace <ChevronRight size={12} /> Members</p><h1>Members</h1><p>Manage your community, memberships, and dues.</p></div><div className="heading-actions"><button className="button secondary import-button" onClick={() => notify("Import is not connected yet")}><Upload size={16} /> Import</button><button className="button secondary" onClick={exportMembers} disabled={isLoading || filteredMembers.length === 0}><Download size={16} /> Export</button><button className="button primary" onClick={() => setIsAddMemberOpen(true)}><Plus size={17} /> Add member</button></div></div>

    <section className="member-stats" aria-label="Member statistics"><article className="member-stat-card"><div className="member-stat-icon purple"><Users size={18} /></div><div className="member-stat-copy"><span>Total members</span><div><strong>{members.length}</strong></div><small>In your active gym</small></div></article><article className="member-stat-card"><div className="member-stat-icon green"><UserCheck size={18} /></div><div className="member-stat-copy"><span>Active memberships</span><div><strong>{totals.activeMemberships}</strong></div><small>Across all members</small></div></article><article className="member-stat-card"><div className="member-stat-icon amber"><ShieldCheck size={18} /></div><div className="member-stat-copy"><span>Outstanding dues</span><div><strong>{money.format(totals.outstanding)}</strong></div><small>Across all active memberships</small></div></article><article className="member-stat-card"><div className="member-stat-icon rose"><UserRoundX size={18} /></div><div className="member-stat-copy"><span>Overdue members</span><div><strong>{totals.overdue}</strong></div><small>Members with overdue dues</small></div></article></section>

    <section className="panel members-panel"><div className="members-panel-head"><div><h2>All members</h2><p>{isLoading ? "Loading members…" : query ? `${filteredMembers.length} matching members` : `${members.length} people in your community`}</p></div></div><div className="member-toolbar"><div /><div className="member-tools"><label className="member-search"><Search size={15} /><input id="member-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search members or memberships..." />{query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={13} /></button>}</label></div></div>
      <div className="member-table-wrap roster-wrap"><table className="member-table roster-table"><thead><tr><th>Client name</th><th>Active memberships</th><th>Membership status</th><th>Dues</th><th aria-label="Actions" /></tr></thead><tbody>{isLoading ? <tr><td colSpan={5}><div className="member-empty" aria-live="polite"><div><Spinner className="size-5" /></div><strong>Loading members</strong><span>Getting the latest member data for this gym.</span></div></td></tr> : error ? <tr><td colSpan={5}><div className="member-empty"><div><X size={20} /></div><strong>Could not load members</strong><span>{error}</span></div></td></tr> : filteredMembers.map((member) => <tr key={member.id}><td><div className="member-cell"><Avatar size="lg"><AvatarFallback>{initials(member.fullName)}</AvatarFallback></Avatar><strong>{member.fullName}</strong></div></td><td>{member.memberships.length ? <div className="flex flex-wrap gap-2">{member.memberships.map((membership) => <Badge key={membership.id} variant="outline">{membership.planTypeSnapshot} <span aria-hidden>·</span> {membershipDuration(membership.startsOn, membership.endsOn)}</Badge>)}</div> : <span className="last-visit">No active memberships</span>}</td><td>{member.memberships.length ? <div className="flex flex-col items-start gap-1"><Badge>{member.memberships.length} active</Badge><span className="text-xs text-muted-foreground">All memberships current</span></div> : <span className="last-visit">—</span>}</td><td><div className="flex flex-col gap-1"><strong className={cn("text-sm", Number(member.balance.overdueAmount) > 0 && "text-destructive")}>{money.format(Number(member.balance.totalOutstanding))}</strong><span className="text-xs text-muted-foreground">Total outstanding</span></div></td><td><button className="icon-button small row-more" onClick={() => setActiveMember(member)} aria-label={`Open ${member.fullName} details`}><MoreHorizontal size={16} /></button></td></tr>)}{!filteredMembers.length && !isLoading && !error && <tr><td colSpan={5}><div className="member-empty"><div><Search size={20} /></div><strong>No members found</strong><span>Try a different search term.</span><button onClick={() => setQuery("")}>Clear search</button></div></td></tr>}</tbody></table></div>
      {!isLoading && !error && <div className="table-footer"><span>Showing <strong>{filteredMembers.length ? 1 : 0}-{filteredMembers.length}</strong> of <strong>{members.length}</strong> members</span></div>}</section><footer className="dashboard-footer"><span>&copy; 2026 Gecco Technologies</span><span><ShieldCheck size={11} /> Your member data is encrypted and secure</span></footer></main></div>
    <MobileNavigation active="members" onNotify={notify} onAdd={() => setIsAddMemberOpen(true)} /><AddMemberDialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen} onCreated={async () => { await refreshMembers(); notify("Member added successfully"); }} />{activeMember && <MemberDrawer member={activeMember} close={() => setActiveMember(null)} />}{toast && <div className="toast" role="status"><span><Check size={15} /></span>{toast}</div>}
  </div>;
}
