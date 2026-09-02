"use client";

import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  IndianRupee,
  LoaderCircle,
  ReceiptText,
  RefreshCw,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type OverviewWindow = 7 | 14 | 30;
type OverviewData = {
  generatedAt: string;
  today: string;
  windowDays: OverviewWindow;
  user: { firstName: string };
  gym: { name: string; timezone: string };
  summary: {
    activeMemberships: number;
    totalMembers: number;
    expiringCount: number;
    expiringValue: string;
    totalCollected: string;
    totalCollectedChange: string | null;
    outstandingAmount: string;
    overdueAmount: string;
    overdueMembers: number;
    collectionRate: string;
  };
  expiringMemberships: {
    id: string;
    member: { id: string; fullName: string };
    planName: string;
    endsOn: string;
    agreedFee: string;
    outstandingAmount: string;
    overdueAmount: string;
  }[];
  recentPayments: {
    id: string;
    amount: string;
    paidOn: string;
    status: "SUCCEEDED" | "VOIDED" | "REFUNDED";
    member: { id: string; fullName: string };
    membership: { id: string; planName: string } | null;
    paymentMode: string;
  }[];
};

const overviewMoney = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const overviewDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });

function memberInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function daysBetween(startKey: string, endKey: string) {
  return Math.round(
    (Date.parse(`${endKey}T00:00:00Z`) - Date.parse(`${startKey}T00:00:00Z`)) / 86_400_000,
  );
}

function expiryLabel(today: string, endsOn: string) {
  const remaining = daysBetween(today, endsOn);
  if (remaining === 0) return "Today";
  if (remaining === 1) return "Tomorrow";
  return `In ${remaining} days`;
}

function paymentStatus(status: OverviewData["recentPayments"][number]["status"]) {
  if (status === "SUCCEEDED") return "Paid";
  return status === "REFUNDED" ? "Refunded" : "Voided";
}

export default function Overview() {
  const [days, setDays] = useState<OverviewWindow>(7);
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/overview?days=${days}`, { signal });
        const result = (await response.json()) as OverviewData | { error?: string };
        if (!response.ok || !("summary" in result))
          throw new Error(
            "error" in result
              ? (result.error ?? "Could not load the overview.")
              : "Could not load the overview.",
          );
        setData(result);
      } catch (reason) {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "Could not load the overview.");
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [days],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => void loadOverview(controller.signal), 0);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [loadOverview]);

  const summary = data?.summary;
  const collectedChange =
    summary?.totalCollectedChange === null || summary?.totalCollectedChange === undefined
      ? "No prior-month comparison"
      : `${Number(summary.totalCollectedChange) >= 0 ? "+" : ""}${summary.totalCollectedChange}% from last month`;

  return (
    <>
      <div className="page-heading managed-heading overview-heading">
        <div>
          <p className="managed-breadcrumb">
            Workspace <ChevronRight size={12} /> Overview
          </p>
          <h1>{data ? `Welcome back, ${data.user.firstName}` : "Welcome back"}</h1>
          <p>
            {data
              ? `Here’s what needs attention at ${data.gym.name} today.`
              : "Your membership and collections workspace."}
          </p>
        </div>
        <div className="heading-actions">
          <Button variant="outline" size="lg" asChild>
            <Link href="/payments?record=1">
              <IndianRupee />
              Record payment
            </Link>
          </Button>
          <Button size="lg" asChild>
            <Link href="/members?add=1">
              <UserPlus />
              Add member
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <Card className="overview-error" role="alert">
          <AlertCircle />
          <div>
            <strong>Could not load the overview</strong>
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadOverview()}>
            <RefreshCw />
            Try again
          </Button>
        </Card>
      )}

      <section className="overview-stats" aria-label="Business summary">
        <Card className="overview-stat">
          <span className="managed-stat-icon purple">
            <Users />
          </span>
          <div>
            <small>Active memberships</small>
            <strong>{loading && !data ? "—" : (summary?.activeMemberships ?? 0)}</strong>
            <em>{summary ? `${summary.totalMembers} total members` : "Loading member totals…"}</em>
          </div>
        </Card>
        <Card className="overview-stat">
          <span className="managed-stat-icon amber">
            <CalendarDays />
          </span>
          <div>
            <small>Expiring in {days} days</small>
            <strong>{loading ? "—" : (summary?.expiringCount ?? 0)}</strong>
            <em>
              {loading
                ? "Loading upcoming expiries…"
                : summary
                  ? `${overviewMoney.format(Number(summary.expiringValue))} membership value`
                  : "Loading upcoming expiries…"}
            </em>
          </div>
        </Card>
        <Card className="overview-stat">
          <span className="managed-stat-icon green">
            <WalletCards />
          </span>
          <div>
            <small>Collected this month</small>
            <strong>{summary ? overviewMoney.format(Number(summary.totalCollected)) : "—"}</strong>
            <em className={Number(summary?.totalCollectedChange ?? 0) < 0 ? "bad" : "good"}>
              {summary ? collectedChange : "Loading collections…"}
            </em>
          </div>
        </Card>
        <Card className="overview-stat">
          <span className="managed-stat-icon blue">
            <ReceiptText />
          </span>
          <div>
            <small>Outstanding dues</small>
            <strong>
              {summary ? overviewMoney.format(Number(summary.outstandingAmount)) : "—"}
            </strong>
            <em>
              {summary
                ? `${summary.overdueMembers} overdue ${summary.overdueMembers === 1 ? "member" : "members"}`
                : "Loading outstanding dues…"}
            </em>
          </div>
        </Card>
      </section>

      <section className="overview-action-grid">
        <Card className="overview-expiring-card">
          <CardHeader className="overview-section-head">
            <div>
              <CardTitle>Memberships expiring soon</CardTitle>
              <CardDescription>Active memberships ending in the selected window.</CardDescription>
            </div>
            <div className="overview-window" aria-label="Expiry window">
              {([7, 14, 30] as OverviewWindow[]).map((window) => (
                <Button
                  key={window}
                  size="sm"
                  variant={days === window ? "secondary" : "ghost"}
                  aria-pressed={days === window}
                  onClick={() => setDays(window)}
                >
                  {window} days
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="overview-expiring-content" aria-busy={loading}>
            <div className="overview-expiry-table-head" aria-hidden>
              <span>Member</span>
              <span>Expires</span>
              <span>Payment position</span>
              <span />
            </div>
            {loading ? (
              <div className="overview-loading" role="status">
                <LoaderCircle />
                <span>Loading upcoming expiries…</span>
              </div>
            ) : data?.expiringMemberships.length ? (
              <div className="overview-expiry-list">
                {data.expiringMemberships.slice(0, 5).map((membership) => {
                  const overdue = Number(membership.overdueAmount) > 0;
                  const outstanding = Number(membership.outstandingAmount) > 0;
                  return (
                    <div className="overview-expiry-row" key={membership.id}>
                      <div className="overview-person">
                        <Avatar size="lg">
                          <AvatarFallback>
                            {memberInitials(membership.member.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          <strong>{membership.member.fullName}</strong>
                          <small>{membership.planName}</small>
                        </span>
                      </div>
                      <div className="overview-expiry-date">
                        <strong>{expiryLabel(data.today, membership.endsOn)}</strong>
                        <small>
                          {overviewDate.format(new Date(`${membership.endsOn}T00:00:00Z`))}
                        </small>
                      </div>
                      <div>
                        {overdue ? (
                          <Badge variant="destructive">
                            {overviewMoney.format(Number(membership.overdueAmount))} overdue
                          </Badge>
                        ) : outstanding ? (
                          <Badge variant="outline">
                            {overviewMoney.format(Number(membership.outstandingAmount))} outstanding
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Check />
                            Paid
                          </Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/members?member=${membership.member.id}`}>
                          View member
                          <ChevronRight />
                        </Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="overview-empty">
                <span className="managed-glyph green">
                  <Check />
                </span>
                <strong>No memberships expire in the next {days} days</strong>
                <p>You’re all caught up. Try a wider date range to look further ahead.</p>
              </div>
            )}
          </CardContent>
          <div className="overview-card-footer">
            <span>
              {loading
                ? "Updating upcoming expiries…"
                : summary
                  ? `${summary.expiringCount} upcoming ${summary.expiringCount === 1 ? "expiry" : "expiries"}`
                  : "Upcoming expiries"}
            </span>
            <Button variant="link" size="sm" asChild>
              <Link href="/members">
                View all members
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </Card>

        <Card className="overview-collection-card">
          <CardHeader>
            <CardTitle>Collection health</CardTitle>
            <CardDescription>This month against open membership dues.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overview-rate">
              <div>
                <strong>{summary ? `${summary.collectionRate}%` : "—"}</strong>
                <span>Collection rate</span>
              </div>
              <span className="overview-rate-icon">
                <TrendingUp />
              </span>
            </div>
            <div
              className="overview-progress"
              aria-label={`${summary?.collectionRate ?? 0}% collection rate`}
            >
              <i style={{ width: `${Math.min(Number(summary?.collectionRate ?? 0), 100)}%` }} />
            </div>
            <dl className="overview-collection-list">
              <div>
                <dt>Collected this month</dt>
                <dd>{summary ? overviewMoney.format(Number(summary.totalCollected)) : "—"}</dd>
              </div>
              <div>
                <dt>Outstanding</dt>
                <dd>{summary ? overviewMoney.format(Number(summary.outstandingAmount)) : "—"}</dd>
              </div>
              <div>
                <dt>Overdue now</dt>
                <dd className={Number(summary?.overdueAmount ?? 0) > 0 ? "bad" : ""}>
                  {summary ? overviewMoney.format(Number(summary.overdueAmount)) : "—"}
                </dd>
              </div>
              <div>
                <dt>Members overdue</dt>
                <dd>{summary?.overdueMembers ?? "—"}</dd>
              </div>
            </dl>
          </CardContent>
          <div className="overview-card-footer">
            <span>Updated with member balances</span>
            <Button variant="link" size="sm" asChild>
              <Link href="/payments">
                View payments
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </Card>
      </section>

      <Card className="overview-payments-card">
        <CardHeader className="overview-section-head">
          <div>
            <CardTitle>Recent payments</CardTitle>
            <CardDescription>
              The latest member transactions across payment methods.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/payments">
              View all payments
              <ArrowRight />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="overview-payment-list">
          {loading && !data ? (
            <div className="overview-loading">
              <LoaderCircle />
              <span>Loading recent payments…</span>
            </div>
          ) : data?.recentPayments.length ? (
            data.recentPayments.map((payment) => (
              <div className="overview-payment-row" key={payment.id}>
                <div className="overview-person">
                  <Avatar>
                    <AvatarFallback>{memberInitials(payment.member.fullName)}</AvatarFallback>
                  </Avatar>
                  <span>
                    <strong>{payment.member.fullName}</strong>
                    <small>{payment.membership?.planName ?? "Unallocated payment"}</small>
                  </span>
                </div>
                <span className="overview-payment-method">{payment.paymentMode}</span>
                <span className="overview-payment-date">
                  {overviewDate.format(new Date(`${payment.paidOn}T00:00:00Z`))}
                </span>
                <strong className="overview-payment-amount">
                  {overviewMoney.format(Number(payment.amount))}
                </strong>
                <Badge
                  variant={
                    payment.status === "SUCCEEDED"
                      ? "secondary"
                      : payment.status === "REFUNDED"
                        ? "outline"
                        : "destructive"
                  }
                >
                  {paymentStatus(payment.status)}
                </Badge>
              </div>
            ))
          ) : (
            <div className="overview-empty compact">
              <span className="managed-glyph purple">
                <IndianRupee />
              </span>
              <strong>No payments recorded yet</strong>
              <p>New member payments will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
