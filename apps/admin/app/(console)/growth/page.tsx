import type { Metadata } from "next";
import Link from "next/link";
import { Chart, type FormatKey } from "@/components/chart";
import { Kpis } from "@/components/ui";
import { addWeekly, bucket, series, type Series } from "@/lib/derive";
import { inr, int, shortDate, weekLabel } from "@/lib/format";
import { loadSnapshot } from "@/lib/load";

export const metadata: Metadata = { title: "Growth" };

const RANGES = [12, 26, 52] as const;

function Pair({ id, perWeekTitle, runningTitle, data, format, note }: { id: string; perWeekTitle: string; runningTitle: string; data: Series; format: FormatKey; note?: string }) {
  const labels = data.labels.map(weekLabel);
  return (
    <div className="pair" role="group" aria-labelledby={`${id}-a`}>
      <section className="panel">
        <div className="panel-head">
          <h2 id={`${id}-a`}>{perWeekTitle}</h2>
          <span className="meta">Per week · this week in pale</span>
        </div>
        <Chart className="chart short" label={perWeekTitle} spec={{ kind: "bars", labels, values: data.perWeek, format, dim: [labels.length - 1], height: 180 }} />
      </section>
      <section className="panel">
        <div className="panel-head">
          <h2>{runningTitle}</h2>
          <span className="meta">{note ?? "Running total"}</span>
        </div>
        <Chart className="chart short" label={runningTitle} spec={{ kind: "line", labels, series: [{ name: runningTitle, values: data.running }], format, endLabel: true, height: 180 }} />
      </section>
    </div>
  );
}

export default async function GrowthPage({ searchParams }: PageProps<"/growth">) {
  const { range: rawRange } = await searchParams;
  const weeks = RANGES.find((value) => String(value) === rawRange) ?? 26;
  const snapshot = await loadSnapshot();
  const { weekStarts, now } = snapshot;
  const start = weekStarts[weekStarts.length - weeks];

  // Running totals start from what existed before the window, so the line ends on today's real total.
  const gymBuckets = bucket(weekStarts, snapshot.gyms.map((gym) => gym.createdAt));
  const accountBuckets = bucket(weekStarts, snapshot.accounts.map((account) => account.createdAt));
  const sumFrom = (values: number[], from: number) => values.slice(from).reduce((a, b) => a + b, 0);
  const from = weekStarts.length - weeks;

  const gyms = series(weekStarts, gymBuckets.counts, weeks, snapshot.gyms.length - sumFrom(gymBuckets.counts, from));
  const accounts = series(weekStarts, accountBuckets.counts, weeks, snapshot.accounts.length - sumFrom(accountBuckets.counts, from));
  const memberWeeks = addWeekly(snapshot.gyms, "members", weekStarts.length);
  const membersTotal = snapshot.gyms.reduce((total, gym) => total + gym.membersTotal, 0);
  const members = series(weekStarts, memberWeeks, weeks, membersTotal - sumFrom(memberWeeks, from));
  const payments = series(weekStarts, addWeekly(snapshot.gyms, "payments", weekStarts.length), weeks, 0);

  const added = (s: Series) => s.perWeek.reduce((a, b) => a + b, 0);
  console.assert(gyms.running.at(-1) === snapshot.gyms.length, "Gym running total must end on the gym count");
  console.assert(accounts.running.at(-1) === snapshot.accounts.length, "Account running total must end on the account count");
  const since = shortDate(start, now);

  return (
    <>
      <div className="title-row">
        <div>
          <h1>Growth</h1>
          <p className="sub">
            Since {since}, Gecco added <strong>{int(added(gyms))} gyms</strong>, <strong>{int(added(accounts))} accounts</strong> and{" "}
            <strong>{int(added(members))} members</strong>.
          </p>
        </div>
        <div className="title-actions">
          <nav className="segmented" aria-label="Range">
            {RANGES.map((value) => (
              <Link key={value} href={value === 26 ? "/growth" : `/growth?range=${value}`} aria-current={value === weeks ? "page" : undefined}>
                {value} weeks
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="stack">
        <Kpis
          items={[
            { label: "Gyms joined", value: `+${int(added(gyms))}`, caption: `${int(snapshot.gyms.length)} on Gecco now` },
            { label: "Accounts created", value: `+${int(added(accounts))}`, caption: `${int(snapshot.accounts.length)} in total` },
            { label: "Members added", value: `+${int(added(members))}`, caption: `${int(membersTotal)} on record across gyms` },
            { label: "Payments recorded", value: inr(added(payments)), caption: `Since ${since}, this week so far included` },
          ]}
        />
        <Pair id="gyms" perWeekTitle="Gyms joined" runningTitle="Gyms on Gecco" data={gyms} format="int" note="Running total, deactivated included" />
        <Pair id="accounts" perWeekTitle="Accounts created" runningTitle="Accounts" data={accounts} format="int" />
        <Pair id="members" perWeekTitle="Members added" runningTitle="Members on record" data={members} format="int" />
        <Pair id="payments" perWeekTitle="Payments recorded" runningTitle={`Recorded since ${since}`} data={payments} format="inr" note="Running total in this range" />
      </div>
    </>
  );
}
