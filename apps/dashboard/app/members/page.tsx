"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  CreditCard,
  Filter,
  Mail,
  Menu,
  Moon,
  Phone,
  Plus,
  Search,
  IndianRupee,
  MoreHorizontal,
  ShieldCheck,
  Sun,
  Upload,
  UserCheck,
  UserRoundX,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import DashboardSidebar, { Brand } from "../dashboard-sidebar";
import MobileNavigation from "../mobile-navigation";
import ProfileMenu from "../profile-menu";
import { getInitials, useSession } from "../session-provider";
import MemberImportDialog from "./member-import-dialog";

const initials = getInitials;
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";

type MembershipStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

type Membership = {
  id: string;
  durationMonths: number;
  planTypeSnapshot: "GT" | "PT";
  agreedFee: string;
  startsOn: string;
  endsOn: string;
  status: MembershipStatus;
  trainers: string[];
  totalAmount: string;
  paidAmount: string;
};

type Member = {
  id: string;
  fullName: string;
  memberNumber: string;
  joinedOn: string;
  status: "ACTIVE" | "ARCHIVED";
  memberships: Membership[];
  totalAmount: string;
  paidAmount: string;
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

type QuickFilter = "all" | "dues" | "expiring" | "none";

type MembersPageResponse = MembersResponse & {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  stats: {
    totalMembers: number;
    activeMemberships: number;
    outstanding: number;
    overdueMembers: number;
  };
  filterCounts: Record<QuickFilter, number>;
  trainerOptions: string[];
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

type MemberDetailsResponse = {
  member: {
    contacts: {
      id: string;
      kind: "PHONE" | "EMAIL" | "WHATSAPP" | "OTHER";
      value: string;
      isPrimary: boolean;
    }[];
    notes: {
      id: string;
      body: string;
      createdAt: string;
      createdBy: { fullName: string } | null;
    }[];
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

const tableDate = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function membershipDuration(durationMonths: number) {
  const months = Math.max(1, durationMonths || 1);
  return `${months} ${months === 1 ? "month" : "months"}`;
}

function formatTableDate(date: string) {
  return tableDate.format(new Date(`${date}T00:00:00.000Z`));
}

// Page numbers to render, with null marking a gap: 1 … 4 5 6 … 12
function pageNumbers(page: number, totalPages: number) {
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
  return pages.flatMap((value, index) =>
    index > 0 && value - pages[index - 1] > 1 ? [null, value] : [value],
  );
}

function assignedTrainers(member: Member) {
  return [...new Set(member.memberships.flatMap((membership) => membership.trainers))];
}

function ThemeToggle() {
  function toggleTheme() {
    const dark = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("gecco-theme", dark ? "dark" : "light");
  }

  return (
    <button
      className="icon-button theme-button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
    >
      <Sun className="theme-sun" size={18} />
      <Moon className="theme-moon" size={18} />
    </button>
  );
}

function Header({ onMenu, notify }: { onMenu: () => void; notify: (message: string) => void }) {
  const { session, loading } = useSession();
  const displayRole = session?.activeGym.role
    ? session.activeGym.role.charAt(0) + session.activeGym.role.slice(1).toLowerCase()
    : "";
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-button menu-button" onClick={onMenu} aria-label="Open navigation">
          <Menu size={20} />
        </button>
        <div className="mobile-brand">
          <Brand />
        </div>
      </div>
      <div className="topbar-actions">
        <ThemeToggle />
        <div className="topbar-divider" />
        <ProfileMenu
          name={session?.user.fullName ?? (loading ? "Loading…" : "Account")}
          initials={session ? getInitials(session.user.fullName) : "…"}
          role={displayRole}
          onNotify={notify}
        />
      </div>
    </header>
  );
}

function MemberDrawer({
  member,
  close,
  onEdit,
  onDelete,
}: {
  member: Member;
  close: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="drawer-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-name"
      onMouseDown={(event) => event.currentTarget === event.target && close()}
    >
      <aside className="member-drawer">
        <div className="drawer-top">
          <span>Member details</span>
          <div className="flex items-center gap-1">
            <button
              className="icon-button small"
              onClick={onEdit}
              aria-label={`Edit ${member.fullName}`}
            >
              <span className="sr-only">Edit</span>
              <MoreHorizontal size={16} />
            </button>
            <button
              className="icon-button small"
              onClick={onDelete}
              aria-label={`Archive ${member.fullName}`}
            >
              <UserRoundX size={16} />
            </button>
            <button className="icon-button" onClick={close} aria-label="Close member details">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="profile-hero">
          <span className="avatar avatar-xl violet">{initials(member.fullName)}</span>
          <h2 id="member-name">{member.fullName}</h2>
          <p>
            {member.memberships.length} active{" "}
            {member.memberships.length === 1 ? "membership" : "memberships"}
          </p>
        </div>
        <section className="drawer-section">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3>Active memberships</h3>
            <Badge variant="secondary">{member.memberships.length} active</Badge>
          </div>
          {member.memberships.length ? (
            <div className="grid gap-3">
              {member.memberships.map((membership) => (
                <Card key={membership.id} size="sm">
                  <CardHeader>
                    <CardTitle>
                      {membership.planTypeSnapshot === "GT" ? "Gym Training" : "Personal Training"}
                    </CardTitle>
                    <CardDescription>
                      Membership #{membership.id.slice(-6).toUpperCase()}
                    </CardDescription>
                    <CardAction>
                      <Badge>
                        {membership.status.charAt(0) + membership.status.slice(1).toLowerCase()}
                      </Badge>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="size-4" />
                      <span>
                        {new Date(membership.startsOn).toLocaleDateString("en-IN")} –{" "}
                        {new Date(membership.endsOn).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-2">
                      <IndianRupee className="size-4 text-muted-foreground" />
                      <span className="font-medium">
                        {money.format(Number(membership.agreedFee))}
                      </span>
                      <span className="text-muted-foreground">Agreed fee</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {money.format(Number(membership.paidAmount))} allocated payments to this plan
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="last-visit">No active memberships</p>
          )}
        </section>
        <section className="drawer-section">
          <h3>Balance</h3>
          <div className="drawer-metrics">
            <div>
              <strong>{money.format(Number(member.balance.totalOutstanding))}</strong>
              <span>Outstanding</span>
            </div>
            <div>
              <strong>{money.format(Number(member.balance.overdueAmount))}</strong>
              <span>Overdue</span>
            </div>
            <div>
              <strong>{money.format(Number(member.balance.availableCredit))}</strong>
              <span>Credit</span>
            </div>
          </div>
        </section>
        <MemberDetailSections memberId={member.id} />
      </aside>
    </div>
  );
}

function MemberDetailSections({ memberId }: { memberId: string }) {
  const [details, setDetails] = useState<MemberDetailsResponse | null>(null);
  const [error, setError] = useState("");
  const [remark, setRemark] = useState("");
  const [isSavingRemark, setIsSavingRemark] = useState(false);

  async function editRemark(note: MemberDetailsResponse["member"]["notes"][number]) {
    const body = window.prompt("Edit remark", note.body)?.trim();
    if (!body || body === note.body) return;
    const response = await fetch(`/api/members/${memberId}/notes/${note.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const updated = (await response.json()) as typeof note & { error?: string };
    if (!response.ok) {
      setError(updated.error ?? "We could not update the remark.");
      return;
    }
    setDetails((current) =>
      current
        ? {
            ...current,
            member: {
              ...current.member,
              notes: current.member.notes.map((item) => (item.id === note.id ? updated : item)),
            },
          }
        : current,
    );
  }

  async function deleteRemark(note: MemberDetailsResponse["member"]["notes"][number]) {
    if (!window.confirm("Delete this remark?")) return;
    const response = await fetch(`/api/members/${memberId}/notes/${note.id}`, { method: "DELETE" });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(result.error ?? "We could not delete the remark.");
      return;
    }
    setDetails((current) =>
      current
        ? {
            ...current,
            member: {
              ...current.member,
              notes: current.member.notes.filter((item) => item.id !== note.id),
            },
          }
        : current,
    );
  }

  useEffect(() => {
    let cancelled = false;

    async function loadDetails() {
      try {
        const response = await fetch(`/api/members/${memberId}`);
        const result = (await response.json()) as MemberDetailsResponse;
        if (!response.ok) throw new Error(result.error ?? "We could not load member details.");
        if (!cancelled) setDetails(result);
      } catch (reason) {
        if (!cancelled)
          setError(reason instanceof Error ? reason.message : "We could not load member details.");
      }
    }

    void loadDetails();
    return () => {
      cancelled = true;
    };
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
      const created =
        (await response.json()) as MemberDetailsResponse["member"]["notes"][number] & {
          error?: string;
        };
      if (!response.ok) throw new Error(created.error ?? "We could not save the remark.");
      setDetails((current) =>
        current
          ? { ...current, member: { ...current.member, notes: [created, ...current.member.notes] } }
          : current,
      );
      setRemark("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We could not save the remark.");
    } finally {
      setIsSavingRemark(false);
    }
  }

  if (error)
    return (
      <section className="drawer-section">
        <p className="last-visit">{error}</p>
      </section>
    );
  if (!details)
    return (
      <section className="drawer-section">
        <p className="last-visit">Loading contact and payment details…</p>
      </section>
    );

  const phoneContacts = details.member.contacts.filter(
    (contact) => contact.kind === "PHONE" || contact.kind === "WHATSAPP",
  );
  const emailContacts = details.member.contacts.filter((contact) => contact.kind === "EMAIL");

  return (
    <>
      <section className="drawer-section">
        <h3>Contact details</h3>
        <dl className="contact-list">
          <div>
            <dt>
              <Phone size={14} /> Phone
            </dt>
            <dd>{phoneContacts.map((contact) => contact.value).join(", ") || "Not provided"}</dd>
          </div>
          <div>
            <dt>
              <Mail size={14} /> Email
            </dt>
            <dd>{emailContacts.map((contact) => contact.value).join(", ") || "Not provided"}</dd>
          </div>
        </dl>
      </section>
      <section className="drawer-section">
        <h3>Recent payments</h3>
        {details.payments.length ? (
          <div className="timeline">
            {details.payments.map((payment) => (
              <div key={payment.id}>
                <i className="green" />
                <span>
                  <strong>
                    <CreditCard size={12} /> {money.format(Number(payment.amount))} ·{" "}
                    {payment.paymentMode.name}
                  </strong>
                  <small>
                    Paid to {payment.recipient.displayName} ·{" "}
                    {new Date(payment.paidOn).toLocaleDateString("en-IN")} ·{" "}
                    {payment.status.toLowerCase()}
                  </small>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="last-visit">No payments recorded yet</p>
        )}
      </section>
      <section className="drawer-section">
        <h3>Remarks</h3>
        <form className="member-remark-form" onSubmit={addRemark}>
          <textarea
            value={remark}
            onChange={(event) => setRemark(event.target.value)}
            maxLength={2000}
            placeholder="Add a remark…"
            aria-label="Add a remark"
          />
          <button
            className="button secondary"
            type="submit"
            disabled={isSavingRemark || !remark.trim()}
          >
            {isSavingRemark ? "Saving…" : "Add remark"}
          </button>
        </form>
        {details.member.notes.length ? (
          <div className="timeline member-remarks">
            {details.member.notes.map((note) => (
              <div key={note.id}>
                <i className="purple" />
                <span>
                  <strong>{note.createdBy?.fullName ?? "Team member"}</strong>
                  <small>
                    {note.body} · {new Date(note.createdAt).toLocaleDateString("en-IN")}
                  </small>
                </span>
                <span className="flex items-center gap-1">
                  <button className="text-button" onClick={() => void editRemark(note)}>
                    Edit
                  </button>
                  <button className="text-button" onClick={() => void deleteRemark(note)}>
                    Delete
                  </button>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="last-visit">No remarks yet</p>
        )}
      </section>
    </>
  );
}

function AddMemberDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => Promise<void>;
}) {
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
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "We could not create the member.");

      await onCreated();
      onOpenChange(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We could not create the member.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add member</DialogTitle>
          <DialogDescription>Create a member profile for this gym.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={submit}>
          <div className="grid gap-2">
            <Label htmlFor="member-full-name">Full name</Label>
            <Input
              id="member-full-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              autoFocus
              placeholder="e.g. Ananya Verma"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="member-phone">
                Phone number <span className="font-normal text-muted-foreground">Optional</span>
              </Label>
              <Input
                id="member-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="member-email">
                Email <span className="font-normal text-muted-foreground">Optional</span>
              </Label>
              <Input
                id="member-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
              />
            </div>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Add member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditMemberDialog({
  member,
  open,
  onOpenChange,
  onSaved,
}: {
  member: Member;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<void>;
}) {
  const [fullName, setFullName] = useState(member.fullName);
  const [memberNumber, setMemberNumber] = useState(member.memberNumber);
  const [joinedOn, setJoinedOn] = useState(member.joinedOn);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    void fetch(`/api/members/${member.id}`)
      .then((response) => response.json() as Promise<MemberDetailsResponse>)
      .then((data) => {
        const contacts = data.member?.contacts ?? [];
        setPhone(
          contacts.find((contact) => contact.kind === "PHONE" || contact.kind === "WHATSAPP")
            ?.value ?? "",
        );
        setEmail(contacts.find((contact) => contact.kind === "EMAIL")?.value ?? "");
      })
      .catch(() => undefined);
  }, [member, open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          memberNumber,
          joinedOn,
          contacts: [
            phone.trim() && { kind: "PHONE", value: phone.trim(), isPrimary: true },
            email.trim() && { kind: "EMAIL", value: email.trim(), isPrimary: true },
          ].filter(Boolean),
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "We could not update the member.");
      await onSaved();
      onOpenChange(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We could not update the member.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit member</DialogTitle>
          <DialogDescription>Update this member’s profile and contact details.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={submit}>
          <div className="grid gap-2">
            <Label htmlFor="edit-member-full-name">Full name</Label>
            <Input
              id="edit-member-full-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-member-number">Member number</Label>
              <Input
                id="edit-member-number"
                value={memberNumber}
                onChange={(event) => setMemberNumber(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-member-joined">Joined on</Label>
              <Input
                id="edit-member-joined"
                type="date"
                value={joinedOn}
                onChange={(event) => setJoinedOn(event.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-member-phone">Phone</Label>
              <Input
                id="edit-member-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-member-email">Email</Label>
              <Input
                id="edit-member-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [directory, setDirectory] = useState<Omit<MembersPageResponse, "members"> | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [trainerFilter, setTrainerFilter] = useState("all");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [reloadKey, setReloadKey] = useState(0);
  const { session } = useSession();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: session?.activeGym.timezone ?? "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const daysUntil = (date: string) =>
    Math.round((Date.parse(date + "T00:00:00Z") - Date.parse(today + "T00:00:00Z")) / 86400000);
  const quickFilters: { id: QuickFilter; label: string }[] = [
    { id: "all", label: "All members" },
    { id: "dues", label: "Outstanding dues" },
    { id: "expiring", label: "Expiring in 30 days" },
    { id: "none", label: "No active plan" },
  ];
  const hasFilters = Boolean(query || trainerFilter !== "all" || quickFilter !== "all");
  function resetFilters() {
    setQuery("");
    setDebouncedQuery("");
    setTrainerFilter("all");
    setQuickFilter("all");
    setPage(1);
  }

  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [activeMember, setActiveMember] = useState<Member | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  async function archiveMember(member: Member) {
    if (
      !window.confirm(
        `Archive ${member.fullName}? Their memberships, payments, and notes will be retained.`,
      )
    )
      return;
    const response = await fetch(`/api/members/${member.id}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      notify(data.error ?? "Could not archive member.");
      return;
    }
    setActiveMember(null);
    setEditingMember(null);
    await refreshMembers();
    notify("Member archived successfully");
  }

  function directoryParams(overrides: Record<string, string> = {}) {
    return new URLSearchParams({
      q: debouncedQuery,
      trainer: trainerFilter,
      filter: quickFilter,
      sort,
      page: String(page),
      pageSize: String(pageSize),
      ...overrides,
    });
  }

  useEffect(() => {
    let cancelled = false;

    // The requested member may not be on the first page, so load them on their own.
    async function openDeepLink() {
      const searchParams = new URLSearchParams(window.location.search);
      const requestedMemberId = searchParams.get("member");
      const result = requestedMemberId
        ? ((await fetch(
            `/api/members/allMembers?memberId=${encodeURIComponent(requestedMemberId)}`,
          ).then((response) => response.json())) as MembersResponse)
        : null;
      if (cancelled) return;
      if (searchParams.get("add") === "1") setIsAddMemberOpen(true);
      if (result?.members?.[0]) setActiveMember(result.members[0]);
    }

    void openDeepLink().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMembers() {
      setIsFetching(true);
      try {
        const response = await fetch(`/api/members/allMembers?${directoryParams()}`, {
          signal: controller.signal,
        });
        const result = (await response.json()) as MembersPageResponse;
        if (!response.ok) throw new Error(result.error ?? "We could not load members.");
        const { members: pageMembers, ...rest } = result;
        setMembers(pageMembers);
        setDirectory(rest);
        setError("");
        // The server clamps out-of-range pages, e.g. after archiving the last member on a page.
        if (result.page !== page) setPage(result.page);
      } catch (reason) {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : "We could not load members.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsFetching(false);
        }
      }
    }

    void loadMembers();
    return () => controller.abort();
    // directoryParams reads exactly these values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, trainerFilter, quickFilter, sort, page, pageSize, reloadKey]);

  async function refreshMembers() {
    setReloadKey((key) => key + 1);
  }

  const total = directory?.total ?? 0;
  const totalPages = directory?.totalPages ?? 1;
  const firstShown = total ? (page - 1) * pageSize + 1 : 0;
  const lastShown = Math.min(total, (page - 1) * pageSize + members.length);
  const trainerOptions = directory?.trainerOptions ?? [];
  const totals = {
    totalMembers: directory?.stats.totalMembers ?? 0,
    activeMemberships: directory?.stats.activeMemberships ?? 0,
    outstanding: directory?.stats.outstanding ?? 0,
    overdue: directory?.stats.overdueMembers ?? 0,
  };

  async function exportMembers() {
    setIsExporting(true);
    let filteredMembers: Member[];
    try {
      const response = await fetch(
        `/api/members/allMembers?${directoryParams({ page: "1", pageSize: "all" })}`,
      );
      const result = (await response.json()) as MembersPageResponse;
      if (!response.ok) throw new Error(result.error ?? "We could not export members.");
      filteredMembers = result.members;
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : "We could not export members.");
      return;
    } finally {
      setIsExporting(false);
    }
    const csv = [
      "Client name,Active memberships,Start date,End date,Total amount,Paid amount,Dues,Trainer assigned",
      ...filteredMembers.map((member) =>
        [
          member.fullName,
          member.memberships
            .map(
              (membership) =>
                `${membership.planTypeSnapshot} · ${membershipDuration(membership.durationMonths)}`,
            )
            .join("; ") || "No active memberships",
          member.memberships.map((membership) => formatTableDate(membership.startsOn)).join("; ") ||
            "—",
          member.memberships.map((membership) => formatTableDate(membership.endsOn)).join("; ") ||
            "—",
          money.format(Number(member.totalAmount)),
          money.format(Number(member.paidAmount)),
          money.format(Number(member.balance.totalOutstanding)),
          assignedTrainers(member).join("; ") || "Unassigned",
        ]
          .map((value) => `"${value.replaceAll('"', '""')}"`)
          .join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "gecco-members.csv";
    link.click();
    URL.revokeObjectURL(url);
    notify("Member list exported");
  }

  return (
    <div className="app-shell">
      <DashboardSidebar open={mobileNav} onClose={() => setMobileNav(false)} onNotify={notify} />
      <div className="app-content">
        <Header onMenu={() => setMobileNav(true)} notify={notify} />
        <main className="dashboard members-dashboard">
          <div className="page-heading members-heading">
            <div>
              <p className="members-breadcrumb">
                Workspace <ChevronRight size={12} /> Members
              </p>
              <h1>Members</h1>
              <p>Manage your community, memberships, and dues.</p>
            </div>
            <div className="heading-actions">
              <button
                className="button secondary import-button"
                onClick={() => setIsImportOpen(true)}
              >
                <Upload size={16} /> Import
              </button>
              <button
                className="button secondary"
                onClick={() => void exportMembers()}
                disabled={isLoading || isExporting || total === 0}
              >
                <Download size={16} /> {isExporting ? "Exporting…" : "Export"}
              </button>
              <button className="button primary" onClick={() => setIsAddMemberOpen(true)}>
                <Plus size={17} /> Add member
              </button>
            </div>
          </div>

          <section className="member-stats" aria-label="Member statistics">
            <article className="member-stat-card">
              <div className="member-stat-icon purple">
                <Users size={18} />
              </div>
              <div className="member-stat-copy">
                <span>Total members</span>
                <div>
                  <strong>{totals.totalMembers}</strong>
                </div>
                <small>In your active gym</small>
              </div>
            </article>
            <article className="member-stat-card">
              <div className="member-stat-icon green">
                <UserCheck size={18} />
              </div>
              <div className="member-stat-copy">
                <span>Active memberships</span>
                <div>
                  <strong>{totals.activeMemberships}</strong>
                </div>
                <small>Across all members</small>
              </div>
            </article>
            <article className="member-stat-card">
              <div className="member-stat-icon amber">
                <ShieldCheck size={18} />
              </div>
              <div className="member-stat-copy">
                <span>Outstanding dues</span>
                <div>
                  <strong>{money.format(totals.outstanding)}</strong>
                </div>
                <small>Member ledger balances</small>
              </div>
            </article>
            <article className="member-stat-card">
              <div className="member-stat-icon rose">
                <UserRoundX size={18} />
              </div>
              <div className="member-stat-copy">
                <span>Overdue members</span>
                <div>
                  <strong>{totals.overdue}</strong>
                </div>
                <small>Members with overdue dues</small>
              </div>
            </article>
          </section>

          <section className="panel members-panel">
            <div className="members-panel-head">
              <div>
                <h2>All members</h2>
                <p>
                  {isLoading
                    ? "Loading members…"
                    : hasFilters
                      ? `${total} matching ${total === 1 ? "member" : "members"}`
                      : `${totals.totalMembers} people in your community`}
                </p>
              </div>
            </div>
            <div className="directory-toolbar">
              <label className="directory-search">
                <Search size={18} />
                <input
                  aria-label="Search members or plans"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by name, member number, or plan…"
                />
                {query && (
                  <button onClick={() => setQuery("")} aria-label="Clear search">
                    <X size={16} />
                  </button>
                )}
              </label>
              <label className="directory-select">
                <Filter size={16} />
                <select
                  aria-label="Filter members by trainer"
                  value={trainerFilter}
                  onChange={(event) => {
                    setTrainerFilter(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">All trainers</option>
                  <option value="unassigned">Unassigned</option>
                  {trainerOptions.map((trainer) => (
                    <option key={trainer}>{trainer}</option>
                  ))}
                </select>
              </label>
              <label className="directory-select">
                <span>Sort</span>
                <select
                  aria-label="Sort members"
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="name">Name A–Z</option>
                  <option value="dues">Highest outstanding</option>
                  <option value="expiry">Next expiry</option>
                </select>
              </label>
            </div>
            <div className="directory-filterbar">
              <div className="directory-filters" aria-label="Filter member list">
                {quickFilters.map((filter) => (
                  <button
                    key={filter.id}
                    aria-pressed={quickFilter === filter.id}
                    onClick={() => {
                      setQuickFilter(filter.id);
                      setPage(1);
                    }}
                  >
                    {filter.label}
                    <span>
                      {directory ? directory.filterCounts[filter.id] : "—"}
                    </span>
                  </button>
                ))}
              </div>
              {hasFilters && (
                <button className="directory-reset" onClick={resetFilters}>
                  Clear filters
                </button>
              )}
            </div>
            <div
              className={`member-table-wrap roster-wrap transition-opacity ${isFetching && !isLoading ? "opacity-60" : ""}`}
              aria-busy={isFetching}
            >
              <table className="member-table directory-table">
                <thead>
                  <tr>
                    <th scope="col">Member</th>
                    <th scope="col">Memberships & expiry</th>
                    <th scope="col" className="directory-money">
                      Outstanding
                    </th>
                    <th scope="col">Trainer</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="member-empty" aria-live="polite">
                          <div>
                            <Spinner className="size-5" />
                          </div>
                          <strong>Loading members</strong>
                          <span>Getting the latest member data for this gym.</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="member-empty">
                          <div>
                            <X size={20} />
                          </div>
                          <strong>Could not load members</strong>
                          <span>{error}</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    members.map((member) => (
                      <tr key={member.id}>
                        <td data-label="Member">
                          <button
                            className="directory-person"
                            onClick={() => setActiveMember(member)}
                            aria-label={`View ${member.fullName} details`}
                          >
                            <Avatar size="lg">
                              <AvatarFallback>{initials(member.fullName)}</AvatarFallback>
                            </Avatar>
                            <span>
                              <strong>{member.fullName}</strong>
                              <small>#{member.memberNumber}</small>
                            </span>
                            <ChevronRight size={15} />
                          </button>
                        </td>
                        <td data-label="Memberships">
                          <div className="directory-plans">
                            {member.memberships.length ? (
                              member.memberships.map((plan) => {
                                const days = daysUntil(plan.endsOn);
                                return (
                                  <div className="directory-plan" key={plan.id}>
                                    <strong>
                                      {plan.planTypeSnapshot === "GT" ? "Group" : "Personal"}{" "}
                                      <span>· {membershipDuration(plan.durationMonths)}</span>
                                    </strong>
                                    <span
                                      className={
                                        days < 0 ? "expired" : days <= 30 ? "expiring" : ""
                                      }
                                    >
                                      <CalendarDays size={12} />
                                      {days < 0 ? "Ended" : "Ends"}{" "}
                                      <time dateTime={plan.endsOn}>
                                        {formatTableDate(plan.endsOn)}
                                      </time>
                                      {days === 0 ? " · Today" : days === 1 ? " · Tomorrow" : ""}
                                    </span>
                                  </div>
                                );
                              })
                            ) : (
                              <span className="directory-muted">No active plan</span>
                            )}
                          </div>
                        </td>
                        <td data-label="Outstanding" className="directory-money">
                          <strong
                            className={
                              Number(member.balance.overdueAmount) > 0 ? "directory-overdue" : ""
                            }
                          >
                            {money.format(Number(member.balance.totalOutstanding))}
                          </strong>
                          <small>
                            {Number(member.balance.overdueAmount) > 0
                              ? `${money.format(Number(member.balance.overdueAmount))} overdue`
                              : Number(member.balance.totalOutstanding) > 0
                                ? "Not yet overdue"
                                : "No outstanding dues"}
                          </small>
                          {Number(member.balance.availableCredit) > 0 && (
                            <small>
                              {money.format(Number(member.balance.availableCredit))} credit
                            </small>
                          )}
                        </td>
                        <td data-label="Trainer">
                          <span
                            className={assignedTrainers(member).length ? "" : "directory-muted"}
                          >
                            {assignedTrainers(member).join(", ") || "Unassigned"}
                          </span>
                        </td>
                        <td className="directory-action">
                          {Number(member.balance.totalOutstanding) > 0 ? (
                            <Link
                              prefetch={false}
                              href={`/payments?record=1&member=${encodeURIComponent(member.id)}`}
                              className="directory-pay"
                            >
                              <IndianRupee size={14} />
                              Record payment
                            </Link>
                          ) : (
                            <button
                              onClick={() => setActiveMember(member)}
                              className="directory-view"
                            >
                              View member <ChevronRight size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                  {!members.length && !isLoading && !error && (
                    <tr>
                      <td colSpan={5}>
                        <div className="member-empty">
                          <div>
                            <Search size={20} />
                          </div>
                          <strong>No members found</strong>
                          <span>Try another search or clear your filters.</span>
                          <button onClick={resetFilters}>Clear filters</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {!isLoading && !error && (
              <div className="table-footer">
                <span>
                  Showing{" "}
                  <strong>
                    {firstShown}–{lastShown}
                  </strong>{" "}
                  of <strong>{total}</strong> members
                </span>
                <div>
                  <label>
                    Rows per page
                    <select
                      aria-label="Members per page"
                      value={pageSize}
                      onChange={(event) => {
                        setPageSize(Number(event.target.value));
                        setPage(1);
                      }}
                    >
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {pageNumbers(page, totalPages).map((value, index) =>
                    value === null ? (
                      <span key={`gap-${index}`}>…</span>
                    ) : (
                      <button
                        key={value}
                        className={value === page ? "current" : undefined}
                        aria-current={value === page ? "page" : undefined}
                        onClick={() => setPage(value)}
                      >
                        {value}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </section>
          <footer className="dashboard-footer">
            <span>&copy; 2026 Gecco Technologies</span>
            <span>
              <ShieldCheck size={11} /> Your member data is encrypted and secure
            </span>
          </footer>
        </main>
      </div>
      <MobileNavigation active="members" onNotify={notify} onAdd={() => setIsAddMemberOpen(true)} />
      <AddMemberDialog
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        onCreated={async () => {
          await refreshMembers();
          notify("Member added successfully");
        }}
      />
      <MemberImportDialog open={isImportOpen} onOpenChange={setIsImportOpen} onNotify={notify} />
      {activeMember && (
        <MemberDrawer
          member={activeMember}
          close={() => setActiveMember(null)}
          onEdit={() => {
            setEditingMember(activeMember);
            setActiveMember(null);
          }}
          onDelete={() => void archiveMember(activeMember)}
        />
      )}
      {editingMember && (
        <EditMemberDialog
          member={editingMember}
          open={Boolean(editingMember)}
          onOpenChange={(open) => {
            if (!open) setEditingMember(null);
          }}
          onSaved={async () => {
            await refreshMembers();
            notify("Member updated successfully");
          }}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <span>
            <Check size={15} />
          </span>
          {toast}
        </div>
      )}
    </div>
  );
}
