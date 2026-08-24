"use client";

import {
  ArrowDownLeft, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, CalendarDays,
  Check, ChevronDown, CircleHelp, Download, FileText, Filter, HelpCircle,
  IndianRupee, LoaderCircle, Menu, Moon, MoreHorizontal, Plus, ReceiptText, RefreshCw, Search,
  ShieldCheck, Sun, TrendingUp, X, Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ElementType } from "react";
import DashboardSidebar from "./dashboard-sidebar";
import MobileNavigation from "./mobile-navigation";

type PaymentStatus = "Paid" | "Refunded" | "Voided";
type PaymentTab = "All" | PaymentStatus;
type Period = "This month" | "Last month" | "Last 3 months";

type PaymentRecord = {
  id: string;
  amount: string;
  paidOn: string;
  status: "SUCCEEDED" | "VOIDED" | "REFUNDED";
  member: { id: string; fullName: string };
  membership: { id: string; planName: string } | null;
  paymentMode: { id: string; name: string };
};

type PaymentAnalytics = {
  summary: { totalCollected: string; totalCollectedChange: string | null; successfulPaymentCount: number; outstandingAmount: string; voidedAmount: string; voidedPaymentCount: number; collectionRate: string };
  chart: { current: { date: string; amount: string }[]; previous: { date: string; amount: string }[] };
  paymentMethods: { id: string; name: string; amount: string; count: number; share: number }[];
};

const paymentColors = ["violet", "blue", "amber", "pink", "green"];
const initials = (fullName: string) => fullName.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();
const paymentStatusLabels = { SUCCEEDED: "Paid", REFUNDED: "Refunded", VOIDED: "Voided" } as const satisfies Record<PaymentRecord["status"], PaymentStatus>;
const displayPaymentStatus = (status: PaymentRecord["status"]): PaymentStatus => paymentStatusLabels[status];
const analyticsPeriods: Record<Period, string> = { "This month": "THIS_MONTH", "Last month": "LAST_MONTH", "Last 3 months": "LAST_3_MONTHS" };

const money = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

function Brand() { return <div className="brand"><div className="brand-mark"><TrendingUp size={18} strokeWidth={2.8} /></div><span>Gymwise</span></div>; }


function ThemeToggle() {
  function toggle() { const dark = document.documentElement.dataset.theme !== "dark"; document.documentElement.dataset.theme = dark ? "dark" : "light"; localStorage.setItem("gymwise-theme", dark ? "dark" : "light"); }
  return <button className="icon-button theme-button" onClick={toggle} aria-label="Toggle color theme"><Sun className="theme-sun" size={18} /><Moon className="theme-moon" size={18} /></button>;
}

function Header({ onMenu, notify }: { onMenu: () => void; notify: (message: string) => void }) {
  return <header className="topbar"><div className="topbar-left"><button className="icon-button menu-button" onClick={onMenu} aria-label="Open navigation"><Menu size={20} /></button><div className="mobile-brand"><Brand /></div><button className="search-box" onClick={() => document.getElementById("payment-search")?.focus()}><Search size={16} /><span>Search members, payments...</span><kbd>⌘ K</kbd></button></div><div className="topbar-actions"><button className="icon-button help-button" onClick={() => notify("Help centre opened")} aria-label="Help"><HelpCircle size={18} /></button><ThemeToggle /><button className="icon-button notification-button" onClick={() => notify("You have 3 new notifications")} aria-label="Notifications"><Bell size={18} /><i /></button><div className="topbar-divider" /><button className="profile" onClick={() => notify("Profile menu opened")}><span className="avatar avatar-main">PK</span><span className="profile-copy"><strong>Priya Khanna</strong><small>Owner</small></span><ChevronDown size={15} /></button></div></header>;
}

function Stat({ icon: Icon, tone, label, value, detail, change }: { icon: ElementType; tone: string; label: string; value: string; detail: string; change?: string }) {
  return <article className="kpi-card payment-kpi"><div className="kpi-top"><div className={`kpi-icon ${tone}`}><Icon size={18} /></div><div className="kpi-copy"><div className="kpi-label">{label}<button aria-label={`About ${label}`}><CircleHelp size={13} /></button></div><div className="kpi-value-row"><strong>{value}</strong>{change && <span className={change.startsWith("-") ? "negative" : "positive"}>{change.startsWith("-") ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}{change.replace(/[+-]/, "")}</span>}</div></div></div><p>{detail}</p></article>;
}

function RevenueChart({ chart }: { chart: PaymentAnalytics["chart"] | null }) {
  const width = 760, height = 190, currentValues = chart?.current.map(point => Number(point.amount)) ?? [], previousValues = chart?.previous.map(point => Number(point.amount)) ?? [];
  const maximum = Math.max(...currentValues, ...previousValues, 1);
  const path = (values: number[]) => values.map((value, index) => `${index ? "L" : "M"}${values.length > 1 ? index / (values.length - 1) * width : width},${height - value / maximum * height}`).join(" ");
  const current = path(currentValues), previous = path(previousValues), lastY = height - (currentValues.at(-1) ?? 0) / maximum * height;
  const labels = (chart?.current ?? []).filter((_, index) => index % 3 === 0).map(point => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(`${point.date}T00:00:00Z`)));
  return <div className="revenue-chart" aria-label="Revenue chart"><div className="chart-axis"><span>{money(maximum)}</span><span>{money(maximum * 2 / 3)}</span><span>{money(maximum / 3)}</span><span>₹0</span></div><svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img"><defs><linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6f57e8" stopOpacity=".24" /><stop offset="100%" stopColor="#6f57e8" stopOpacity="0" /></linearGradient></defs>{[0, 63, 126, 189].map(y => <line key={y} x1="0" x2={width} y1={y} y2={y} className="payment-grid-line" />)}{current && <><path d={`${current} L${width},${height} L0,${height} Z`} fill="url(#revenueArea)" /><path d={current} className="revenue-line" /><circle cx={width} cy={lastY} r="7" className="revenue-dot-ring" /><circle cx={width} cy={lastY} r="3.5" className="revenue-dot" /></>}{previous && <path d={previous} className="previous-revenue-line" />}</svg><div className="chart-months">{labels.map(label => <span key={label}>{label}</span>)}</div><div className="chart-key"><span><i />This period</span><span><i />Previous period</span></div></div>;
}

type PaymentMember = { id: string; fullName: string };
type PaymentModeOption = { id: string; name: string };
type PaymentRecipientOption = { id: string; displayName: string; recipientType: "GYM" | "TRAINER" | "OTHER" };
type ChargeOption = { id: string; amount: string; paidAmount: string; outstandingAmount: string; dueOn: string };
type PaymentContext = { memberships: { id: string; planName: string; charges: ChargeOption[] }[] };

function RecordModal({ close, notify, onRecorded }: { close: () => void; notify: (message: string) => void; onRecorded: () => Promise<void> }) {
  const [members, setMembers] = useState<PaymentMember[]>([]), [paymentModes, setPaymentModes] = useState<PaymentModeOption[]>([]), [recipients, setRecipients] = useState<PaymentRecipientOption[]>([]);
  const [memberId, setMemberId] = useState(""), [context, setContext] = useState<PaymentContext | null>(null), [selectedCharge, setSelectedCharge] = useState(""), [amount, setAmount] = useState(""), [paymentModeId, setPaymentModeId] = useState(""), [recipientId, setRecipientId] = useState(""), [reference, setReference] = useState(""), [paidOn, setPaidOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true), [submitting, setSubmitting] = useState(false), [error, setError] = useState("");

  const charges = context?.memberships.flatMap(membership => membership.charges.map(charge => ({ ...charge, membershipId: membership.id, planName: membership.planName }))) ?? [];

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
        setPaymentModes(modesData.paymentModes);
        setRecipients(recipientsData.recipients);
        setPaymentModeId(modesData.paymentModes[0]?.id ?? "");
        setRecipientId(recipientsData.recipients.find(recipient => recipient.recipientType === "GYM")?.id ?? recipientsData.recipients[0]?.id ?? "");
      } catch {
        if (!cancelled) setError("Could not load payment options. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadOptions();
    return () => { cancelled = true; };
  }, []);

  async function selectMember(nextMemberId: string) {
    setMemberId(nextMemberId);
    setContext(null);
    setSelectedCharge("");
    setError("");
    if (!nextMemberId) return;

    try {
      const response = await fetch(`/api/members/${nextMemberId}/payment-context`);
      const data = await response.json() as PaymentContext | { error?: string };
      if (!response.ok || !("memberships" in data)) throw new Error("error" in data ? data.error : "Could not load member dues.");

      setContext(data);
      const firstCharge = data.memberships.flatMap(membership => membership.charges.map(charge => `${membership.id}:${charge.id}`))[0];
      setSelectedCharge(firstCharge ?? "");
      if (!firstCharge) setError("This member has no open membership dues to pay.");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load member dues.");
    }
  }

  async function submitPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const charge = charges.find(option => `${option.membershipId}:${option.id}` === selectedCharge);
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
        body: JSON.stringify({ memberId, membershipId: charge.membershipId, chargeId: charge.id, amount, paidOn, paymentModeId, recipientId, reference }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not record the payment.");

      await onRecorded();
      close();
      notify("Payment recorded successfully");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not record the payment.");
    } finally {
      setSubmitting(false);
    }
  }

  return <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="record-title" onMouseDown={event => event.currentTarget === event.target && close()}><form className="modal payment-modal" onSubmit={submitPayment}><div className="modal-header"><div><h2 id="record-title">Record a payment</h2><p>Add an offline or manual member payment.</p></div><button type="button" className="icon-button" onClick={close} aria-label="Close"><X size={18} /></button></div><label>Member<select required autoFocus value={memberId} onChange={event => void selectMember(event.target.value)} disabled={loading || submitting}><option value="" disabled>{loading ? "Loading members…" : "Select member"}</option>{members.map(member => <option value={member.id} key={member.id}>{member.fullName}</option>)}</select></label><label>Membership due<select required value={selectedCharge} onChange={event => setSelectedCharge(event.target.value)} disabled={!memberId || submitting}><option value="" disabled>Select a due</option>{charges.map(charge => <option value={`${charge.membershipId}:${charge.id}`} key={charge.id}>{charge.planName} · ₹{charge.outstandingAmount} due · {charge.dueOn}</option>)}</select></label><div className="form-row"><label>Amount<input required type="number" min="0.01" step="0.01" value={amount} onChange={event => setAmount(event.target.value)} placeholder="₹ 0" disabled={submitting} /></label><label>Payment method<select value={paymentModeId} onChange={event => setPaymentModeId(event.target.value)} required disabled={loading || submitting}><option value="" disabled>Select method</option>{paymentModes.map(mode => <option value={mode.id} key={mode.id}>{mode.name}</option>)}</select></label></div><label>Recipient<select value={recipientId} onChange={event => setRecipientId(event.target.value)} required disabled={loading || submitting}><option value="" disabled>Select recipient</option>{recipients.map(recipient => <option value={recipient.id} key={recipient.id}>{recipient.displayName} ({recipient.recipientType})</option>)}</select></label><label>Payment note <span>Optional</span><input value={reference} onChange={event => setReference(event.target.value)} placeholder="e.g. August membership fee" disabled={submitting} /></label><label>Paid on<input required type="date" value={paidOn} onChange={event => setPaidOn(event.target.value)} disabled={submitting} /></label>{error && <p role="alert">{error}</p>}<div className="secure-note"><ShieldCheck size={15} /> This payment will be added to the member ledger.</div><div className="modal-actions"><button type="button" className="button secondary" onClick={close} disabled={submitting}>Cancel</button><button className="button primary" type="submit" disabled={loading || submitting || !selectedCharge}><Check size={16} /> {submitting ? "Recording…" : "Record payment"}</button></div></form></div>;
}

export default function PaymentsPage() {
  const [period, setPeriod] = useState<Period>("This month"), [tab, setTab] = useState<PaymentTab>("All"), [query, setQuery] = useState(""), [mobileNav, setMobileNav] = useState(false), [modal, setModal] = useState(false), [toast, setToast] = useState(""), [payments, setPayments] = useState<PaymentRecord[]>([]), [paymentsError, setPaymentsError] = useState(""), [paymentsLoading, setPaymentsLoading] = useState(true), [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };
  const loadPayments = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      const response = await fetch("/api/payment/payments?limit=50");
      const data = await response.json() as { payments?: PaymentRecord[]; error?: string };
      if (!response.ok || !data.payments) throw new Error(data.error ?? "Could not load payments.");

      setPayments(data.payments);
      setPaymentsError("");
    } catch (loadError) {
      setPaymentsError(loadError instanceof Error ? loadError.message : "Could not load payments.");
    } finally {
      setPaymentsLoading(false);
    }
  }, []);
  const loadAnalytics = useCallback(async () => {
    const response = await fetch(`/api/payment/analytics?period=${analyticsPeriods[period]}`);
    const data = await response.json() as PaymentAnalytics | { error?: string };
    if (!response.ok || !("summary" in data)) throw new Error("error" in data ? data.error : "Could not load payment analytics.");
    setAnalytics(data);
  }, [period]);
  useEffect(() => {
    const timeout = window.setTimeout(() => { void loadPayments(); }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadPayments]);
  useEffect(() => {
    const timeout = window.setTimeout(() => { void loadAnalytics().catch(() => setAnalytics(null)); }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadAnalytics]);

  const visible = useMemo(() => payments.filter(payment => (tab === "All" || displayPaymentStatus(payment.status) === tab) && `${payment.member.fullName} ${payment.id} ${payment.membership?.planName ?? ""} ${payment.paymentMode.name}`.toLowerCase().includes(query.trim().toLowerCase())), [payments, tab, query]);
  const counts: Record<PaymentTab, number> = payments.reduce((total, payment) => {
    total.All += 1;
    total[displayPaymentStatus(payment.status)] += 1;
    return total;
  }, { All: 0, Paid: 0, Refunded: 0, Voided: 0 });
  const refreshPaymentData = useCallback(async () => { await Promise.all([loadPayments(), loadAnalytics()]); }, [loadAnalytics, loadPayments]);
  const summary = analytics?.summary;
  function exportPayments() { const rows = payments.map(payment => [payment.id, payment.member.fullName, payment.membership?.planName ?? "", payment.paidOn, payment.paymentMode.name, payment.amount, displayPaymentStatus(payment.status)].join(",")); const url = URL.createObjectURL(new Blob([["Payment ID,Member,Plan,Date,Method,Amount,Status", ...rows].join("\n")], { type: "text/csv" })); const link = document.createElement("a"); link.href = url; link.download = "gymwise-payments.csv"; link.click(); URL.revokeObjectURL(url); notify("Payments exported successfully"); }

  return <div className="app-shell"><DashboardSidebar open={mobileNav} onClose={() => setMobileNav(false)} onNotify={notify} /><div className="app-content"><Header onMenu={() => setMobileNav(true)} notify={notify} /><main className="dashboard payments-dashboard">
    <div className="page-heading payments-heading"><div><h1>Payments</h1><p>Track collections, settlements, and member transactions.</p></div><div className="heading-actions"><div className="period-select"><CalendarDays size={16} /><select value={period} onChange={event => setPeriod(event.target.value as Period)} aria-label="Payment period"><option>This month</option><option>Last month</option><option>Last 3 months</option></select><ChevronDown size={14} /></div><button className="button secondary export-button" onClick={exportPayments}><Download size={16} /> Export</button><button className="button primary" onClick={() => setModal(true)}><Plus size={17} /> Record payment</button></div></div>
    <section className="kpi-grid" aria-label="Payment summary"><Stat icon={IndianRupee} tone="purple" label="Total collected" value={summary ? money(Number(summary.totalCollected)) : "—"} change={summary?.totalCollectedChange ? `${Number(summary.totalCollectedChange) >= 0 ? "+" : ""}${summary.totalCollectedChange}%` : undefined} detail={summary ? `Across ${summary.successfulPaymentCount} successful payments` : "Loading collections…"} /><Stat icon={ReceiptText} tone="blue" label="Pending amount" value={summary ? money(Number(summary.outstandingAmount)) : "—"} detail="Open membership dues" /><Stat icon={RefreshCw} tone="amber" label="Voided payments" value={summary ? money(Number(summary.voidedAmount)) : "—"} detail={summary ? `${summary.voidedPaymentCount} voided payments this period` : "Loading payment status…"} /><Stat icon={TrendingUp} tone="green" label="Collection rate" value={summary ? `${summary.collectionRate}%` : "—"} detail="Collected against outstanding dues" /></section>
    <section className="payments-overview-grid"><article className="panel revenue-panel"><div className="payment-card-header"><div><h2>Collection overview</h2><p>Revenue received across all payment methods</p></div><div className="revenue-summary"><div><small>Total collected</small><strong>{summary ? money(Number(summary.totalCollected)) : "—"}</strong></div>{summary?.totalCollectedChange && <span><ArrowUpRight size={13} /> {summary.totalCollectedChange}%</span>}</div></div><RevenueChart chart={analytics?.chart ?? null} /></article><div className="payments-side"><article className="settlement-card"><div className="settlement-top"><span><ArrowDownLeft size={18} /></span><div><small>Settlement data</small><strong>Not available</strong></div><em>Not configured</em></div><div className="settlement-meta"><div><span>Expected by</span><strong>—</strong></div><div><span>Bank account</span><strong>—</strong></div></div><button onClick={() => notify("Settlement data is not configured")}>View settlement details <ArrowRight size={14} /></button></article><article className="panel methods-panel"><div className="payment-card-header compact"><div><h2>Payment methods</h2><p>Share of collections this period</p></div><button className="icon-button small" onClick={() => void loadAnalytics()}><MoreHorizontal size={18} /></button></div><div className="method-content"><div className="donut"><div><strong>{summary?.successfulPaymentCount ?? "—"}</strong><span>payments</span></div></div><div className="method-list">{(analytics?.paymentMethods ?? []).map((method, index) => <div className="method-row" key={method.id}><i className={paymentColors[index % paymentColors.length]} /><span>{method.name}</span><strong>{method.share}%</strong><small>{money(Number(method.amount))}</small></div>)}</div></div></article></div></section>
    <article className="panel transactions-panel"><div className="transactions-header"><div><h2>Recent transactions</h2><p>Track and manage every member payment</p></div><button className="text-button" onClick={() => void loadPayments()} disabled={paymentsLoading}>Refresh <ArrowRight size={14} /></button></div><div className="transaction-toolbar"><div className="payment-tabs">{(["All", "Paid", "Refunded", "Voided"] as PaymentTab[]).map(item => <button key={item} onClick={() => setTab(item)} className={tab === item ? "selected" : ""}>{item}<span>{counts[item]}</span></button>)}</div><div className="transaction-tools"><label className="transaction-search"><Search size={15} /><input id="payment-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search payments" />{query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={13} /></button>}</label><button className="icon-button table-filter" onClick={() => notify("Advanced filters opened")}><Filter size={16} /></button></div></div><div className="payments-table-wrap"><table className="payments-table"><thead><tr><th>Member</th><th>Payment ID</th><th>Date</th><th>Method</th><th>Amount</th><th>Status</th><th /></tr></thead><tbody>{paymentsLoading ? <tr><td colSpan={7}><div className="payment-empty"><LoaderCircle size={25} className="animate-spin" /><strong>Loading payments</strong><span>Fetching recent transactions…</span></div></td></tr> : <>{visible.map((payment, index) => { const status = displayPaymentStatus(payment.status); return <tr key={payment.id} onClick={() => notify(`${payment.id} details opened`)}><td><div className="member-cell"><span className={`avatar ${paymentColors[index % paymentColors.length]}`}>{initials(payment.member.fullName)}</span><div><strong>{payment.member.fullName}</strong><small>{payment.membership?.planName ?? "Unallocated payment"}</small></div></div></td><td><span className="payment-id">{payment.id}</span></td><td><span className="payment-date">{payment.paidOn}</span></td><td><span className="payment-method">{payment.paymentMode.name === "UPI" ? <Zap size={13} /> : payment.paymentMode.name === "Cash" ? <IndianRupee size={13} /> : <FileText size={13} />}{payment.paymentMode.name}</span></td><td><strong className="amount-cell">{money(Number(payment.amount))}</strong></td><td><span className={`status-pill ${status.toLowerCase()}`}><i />{status}</span></td><td><button className="icon-button small" onClick={event => { event.stopPropagation(); notify(`Actions opened for ${payment.id}`); }}><MoreHorizontal size={17} /></button></td></tr>; })}{visible.length === 0 && <tr><td colSpan={7}><div className="payment-empty"><ReceiptText size={25} /><strong>{paymentsError ? "Could not load payments" : "No payments found"}</strong><span>{paymentsError || "Try a different search or status."}</span><button onClick={() => { setQuery(""); setTab("All"); void loadPayments(); }}>Refresh</button></div></td></tr>}</>}</tbody></table></div><div className="table-footer"><span>Showing {visible.length} of {payments.length} transactions</span></div></article>
    <footer className="dashboard-footer"><span>Last updated a few seconds ago</span><span><ShieldCheck size={14} /> Payments are encrypted and securely processed</span></footer>
  </main></div><MobileNavigation active="payments" onNotify={notify} onAdd={() => setModal(true)} />{modal && <RecordModal close={() => setModal(false)} notify={notify} onRecorded={refreshPaymentData} />}{toast && <div className="toast" role="status"><span><Check size={15} /></span>{toast}</div>}</div>;
}
