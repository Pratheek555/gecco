import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Change, Kpis, Tabs } from "@/components/ui";
import { NewLinkButton } from "@/components/link-dialogs";
import { isOwner, lastWeeks } from "@/lib/derive";
import { ago, daysBetween, int, plural, shortDate } from "@/lib/format";
import { loadSnapshot } from "@/lib/load";
import type { AccountRow, Role } from "@/lib/snapshot";

export const metadata: Metadata = { title: "Accounts" };

const VIEWS: { key: "all" | Role; label: string }[] = [
  { key: "all", label: "Everyone" },
  { key: "OWNER", label: "Owners" },
  { key: "TRAINER", label: "Trainers" },
  { key: "STAFF", label: "Front desk & staff" },
];
const ROLE_LABEL: Record<Role, string> = { OWNER: "Owner", TRAINER: "Trainer", STAFF: "Staff" };
const PAGE = 50;

const hasRole = (account: AccountRow, role: Role) => account.roles.some((item) => item.role === role);

export default async function AccountsPage({ searchParams }: PageProps<"/accounts">) {
  const params = await searchParams;
  const view = VIEWS.find((item) => item.key === params.view)?.key ?? "all";
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const shown = Math.max(PAGE, Number(params.show) || PAGE);
  const snapshot = await loadSnapshot();
  const { now } = snapshot;

  const needle = q.toLowerCase();
  const matching = needle
    ? snapshot.accounts.filter((account) =>
        [account.name, account.email, ...account.roles.map((role) => role.gymName)].some((value) => value.toLowerCase().includes(needle)),
      )
    : snapshot.accounts;
  const counts = Object.fromEntries(VIEWS.map((item) => [item.key, item.key === "all" ? matching.length : matching.filter((a) => hasRole(a, item.key as Role)).length]));
  const rows = matching
    .filter((account) => view === "all" || hasRole(account, view))
    .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt));

  const total = snapshot.accounts.length;
  const owners = snapshot.accounts.filter(isOwner).length;
  const recent = lastWeeks(snapshot, 4);
  const thisWeek = snapshot.accounts.filter((a) => a.lastSignInAt && daysBetween(a.lastSignInAt, now) < 7).length;
  const today = snapshot.accounts.filter((a) => a.lastSignInAt && daysBetween(a.lastSignInAt, now) < 1).length;
  const lapsed = snapshot.accounts.filter((a) => !a.lastSignInAt || daysBetween(a.lastSignInAt, now) >= 30).length;

  const query = (next: { view?: string; show?: number }) => {
    const search = new URLSearchParams();
    const v = next.view ?? view;
    if (v !== "all") search.set("view", v);
    if (q) search.set("q", q);
    if (next.show) search.set("show", String(next.show));
    const text = search.toString();
    return text ? `/accounts?${text}` : "/accounts";
  };

  return (
    <>
      <div className="title-row">
        <div>
          <h1>Accounts</h1>
          <p className="sub">
            <strong>{plural(total, "person", "people")}</strong> have Gecco accounts; <strong>{int(today)}</strong> signed in within the last 24 hours.
          </p>
        </div>
        <div className="title-actions"><NewLinkButton /></div>
      </div>

      <div className="stack">
        <Kpis
          items={[
            { label: "Accounts", value: int(total), caption: `${plural(owners, "owner")}, ${int(total - owners)} team` },
            {
              label: "Created",
              value: int(recent.accounts.length),
              caption: <>Last 4 full weeks · <Change now={recent.accounts.length} before={recent.accountsPrior} window="the 4 before" /></>,
            },
            { label: "Signed in this week", value: int(thisWeek), unit: `/ ${int(total)}`, caption: "In the last 7 days" },
            { label: "Away 30 days or more", value: int(lapsed), caption: lapsed ? "No sign-in for a month" : "Everyone signed in this month" },
          ]}
        />

        <div>
          <Tabs items={VIEWS.map((item) => ({ href: query({ view: item.key }), label: item.label, count: counts[item.key], current: item.key === view }))} />
          <form className="toolbar" action="/accounts" role="search">
            {view !== "all" && <input type="hidden" name="view" value={view} />}
            <span className="search-inline">
              <Search aria-hidden="true" />
              <label className="sr-only" htmlFor="account-search">Search accounts</label>
              <input id="account-search" name="q" type="search" defaultValue={q} placeholder="Name, email or gym" />
            </span>
            {q && <Link href={view === "all" ? "/accounts" : `/accounts?view=${view}`} className="btn ghost small">Clear</Link>}
            <span className="total num">{plural(rows.length, "account")} · newest first</span>
          </form>

          <div className="table-wrap">
            <table className="responsive">
              <thead>
                <tr>
                  <th>Person</th>
                  <th>Gym and role</th>
                  <th className="n">Created</th>
                  <th className="n">Last sign-in</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty-cell">
                      <p className="empty">{q ? `Nobody matches “${q}”.` : "No accounts in this view."}</p>
                    </td>
                  </tr>
                )}
                {rows.slice(0, shown).map((account) => {
                  const [first, ...others] = account.roles;
                  const away = !account.lastSignInAt || daysBetween(account.lastSignInAt, now) >= 30;
                  return (
                    <tr key={account.id}>
                      <td className="identity">
                        <strong style={{ fontWeight: 500 }}>{account.name}</strong>
                        <span className="sub">{account.email}</span>
                      </td>
                      <td className="line2">
                        {first ? <Link href={`/gyms/${first.gymId}`}>{first.gymName}</Link> : <span className="grey">No gym</span>}
                        <span className="sub">
                          {first ? `${ROLE_LABEL[first.role]}${first.isActive ? "" : ", removed"}` : "—"}
                          {others.length > 0 && ` · and ${plural(others.length, "other gym")}`}
                        </span>
                      </td>
                      <td className="n line2 num">{shortDate(account.createdAt, now)}</td>
                      <td className="n key num">
                        {account.lastSignInAt ? (away ? <span className="pill">{ago(account.lastSignInAt, now)}</span> : ago(account.lastSignInAt, now)) : <span className="grey">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="table-foot">
            <span className="num">{rows.length ? `1–${int(Math.min(shown, rows.length))} of ${int(rows.length)}` : "0 of 0"}</span>
            {rows.length > shown ? <Link href={query({ show: shown + PAGE })} className="btn small">Show {PAGE} more</Link> : <span>Last sign-in is the latest open session.</span>}
          </div>
        </div>
      </div>
    </>
  );
}
