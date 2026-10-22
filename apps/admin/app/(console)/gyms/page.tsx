import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { StatePill, Tabs } from "@/components/ui";
import { gymState, progress, RUNGS, STATE_LABELS, type GymState } from "@/lib/derive";
import { ago, inr, int, plural, shortDate } from "@/lib/format";
import { loadSnapshot } from "@/lib/load";

export const metadata: Metadata = { title: "Gyms" };

const VIEWS: { key: "all" | GymState; label: string }[] = [
  { key: "all", label: "All" },
  { key: "onboarding", label: STATE_LABELS.onboarding },
  { key: "live", label: STATE_LABELS.live },
  { key: "quiet", label: STATE_LABELS.quiet },
  { key: "deactivated", label: STATE_LABELS.deactivated },
];

const WINDOW = 4;

export default async function GymsPage({ searchParams }: PageProps<"/gyms">) {
  const params = await searchParams;
  const view = VIEWS.find((item) => item.key === params.view)?.key ?? "all";
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const snapshot = await loadSnapshot();
  const { now } = snapshot;

  const all = snapshot.gyms.map((gym) => {
    const p = progress(gym, now);
    return {
      gym,
      p,
      state: gymState(p),
      // The same full-week window as the overview's payments figure.
      payments: gym.weekly.payments.slice(-1 - WINDOW, -1).reduce((a, b) => a + b, 0),
    };
  });
  const needle = q.toLowerCase();
  const matching = needle
    ? all.filter(({ gym }) => [gym.name, gym.owner?.name, gym.owner?.email].some((value) => value?.toLowerCase().includes(needle)))
    : all;
  const counts = Object.fromEntries(VIEWS.map((item) => [item.key, matching.filter((row) => item.key === "all" || row.state === item.key).length]));
  const rows = matching
    .filter((row) => view === "all" || row.state === view)
    .toSorted((a, b) => b.gym.createdAt.localeCompare(a.gym.createdAt));

  const onboarding = all.filter((row) => row.state === "onboarding").length;
  const quiet = all.filter((row) => row.state === "quiet").length;
  const query = (key: string) => {
    const search = new URLSearchParams();
    if (key !== "all") search.set("view", key);
    if (q) search.set("q", q);
    const text = search.toString();
    return text ? `/gyms?${text}` : "/gyms";
  };

  return (
    <>
      <div className="title-row">
        <div>
          <h1>Gyms</h1>
          <p className="sub">
            <strong>{plural(all.filter((row) => row.gym.isActive).length, "active gym")}</strong>: {int(onboarding)} still onboarding
            {quiet > 0 && <>, {int(quiet)} gone quiet</>}.
          </p>
        </div>
      </div>

      <Tabs items={VIEWS.map((item) => ({ href: query(item.key), label: item.label, count: counts[item.key], current: item.key === view }))} />

      <form className="toolbar" action="/gyms" role="search">
        {view !== "all" && <input type="hidden" name="view" value={view} />}
        <span className="search-inline">
          <Search aria-hidden="true" />
          <label className="sr-only" htmlFor="gym-search">Search gyms</label>
          <input id="gym-search" name="q" type="search" defaultValue={q} placeholder="Gym, owner or email" />
        </span>
        {q && <Link href={view === "all" ? "/gyms" : `/gyms?view=${view}`} className="btn ghost small">Clear</Link>}
        <span className="total num">{plural(rows.length, "gym")} · newest first</span>
      </form>

      <div className="table-wrap">
        <table className="responsive">
          <thead>
            <tr>
              <th>Gym</th>
              <th>State</th>
              <th className="n">Active members</th>
              <th className="n">Team seats</th>
              <th className="n">Payments, 4 full weeks</th>
              <th className="n">Last activity</th>
              <th className="n">Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-cell">
                  <p className="empty">{q ? `No gyms match “${q}”.` : "No gyms in this view."}</p>
                </td>
              </tr>
            )}
            {rows.map(({ gym, p, state, payments }) => {
              const rung = RUNGS.find((item) => item.key === p.waitingOn);
              const seatsUsed = gym.teamActive + gym.teamPending;
              return (
                <tr key={gym.id}>
                  <td className="identity">
                    <Link href={`/gyms/${gym.id}`}>{gym.name}</Link>
                    <span className="sub">{gym.owner ? `${gym.owner.name} · ${gym.owner.email}` : "No owner"}</span>
                  </td>
                  <td className="line2">
                    <StatePill state={state} />
                    {state === "onboarding" && rung && <span className="sub">{rung.waiting} · {p.waitingDays} d</span>}
                  </td>
                  <td className="n key num">{gym.membersActive > 0 ? int(gym.membersActive) : <span className="grey">0</span>}</td>
                  <td className="n line2 num">
                    {seatsUsed}<span className="grey"> / {gym.seatLimit}</span>
                  </td>
                  <td className="n line2 num">{payments > 0 ? inr(payments) : <span className="grey">₹0</span>}</td>
                  <td className="n line2 num">{ago(gym.lastActivityAt, now) ?? <span className="grey">—</span>}</td>
                  <td className="n line2 num">{shortDate(gym.createdAt, now)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
