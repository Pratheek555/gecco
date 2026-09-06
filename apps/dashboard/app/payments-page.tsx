"use client";

import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleHelp,
  Download,
  FileText,
  Filter,
  IndianRupee,
  LoaderCircle,
  Menu,
  Moon,
  MoreHorizontal,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  ShieldCheck,
  Sun,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ElementType } from "react";
import type { DateRange } from "react-day-picker";
import DashboardSidebar from "./dashboard-sidebar";
import { DateRangePicker } from "@/components/date-range-picker";
import { Input } from "@/components/ui/input";
import MobileNavigation from "./mobile-navigation";
import ProfileMenu from "./profile-menu";
import { getInitials, useSession } from "./session-provider";

const initials = getInitials;

type PaymentStatus = "Paid" | "Refunded" | "Voided";
type PaymentTab = "All" | PaymentStatus;
type PaymentDatePreset = "1d" | "2d" | "3d" | "14d" | "30d" | "3m" | "6m" | "12m";

type PaymentRecord = {
  id: string;
  amount: string;
  paidOn: string;
  status: "SUCCEEDED" | "VOIDED" | "REFUNDED";
  reference: string | null;
  member: { id: string; fullName: string };
  membership: { id: string; planName: string } | null;
  paymentMode: { id: string; name: string };
  recipient: { id: string; displayName: string; recipientType: "GYM" | "TRAINER" | "OTHER" };
};

type PaymentAnalytics = {
  summary: {
    totalCollected: string;
    totalCollectedChange: string | null;
    successfulPaymentCount: number;
    outstandingAmount: string;
    voidedAmount: string;
    voidedPaymentCount: number;
    collectionRate: string;
  };
  chart: {
    current: { date: string; amount: string }[];
    previous: { date: string; amount: string }[];
  };
  paymentMethods: { id: string; name: string; amount: string; count: number; share: number }[];
};

const paymentColors = ["violet", "blue", "amber", "pink", "green"];
const paymentStatusLabels = {
  SUCCEEDED: "Paid",
  REFUNDED: "Refunded",
  VOIDED: "Voided",
} as const satisfies Record<PaymentRecord["status"], PaymentStatus>;
const displayPaymentStatus = (status: PaymentRecord["status"]): PaymentStatus =>
  paymentStatusLabels[status];
const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const paymentDatePresets: { value: PaymentDatePreset; label: string; group: "Days" | "Months" }[] =
  [
    { value: "1d", label: "Last 1 day", group: "Days" },
    { value: "2d", label: "Last 2 days", group: "Days" },
    { value: "3d", label: "Last 3 days", group: "Days" },
    { value: "14d", label: "Last 14 days", group: "Days" },
    { value: "30d", label: "Last 30 days", group: "Days" },
    { value: "3m", label: "Last 3 months", group: "Months" },
    { value: "6m", label: "Last 6 months", group: "Months" },
    { value: "12m", label: "Last 12 months", group: "Months" },
  ];

function subtractMonths(date: Date, months: number) {
  const result = new Date(date);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() - months);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

function dateRangeForPreset(preset: PaymentDatePreset): DateRange {
  const to = new Date();
  const amount = Number(preset.slice(0, -1));
  const from = preset.endsWith("d") ? new Date(to) : subtractMonths(to, amount);
  if (preset.endsWith("d")) from.setDate(from.getDate() - amount + 1);
  return { from, to };
}

const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark">
        <TrendingUp size={18} strokeWidth={2.8} />
      </div>
      <span>Gymwise</span>
    </div>
  );
}

function ThemeToggle() {
  function toggle() {
    const dark = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("gymwise-theme", dark ? "dark" : "light");
  }
  return (
    <button className="icon-button theme-button" onClick={toggle} aria-label="Toggle color theme">
      <Sun className="theme-sun" size={18} />
      <Moon className="theme-moon" size={18} />
    </button>
  );
}

function Header({ onMenu, notify }: { onMenu: () => void; notify: (message: string) => void }) {
  const { session, loading } = useSession();
  const fullName = session?.user.fullName ?? (loading ? "Loading…" : "Account");
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
          name={fullName}
          initials={session ? getInitials(fullName) : "…"}
          role={session?.activeGym.role ?? ""}
          onNotify={notify}
        />
      </div>
    </header>
  );
}

function Stat({
  icon: Icon,
  tone,
  label,
  value,
  detail,
  change,
}: {
  icon: ElementType;
  tone: string;
  label: string;
  value: string;
  detail: string;
  change?: string;
}) {
  return (
    <article className="kpi-card payment-kpi">
      <div className="kpi-top">
        <div className={`kpi-icon ${tone}`}>
          <Icon size={18} />
        </div>
        <div className="kpi-copy">
          <div className="kpi-label">
            {label}
            <button aria-label={`About ${label}`}>
              <CircleHelp size={13} />
            </button>
          </div>
          <div className="kpi-value-row">
            <strong>{value}</strong>
            {change && (
              <span className={change.startsWith("-") ? "negative" : "positive"}>
                {change.startsWith("-") ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                {change.replace(/[+-]/, "")}
              </span>
            )}
          </div>
        </div>
      </div>
      <p>{detail}</p>
    </article>
  );
}

function RevenueChart({ chart }: { chart: PaymentAnalytics["chart"] | null }) {
  const width = 760,
    height = 190,
    currentValues = chart?.current.map((point) => Number(point.amount)) ?? [],
    previousValues = chart?.previous.map((point) => Number(point.amount)) ?? [];
  const maximum = Math.max(...currentValues, ...previousValues, 1);
  const path = (values: number[]) =>
    values
      .map(
        (value, index) =>
          `${index ? "L" : "M"}${values.length > 1 ? (index / (values.length - 1)) * width : width},${height - (value / maximum) * height}`,
      )
      .join(" ");
  const current = path(currentValues),
    previous = path(previousValues),
    lastY = height - ((currentValues.at(-1) ?? 0) / maximum) * height;
  const labels = (chart?.current ?? [])
    .filter((_, index) => index % 3 === 0)
    .map((point) =>
      new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(
        new Date(`${point.date}T00:00:00Z`),
      ),
    );
  return (
    <div className="revenue-chart" aria-label="Revenue chart">
      <div className="chart-axis">
        <span>{money(maximum)}</span>
        <span>{money((maximum * 2) / 3)}</span>
        <span>{money(maximum / 3)}</span>
        <span>₹0</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img">
        <defs>
          <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6f57e8" stopOpacity=".24" />
            <stop offset="100%" stopColor="#6f57e8" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 63, 126, 189].map((y) => (
          <line key={y} x1="0" x2={width} y1={y} y2={y} className="payment-grid-line" />
        ))}
        {current && (
          <>
            <path d={`${current} L${width},${height} L0,${height} Z`} fill="url(#revenueArea)" />
            <path d={current} className="revenue-line" />
            <circle cx={width} cy={lastY} r="7" className="revenue-dot-ring" />
            <circle cx={width} cy={lastY} r="3.5" className="revenue-dot" />
          </>
        )}
        {previous && <path d={previous} className="previous-revenue-line" />}
      </svg>
      <div className="chart-months">
        {labels.map((label, index) => (
          <span key={`${label}-${index}`}>{label}</span>
        ))}
      </div>
      <div className="chart-key">
        <span>
          <i />
          This period
        </span>
        <span>
          <i />
          Previous period
        </span>
      </div>
    </div>
  );
}

type PaymentMember = { id: string; fullName: string };
type PaymentModeOption = { id: string; name: string; isActive?: boolean; sortOrder?: number };
type PaymentRecipientOption = {
  id: string;
  displayName: string;
  recipientType: "GYM" | "TRAINER" | "OTHER";
  isActive?: boolean;
};
type ChargeOption = {
  id: string;
  amount: string;
  paidAmount: string;
  outstandingAmount: string;
  dueOn: string;
};
type PaymentContext = { memberships: { id: string; planName: string; charges: ChargeOption[] }[] };

function MemberPicker({
  members,
  value,
  onChange,
  disabled,
  loading,
}: {
  members: PaymentMember[];
  value: string;
  onChange: (memberId: string) => void;
  disabled: boolean;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedMember = members.find((member) => member.id === value);
  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return normalizedQuery
      ? members.filter((member) => member.fullName.toLowerCase().includes(normalizedQuery))
      : members;
  }, [members, query]);

  return (
    <div className="member-picker">
      <Input
        type="search"
        value={query || selectedMember?.fullName || ""}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (selectedMember && !query) setQuery("");
          setOpen(true);
        }}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        placeholder={loading ? "Loading members…" : "Search members"}
        disabled={disabled}
        aria-label="Search members"
        aria-expanded={open}
        aria-controls="member-suggestions"
        role="combobox"
        autoComplete="off"
      />
      {open && !disabled && (
        <div
          id="member-suggestions"
          role="listbox"
          aria-label="Members"
          className="member-picker-suggestions"
        >
          {filteredMembers.length ? (
            filteredMembers.map((member) => (
              <button
                type="button"
                role="option"
                aria-selected={member.id === value}
                key={member.id}
                onMouseDown={(event) => {
                  event.preventDefault();
                  onChange(member.id);
                  setQuery("");
                  setOpen(false);
                }}
              >
                {member.fullName}
              </button>
            ))
          ) : (
            <p>No matching members</p>
          )}
        </div>
      )}
    </div>
  );
}

function RecordModal({
  close,
  notify,
  onRecorded,
}: {
  close: () => void;
  notify: (message: string) => void;
  onRecorded: () => Promise<void>;
}) {
  const [members, setMembers] = useState<PaymentMember[]>([]),
    [paymentModes, setPaymentModes] = useState<PaymentModeOption[]>([]),
    [recipients, setRecipients] = useState<PaymentRecipientOption[]>([]);
  const [memberId, setMemberId] = useState(""),
    [context, setContext] = useState<PaymentContext | null>(null),
    [selectedCharge, setSelectedCharge] = useState(""),
    [amount, setAmount] = useState(""),
    [paymentModeId, setPaymentModeId] = useState(""),
    [recipientId, setRecipientId] = useState(""),
    [reference, setReference] = useState(""),
    [paidOn, setPaidOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true),
    [submitting, setSubmitting] = useState(false),
    [error, setError] = useState("");

  const charges =
    context?.memberships.flatMap((membership) =>
      membership.charges.map((charge) => ({
        ...charge,
        membershipId: membership.id,
        planName: membership.planName,
      })),
    ) ?? [];
  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      try {
        const [membersResponse, modesResponse, recipientsResponse] = await Promise.all([
          fetch("/api/members/allMembers"),
          fetch("/api/payment/paymentModes"),
          fetch("/api/payment/paymentRecipients"),
        ]);
        if (!membersResponse.ok || !modesResponse.ok || !recipientsResponse.ok) throw new Error();

        const [membersData, modesData, recipientsData] = await Promise.all([
          membersResponse.json() as Promise<{ members: PaymentMember[] }>,
          modesResponse.json() as Promise<{ paymentModes: PaymentModeOption[] }>,
          recipientsResponse.json() as Promise<{ recipients: PaymentRecipientOption[] }>,
        ]);
        if (cancelled) return;

        setMembers(membersData.members);
        const requestedMemberId = new URLSearchParams(window.location.search).get("member");
        if (
          requestedMemberId &&
          membersData.members.some((member) => member.id === requestedMemberId)
        ) {
          await selectMember(requestedMemberId);
          if (cancelled) return;
        }
        setPaymentModes(modesData.paymentModes);
        setRecipients(recipientsData.recipients);
        setPaymentModeId(modesData.paymentModes[0]?.id ?? "");
        setRecipientId(
          recipientsData.recipients.find((recipient) => recipient.recipientType === "GYM")?.id ??
            recipientsData.recipients[0]?.id ??
            "",
        );
      } catch {
        if (!cancelled) setError("Could not load payment options. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  async function selectMember(nextMemberId: string) {
    setMemberId(nextMemberId);
    setContext(null);
    setSelectedCharge("");
    setError("");
    if (!nextMemberId) return;

    try {
      const response = await fetch(`/api/members/${nextMemberId}/payment-context`);
      const data = (await response.json()) as PaymentContext | { error?: string };
      if (!response.ok || !("memberships" in data))
        throw new Error("error" in data ? data.error : "Could not load member dues.");

      setContext(data);
      const firstCharge = data.memberships.flatMap((membership) =>
        membership.charges.map((charge) => `${membership.id}:${charge.id}`),
      )[0];
      setSelectedCharge(firstCharge ?? "");
      if (!firstCharge) setError("This member has no open membership dues to pay.");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load member dues.");
    }
  }

  async function submitPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const charge = charges.find(
      (option) => `${option.membershipId}:${option.id}` === selectedCharge,
    );
    if (!charge) {
      setError("Select a membership due to apply this payment.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/payment/addPayment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          membershipId: charge.membershipId,
          chargeId: charge.id,
          amount,
          paidOn,
          paymentModeId,
          recipientId,
          reference,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not record the payment.");

      await onRecorded();
      close();
      notify("Payment recorded successfully");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Could not record the payment.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="modal-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="record-title"
      onMouseDown={(event) => event.currentTarget === event.target && close()}
    >
      <form className="modal payment-modal" onSubmit={submitPayment}>
        <div className="modal-header">
          <div>
            <h2 id="record-title">Record a payment</h2>
            <p>Add an offline or manual member payment.</p>
          </div>
          <button type="button" className="icon-button" onClick={close} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <label>
          Member
          <MemberPicker
            members={members}
            value={memberId}
            onChange={(nextMemberId) => void selectMember(nextMemberId)}
            disabled={loading || submitting}
            loading={loading}
          />
        </label>
        <label>
          Membership due
          <select
            required
            value={selectedCharge}
            onChange={(event) => setSelectedCharge(event.target.value)}
            disabled={!memberId || submitting}
          >
            <option value="" disabled>
              Select a due
            </option>
            {charges.map((charge) => (
              <option value={`${charge.membershipId}:${charge.id}`} key={charge.id}>
                {charge.planName} · ₹{charge.outstandingAmount} due · {charge.dueOn}
              </option>
            ))}
          </select>
        </label>
        <div className="form-row">
          <label>
            Amount
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="₹ 0"
              disabled={submitting}
            />
          </label>
          <label>
            Payment method
            <select
              value={paymentModeId}
              onChange={(event) => setPaymentModeId(event.target.value)}
              required
              disabled={loading || submitting}
            >
              <option value="" disabled>
                Select method
              </option>
              {paymentModes.map((mode) => (
                <option value={mode.id} key={mode.id}>
                  {mode.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Recipient
          <select
            value={recipientId}
            onChange={(event) => setRecipientId(event.target.value)}
            required
            disabled={loading || submitting}
          >
            <option value="" disabled>
              Select recipient
            </option>
            {recipients.map((recipient) => (
              <option value={recipient.id} key={recipient.id}>
                {recipient.displayName} ({recipient.recipientType})
              </option>
            ))}
          </select>
        </label>
        <label>
          Payment note <span>Optional</span>
          <input
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder="e.g. August membership fee"
            disabled={submitting}
          />
        </label>
        <label>
          Paid on
          <input
            required
            type="date"
            value={paidOn}
            onChange={(event) => setPaidOn(event.target.value)}
            disabled={submitting}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <div className="secure-note">
          <ShieldCheck size={15} /> This payment will be added to the member ledger.
        </div>
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={close} disabled={submitting}>
            Cancel
          </button>
          <button
            className="button primary"
            type="submit"
            disabled={loading || submitting || !selectedCharge}
          >
            <Check size={16} /> {submitting ? "Recording…" : "Record payment"}
          </button>
        </div>
      </form>
    </div>
  );
}

function PaymentSettingsModal({
  close,
  notify,
}: {
  close: () => void;
  notify: (message: string) => void;
}) {
  const [modes, setModes] = useState<PaymentModeOption[]>([]);
  const [recipients, setRecipients] = useState<PaymentRecipientOption[]>([]);
  const [newMode, setNewMode] = useState("");
  const [newRecipient, setNewRecipient] = useState("");
  const [newRecipientType, setNewRecipientType] = useState<"GYM" | "TRAINER" | "OTHER">("OTHER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    void Promise.all([
      fetch("/api/payment/paymentModes?includeInactive=1"),
      fetch("/api/payment/paymentRecipients?includeInactive=1"),
    ])
      .then(async ([modesResponse, recipientsResponse]) => {
        const modeData = (await modesResponse.json()) as {
          paymentModes?: PaymentModeOption[];
          error?: string;
        };
        const recipientData = (await recipientsResponse.json()) as {
          recipients?: PaymentRecipientOption[];
          error?: string;
        };
        if (
          !modesResponse.ok ||
          !recipientsResponse.ok ||
          !modeData.paymentModes ||
          !recipientData.recipients
        )
          throw new Error(
            modeData.error ?? recipientData.error ?? "Could not load payment settings.",
          );
        setModes(modeData.paymentModes);
        setRecipients(recipientData.recipients);
      })
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : "Could not load payment settings."),
      )
      .finally(() => setLoading(false));
  }, []);
  async function saveMode(mode: PaymentModeOption, name: string) {
    const response = await fetch(`/api/payment/paymentModes/${mode.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = (await response.json()) as PaymentModeOption & { error?: string };
    if (!response.ok) {
      setError(data.error ?? "Could not update payment mode.");
      return;
    }
    setModes((current) =>
      current.map((item) => (item.id === mode.id ? { ...item, ...data } : item)),
    );
    notify("Payment mode updated");
  }
  async function saveRecipient(recipient: PaymentRecipientOption, displayName: string) {
    const response = await fetch(`/api/payment/paymentRecipients/${recipient.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName }),
    });
    const data = (await response.json()) as PaymentRecipientOption & { error?: string };
    if (!response.ok) {
      setError(data.error ?? "Could not update payment recipient.");
      return;
    }
    setRecipients((current) =>
      current.map((item) => (item.id === recipient.id ? { ...item, ...data } : item)),
    );
    notify("Payment recipient updated");
  }
  async function archive(path: string, id: string, kind: "mode" | "recipient") {
    const response = await fetch(`${path}/${id}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? `Could not archive payment ${kind}.`);
      return;
    }
    if (kind === "mode")
      setModes((current) =>
        current.map((item) => (item.id === id ? { ...item, isActive: false } : item)),
      );
    else
      setRecipients((current) =>
        current.map((item) => (item.id === id ? { ...item, isActive: false } : item)),
      );
    notify(`${kind === "mode" ? "Payment mode" : "Payment recipient"} archived`);
  }
  async function addMode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/payment/paymentModes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newMode }),
    });
    const data = (await response.json()) as PaymentModeOption & { error?: string };
    if (!response.ok) {
      setError(data.error ?? "Could not add payment mode.");
      return;
    }
    setModes((current) => [...current, data]);
    setNewMode("");
    notify("Payment mode added");
  }
  async function addRecipient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/payment/addPaymentRecipient", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: newRecipient, recipientType: newRecipientType }),
    });
    const data = (await response.json()) as PaymentRecipientOption & { error?: string };
    if (!response.ok) {
      setError(data.error ?? "Could not add payment recipient.");
      return;
    }
    setRecipients((current) => [...current, data]);
    setNewRecipient("");
    notify("Payment recipient added");
  }
  return (
    <div
      className="modal-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-settings-title"
      onMouseDown={(event) => event.currentTarget === event.target && close()}
    >
      <section className="modal payment-settings-modal">
        <div className="modal-header">
          <div>
            <h2 id="payment-settings-title">Payment settings</h2>
            <p>Edit or archive the methods and recipients used by your gym.</p>
          </div>
          <button type="button" className="icon-button" onClick={close} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {loading && (
          <div className="modal-loading">
            <LoaderCircle className="plan-spinner" size={16} /> Loading settings…
          </div>
        )}
        {error && <p role="alert">{error}</p>}
        <div className="settings-columns">
          <div>
            <h3>Payment methods</h3>
            {modes.map((mode) => (
              <div className="settings-row" key={mode.id}>
                <input
                  defaultValue={mode.name}
                  aria-label={`Payment method ${mode.name}`}
                  onBlur={(event) => {
                    if (
                      event.currentTarget.value.trim() &&
                      event.currentTarget.value.trim() !== mode.name
                    )
                      void saveMode(mode, event.currentTarget.value.trim());
                  }}
                />
                <span
                  className={
                    mode.isActive === false ? "managed-status paused" : "managed-status active"
                  }
                >
                  {mode.isActive === false ? "Archived" : "Active"}
                </span>
                {mode.isActive !== false && (
                  <button
                    className="text-button"
                    onClick={() => void archive("/api/payment/paymentModes", mode.id, "mode")}
                  >
                    Archive
                  </button>
                )}
              </div>
            ))}
            <form className="settings-add-row" onSubmit={addMode}>
              <input
                value={newMode}
                onChange={(event) => setNewMode(event.target.value)}
                placeholder="New payment method"
                required
              />
              <button className="button secondary" type="submit">
                Add
              </button>
            </form>
          </div>
          <div>
            <h3>Payment recipients</h3>
            {recipients.map((recipient) => (
              <div className="settings-row" key={recipient.id}>
                <input
                  defaultValue={recipient.displayName}
                  aria-label={`Payment recipient ${recipient.displayName}`}
                  onBlur={(event) => {
                    if (
                      event.currentTarget.value.trim() &&
                      event.currentTarget.value.trim() !== recipient.displayName
                    )
                      void saveRecipient(recipient, event.currentTarget.value.trim());
                  }}
                />
                <span
                  className={
                    recipient.isActive === false ? "managed-status paused" : "managed-status active"
                  }
                >
                  {recipient.isActive === false ? "Archived" : recipient.recipientType}
                </span>
                {recipient.isActive !== false && (
                  <button
                    className="text-button"
                    onClick={() =>
                      void archive("/api/payment/paymentRecipients", recipient.id, "recipient")
                    }
                  >
                    Archive
                  </button>
                )}
              </div>
            ))}
            <form className="settings-add-row" onSubmit={addRecipient}>
              <input
                value={newRecipient}
                onChange={(event) => setNewRecipient(event.target.value)}
                placeholder="New recipient"
                required
              />
              <select
                value={newRecipientType}
                onChange={(event) =>
                  setNewRecipientType(event.target.value as "GYM" | "TRAINER" | "OTHER")
                }
              >
                <option value="OTHER">Other</option>
                <option value="GYM">Gym</option>
                <option value="TRAINER">Trainer</option>
              </select>
              <button className="button secondary" type="submit">
                Add
              </button>
            </form>
          </div>
        </div>
        <div className="modal-actions">
          <button className="button primary" onClick={close}>
            Done
          </button>
        </div>
      </section>
    </div>
  );
}

function EditPaymentModal({
  payment,
  close,
  onSaved,
}: {
  payment: PaymentRecord;
  close: () => void;
  onSaved: () => Promise<void>;
}) {
  const [paymentModes, setPaymentModes] = useState<PaymentModeOption[]>([]);
  const [recipients, setRecipients] = useState<PaymentRecipientOption[]>([]);
  const [paidOn, setPaidOn] = useState(payment.paidOn);
  const [paymentModeId, setPaymentModeId] = useState(payment.paymentMode.id);
  const [recipientId, setRecipientId] = useState(payment.recipient.id);
  const [reference, setReference] = useState(payment.reference ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    void Promise.all([fetch("/api/payment/paymentModes"), fetch("/api/payment/paymentRecipients")])
      .then(async ([modesResponse, recipientsResponse]) => {
        const modes = (await modesResponse.json()) as {
          paymentModes?: PaymentModeOption[];
          error?: string;
        };
        const recipientData = (await recipientsResponse.json()) as {
          recipients?: PaymentRecipientOption[];
          error?: string;
        };
        if (
          !modesResponse.ok ||
          !recipientsResponse.ok ||
          !modes.paymentModes ||
          !recipientData.recipients
        )
          throw new Error(modes.error ?? recipientData.error ?? "Could not load payment options.");
        setPaymentModes(modes.paymentModes);
        setRecipients(recipientData.recipients);
      })
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : "Could not load payment options."),
      )
      .finally(() => setLoading(false));
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`/api/payment/${payment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paidOn, paymentModeId, recipientId, reference }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not update payment.");
      await onSaved();
      close();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update payment.");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div
      className="modal-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-payment-title"
      onMouseDown={(event) => event.currentTarget === event.target && close()}
    >
      <form className="modal payment-modal" onSubmit={submit}>
        <div className="modal-header">
          <div>
            <h2 id="edit-payment-title">Edit payment</h2>
            <p>Correct the payment date, method, recipient, or note.</p>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={close}
            aria-label="Close"
            disabled={submitting}
          >
            <X size={18} />
          </button>
        </div>
        {loading && (
          <div className="modal-loading">
            <LoaderCircle className="plan-spinner" size={16} /> Loading payment options…
          </div>
        )}
        <label>
          Paid on
          <input
            required
            type="date"
            value={paidOn}
            onChange={(event) => setPaidOn(event.target.value)}
            disabled={submitting}
          />
        </label>
        <label>
          Payment method
          <select
            required
            value={paymentModeId}
            onChange={(event) => setPaymentModeId(event.target.value)}
            disabled={loading || submitting}
          >
            {paymentModes.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Recipient
          <select
            required
            value={recipientId}
            onChange={(event) => setRecipientId(event.target.value)}
            disabled={loading || submitting}
          >
            {recipients.map((recipient) => (
              <option key={recipient.id} value={recipient.id}>
                {recipient.displayName} ({recipient.recipientType})
              </option>
            ))}
          </select>
        </label>
        <label>
          Payment note <span>Optional</span>
          <input
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            disabled={submitting}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={close} disabled={submitting}>
            Cancel
          </button>
          <button className="button primary" type="submit" disabled={loading || submitting}>
            {submitting ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function PaymentsPage() {
  const [dateRange, setDateRange] = useState<DateRange>(() => {
      const to = new Date();
      return { from: new Date(to.getFullYear(), to.getMonth(), 1), to };
    }),
    [datePreset, setDatePreset] = useState<PaymentDatePreset | null>(null),
    [filterOpen, setFilterOpen] = useState(false),
    [tab, setTab] = useState<PaymentTab>("All"),
    [query, setQuery] = useState(""),
    [mobileNav, setMobileNav] = useState(false),
    [modal, setModal] = useState(false),
    [toast, setToast] = useState(""),
    [payments, setPayments] = useState<PaymentRecord[]>([]),
    [paymentsError, setPaymentsError] = useState(""),
    [paymentsLoading, setPaymentsLoading] = useState(true),
    [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null),
    [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null),
    [openPaymentMenu, setOpenPaymentMenu] = useState<string | null>(null),
    [showPaymentSettings, setShowPaymentSettings] = useState(false);
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };
  const loadPayments = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      const start = dateKey(dateRange.from ?? new Date());
      const end = dateKey(dateRange.to ?? dateRange.from ?? new Date());
      const response = await fetch(`/api/payment/payments?start=${start}&end=${end}&limit=50`);
      const data = (await response.json()) as { payments?: PaymentRecord[]; error?: string };
      if (!response.ok || !data.payments) throw new Error(data.error ?? "Could not load payments.");

      setPayments(data.payments);
      setPaymentsError("");
    } catch (loadError) {
      setPaymentsError(loadError instanceof Error ? loadError.message : "Could not load payments.");
    } finally {
      setPaymentsLoading(false);
    }
  }, [dateRange]);
  const loadAnalytics = useCallback(async () => {
    const start = dateKey(dateRange.from ?? new Date());
    const end = dateKey(dateRange.to ?? dateRange.from ?? new Date());
    const response = await fetch(`/api/payment/analytics?start=${start}&end=${end}`);
    const data = (await response.json()) as PaymentAnalytics | { error?: string };
    if (!response.ok || !("summary" in data))
      throw new Error("error" in data ? data.error : "Could not load payment analytics.");
    setAnalytics(data);
  }, [dateRange]);
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadPayments();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadPayments]);
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadAnalytics().catch(() => setAnalytics(null));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadAnalytics]);
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (new URLSearchParams(window.location.search).get("record") === "1") setModal(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const visible = useMemo(
    () =>
      payments.filter(
        (payment) =>
          (tab === "All" || displayPaymentStatus(payment.status) === tab) &&
          `${payment.member.fullName} ${payment.id} ${payment.membership?.planName ?? ""} ${payment.paymentMode.name}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ),
    [payments, tab, query],
  );
  const counts: Record<PaymentTab, number> = payments.reduce(
    (total, payment) => {
      total.All += 1;
      total[displayPaymentStatus(payment.status)] += 1;
      return total;
    },
    { All: 0, Paid: 0, Refunded: 0, Voided: 0 },
  );
  const refreshPaymentData = useCallback(async () => {
    await Promise.all([loadPayments(), loadAnalytics()]);
  }, [loadAnalytics, loadPayments]);
  function applyDatePreset(preset: PaymentDatePreset) {
    setDatePreset(preset);
    setDateRange(dateRangeForPreset(preset));
    setFilterOpen(false);
  }
  function applyCustomDateRange(range: DateRange | undefined) {
    if (!range) return;
    setDatePreset(null);
    setDateRange(range);
  }
  const summary = analytics?.summary;
  function exportPayments() {
    const rows = payments.map((payment) =>
      [
        payment.id,
        payment.member.fullName,
        payment.membership?.planName ?? "",
        payment.paidOn,
        payment.paymentMode.name,
        payment.amount,
        displayPaymentStatus(payment.status),
      ].join(","),
    );
    const url = URL.createObjectURL(
      new Blob([["Payment ID,Member,Plan,Date,Method,Amount,Status", ...rows].join("\n")], {
        type: "text/csv",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "gymwise-payments.csv";
    link.click();
    URL.revokeObjectURL(url);
    notify("Payments exported successfully");
  }

  return (
    <div className="app-shell">
      <DashboardSidebar open={mobileNav} onClose={() => setMobileNav(false)} onNotify={notify} />
      <div className="app-content">
        <Header onMenu={() => setMobileNav(true)} notify={notify} />
        <main className="dashboard payments-dashboard">
          <div className="page-heading payments-heading">
            <div>
              <h1>Payments</h1>
              <p>Track collections, settlements, and member transactions.</p>
            </div>
            <div className="heading-actions">
              <DateRangePicker value={dateRange} onChange={applyCustomDateRange} />
              <button className="button secondary export-button" onClick={exportPayments}>
                <Download size={16} /> Export
              </button>
              <button className="button primary" onClick={() => setModal(true)}>
                <Plus size={17} /> Record payment
              </button>
            </div>
          </div>
          <section className="kpi-grid" aria-label="Payment summary">
            <Stat
              icon={IndianRupee}
              tone="purple"
              label="Total collected"
              value={summary ? money(Number(summary.totalCollected)) : "—"}
              change={
                summary?.totalCollectedChange
                  ? `${Number(summary.totalCollectedChange) >= 0 ? "+" : ""}${summary.totalCollectedChange}%`
                  : undefined
              }
              detail={
                summary
                  ? `Across ${summary.successfulPaymentCount} successful payments`
                  : "Loading collections…"
              }
            />
            <Stat
              icon={ReceiptText}
              tone="blue"
              label="Pending amount"
              value={summary ? money(Number(summary.outstandingAmount)) : "—"}
              detail="Open membership dues"
            />
            <Stat
              icon={RefreshCw}
              tone="amber"
              label="Voided payments"
              value={summary ? money(Number(summary.voidedAmount)) : "—"}
              detail={
                summary
                  ? `${summary.voidedPaymentCount} voided payments this period`
                  : "Loading payment status…"
              }
            />
            <Stat
              icon={TrendingUp}
              tone="green"
              label="Collection rate"
              value={summary ? `${summary.collectionRate}%` : "—"}
              detail="Collected against outstanding dues"
            />
          </section>
          <section className="payments-overview-grid">
            <article className="panel revenue-panel">
              <div className="payment-card-header">
                <div>
                  <h2>Collection overview</h2>
                  <p>Revenue received across all payment methods</p>
                </div>
                <div className="revenue-summary">
                  <div>
                    <small>Total collected</small>
                    <strong>{summary ? money(Number(summary.totalCollected)) : "—"}</strong>
                  </div>
                  {summary?.totalCollectedChange && (
                    <span>
                      <ArrowUpRight size={13} /> {summary.totalCollectedChange}%
                    </span>
                  )}
                </div>
              </div>
              <RevenueChart chart={analytics?.chart ?? null} />
            </article>
            <div className="payments-side">
              <article className="settlement-card">
                <div className="settlement-top">
                  <span>
                    <ArrowUpRight size={18} />
                  </span>
                  <div>
                    <small>Collection snapshot</small>
                    <strong>{summary ? money(Number(summary.totalCollected)) : "—"}</strong>
                  </div>
                  <em>{analytics ? "Live data" : "Loading"}</em>
                </div>
                <div className="settlement-meta">
                  <div>
                    <span>Successful payments</span>
                    <strong>{summary?.successfulPaymentCount ?? "—"}</strong>
                  </div>
                  <div>
                    <span>Collection rate</span>
                    <strong>{summary ? `${summary.collectionRate}%` : "—"}</strong>
                  </div>
                </div>
                <button
                  onClick={() =>
                    document
                      .getElementById("payment-transactions")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                >
                  View transactions <ArrowRight size={14} />
                </button>
              </article>
              <article className="panel methods-panel">
                <div className="payment-card-header compact">
                  <div>
                    <h2>Payment methods</h2>
                    <p>Share of collections this period</p>
                  </div>
                  <button
                    className="icon-button small"
                    aria-label="Manage payment settings"
                    onClick={() => setShowPaymentSettings(true)}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </div>
                <div className="method-content">
                  <div className="donut">
                    <div>
                      <strong>{summary?.successfulPaymentCount ?? "—"}</strong>
                      <span>payments</span>
                    </div>
                  </div>
                  <div className="method-list">
                    {(analytics?.paymentMethods ?? []).map((method, index) => (
                      <div className="method-row" key={method.id}>
                        <i className={paymentColors[index % paymentColors.length]} />
                        <span>{method.name}</span>
                        <strong>{method.share}%</strong>
                        <small>{money(Number(method.amount))}</small>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            </div>
          </section>
          <article id="payment-transactions" className="panel transactions-panel">
            <div className="transactions-header">
              <div>
                <h2>Recent transactions</h2>
                <p>Track and manage every member payment</p>
              </div>
              <button
                className="text-button"
                onClick={() => void loadPayments()}
                disabled={paymentsLoading}
              >
                Refresh <ArrowRight size={14} />
              </button>
            </div>
            <div className="transaction-toolbar">
              <div className="payment-tabs">
                {(["All", "Paid", "Refunded", "Voided"] as PaymentTab[]).map((item) => (
                  <button
                    key={item}
                    onClick={() => setTab(item)}
                    className={tab === item ? "selected" : ""}
                  >
                    {item}
                    <span>{counts[item]}</span>
                  </button>
                ))}
              </div>
              <div className="transaction-tools">
                <label className="transaction-search">
                  <Search size={15} />
                  <input
                    id="payment-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search payments"
                  />
                  {query && (
                    <button onClick={() => setQuery("")} aria-label="Clear search">
                      <X size={13} />
                    </button>
                  )}
                </label>
                <div className="payment-filter-wrap">
                  <button
                    className={`icon-button table-filter${filterOpen || datePreset ? " active" : ""}`}
                    onClick={() => setFilterOpen((open) => !open)}
                    aria-label="Filter payments by date"
                    aria-expanded={filterOpen}
                  >
                    <Filter size={16} />
                  </button>
                  {filterOpen && (
                    <div
                      className="payment-filter-menu"
                      role="menu"
                      aria-label="Payment date filters"
                    >
                      <strong>Payment date</strong>
                      {(["Days", "Months"] as const).map((group) => (
                        <div key={group} className="payment-filter-group">
                          <span>{group}</span>
                          {paymentDatePresets
                            .filter((preset) => preset.group === group)
                            .map((preset) => (
                              <button
                                key={preset.value}
                                role="menuitemradio"
                                aria-checked={datePreset === preset.value}
                                className={datePreset === preset.value ? "selected" : ""}
                                onClick={() => applyDatePreset(preset.value)}
                              >
                                {preset.label}
                              </button>
                            ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="payments-table-wrap">
              <table className="payments-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {paymentsLoading ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="payment-empty">
                          <LoaderCircle size={25} className="animate-spin" />
                          <strong>Loading payments</strong>
                          <span>Fetching recent transactions…</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {visible.map((payment, index) => {
                        const status = displayPaymentStatus(payment.status);
                        return (
                          <tr
                            key={payment.id}
                            onClick={() => notify(`${payment.id} details opened`)}
                          >
                            <td>
                              <div className="member-cell">
                                <span
                                  className={`avatar ${paymentColors[index % paymentColors.length]}`}
                                >
                                  {initials(payment.member.fullName)}
                                </span>
                                <div>
                                  <strong>{payment.member.fullName}</strong>
                                  <small>
                                    {payment.membership?.planName ?? "Unallocated payment"}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="payment-date">{payment.paidOn}</span>
                            </td>
                            <td>
                              <span className="payment-method">
                                {payment.paymentMode.name === "UPI" ? (
                                  <Zap size={13} />
                                ) : payment.paymentMode.name === "Cash" ? (
                                  <IndianRupee size={13} />
                                ) : (
                                  <FileText size={13} />
                                )}
                                {payment.paymentMode.name}
                              </span>
                            </td>
                            <td>
                              <strong className="amount-cell">
                                {money(Number(payment.amount))}
                              </strong>
                            </td>
                            <td>
                              <span className={`status-pill ${status.toLowerCase()}`}>
                                <i />
                                {status}
                              </span>
                            </td>
                            <td className="membership-actions">
                              <button
                                className="icon-button small"
                                aria-label={`Actions for ${payment.member.fullName}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setOpenPaymentMenu((current) =>
                                    current === payment.id ? null : payment.id,
                                  );
                                }}
                              >
                                <MoreHorizontal size={17} />
                              </button>
                              {openPaymentMenu === payment.id && (
                                <div className="membership-menu" role="menu">
                                  <button
                                    role="menuitem"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setOpenPaymentMenu(null);
                                      setEditingPayment(payment);
                                    }}
                                  >
                                    Edit payment
                                  </button>
                                  {payment.status === "SUCCEEDED" && (
                                    <button
                                      role="menuitem"
                                      onClick={async (event) => {
                                        event.stopPropagation();
                                        setOpenPaymentMenu(null);
                                        if (
                                          !window.confirm(
                                            `Void payment ${payment.id}? It will be excluded from member balances.`,
                                          )
                                        )
                                          return;
                                        const response = await fetch(`/api/payment/${payment.id}`, {
                                          method: "DELETE",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({
                                            voidReason: "Voided from dashboard",
                                          }),
                                        });
                                        const data = (await response.json()) as { error?: string };
                                        if (!response.ok) {
                                          notify(data.error ?? "Could not void payment.");
                                          return;
                                        }
                                        notify("Payment voided successfully");
                                        await refreshPaymentData();
                                      }}
                                    >
                                      Void payment
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {visible.length === 0 && (
                        <tr>
                          <td colSpan={6}>
                            <div className="payment-empty">
                              <ReceiptText size={25} />
                              <strong>
                                {paymentsError ? "Could not load payments" : "No payments found"}
                              </strong>
                              <span>{paymentsError || "Try a different search or status."}</span>
                              <button
                                onClick={() => {
                                  setQuery("");
                                  setTab("All");
                                  void loadPayments();
                                }}
                              >
                                Refresh
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <span>
                Showing {visible.length} of {payments.length} transactions
              </span>
            </div>
          </article>
          <footer className="dashboard-footer">
            <span>Last updated a few seconds ago</span>
            <span>
              <ShieldCheck size={14} /> Payments are encrypted and securely processed
            </span>
          </footer>
        </main>
      </div>
      <MobileNavigation active="payments" onNotify={notify} onAdd={() => setModal(true)} />
      {modal && (
        <RecordModal
          close={() => setModal(false)}
          notify={notify}
          onRecorded={refreshPaymentData}
        />
      )}
      {editingPayment && (
        <EditPaymentModal
          payment={editingPayment}
          close={() => setEditingPayment(null)}
          onSaved={async () => {
            await refreshPaymentData();
            notify("Payment updated successfully");
          }}
        />
      )}
      {showPaymentSettings && (
        <PaymentSettingsModal close={() => setShowPaymentSettings(false)} notify={notify} />
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
