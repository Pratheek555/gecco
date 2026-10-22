import type { Metadata } from "next";
import Link from "next/link";
import { Chart } from "@/components/chart";
import { NewLinkButton } from "@/components/link-dialogs";
import { OverviewRefresh } from "@/components/overview-refresh";
import { Change, Kpis } from "@/components/ui";
import { addWeekly, attention, gymState, isOwner, ladder, lastWeeks, progress, STUCK_AFTER_DAYS } from "@/lib/derive";
import { ago, inr, int, plural, weekLabel } from "@/lib/format";
import { loadSnapshot } from "@/lib/load";

export const metadata: Metadata = { title: "Overview" };

const CHART_WEEKS = 12;
const WINDOW = 4;
const CHIPS_PER_RUNG = 5;

export default async function OverviewPage() {
  const snapshot = await loadSnapshot();
  const { now, weekStarts } = snapshot;

  const active = snapshot.gyms.filter((gym) => gym.isActive);
  const states = active.map((gym) => gymState(progress(gym, now)));
  const live = states.filter((state) => state === "live").length;
  const recent = lastWeeks(snapshot, WINDOW);
  const membersUnderManagement = active.reduce((total, gym) => total + gym.membersActive, 0);
  const ladderData = ladder(snapshot);
  const needs = attention(snapshot);
  const stuck = needs.filter((item) => item.id.startsWith("stuck-"));
  const expiring = needs.filter((item) => item.id.startsWith("link-"));

  // The weekly chart and the KPI share their buckets: the KPI is the sum of the last four bars.
  const weekly = addWeekly(snapshot.gyms, "payments", weekStarts.length).slice(-CHART_WEEKS);
  const labels = weekStarts.slice(-CHART_WEEKS).map(weekLabel);
  const chartStart = weekStarts[weekStarts.length - CHART_WEEKS];
  // Name the newest gym that started recording payments in view: the step it adds is the one people ask about.
  const firstPayments = active
    .filter((gym) => gym.firstPaymentAt && gym.firstPaymentAt >= chartStart)
    .map((gym) => ({ gym, at: weekStarts.slice(-CHART_WEEKS).findLastIndex((start) => gym.firstPaymentAt! >= start) }));

  const top = snapshot.gyms
    .map((gym) => ({ gym, value: gym.weekly.payments.slice(-1 - WINDOW, -1).reduce((a, b) => a + b, 0) }))
    .filter((row) => row.value > 0)
    .toSorted((a, b) => b.value - a.value);
  console.assert(top.reduce((total, row) => total + row.value, 0) === recent.payments, "Top gyms must sum to the payments KPI");

  const newest = snapshot.accounts.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const ownersNew = recent.accounts.filter(isOwner).length;

  const finding = [
    stuck.length > 0 && (
      <span key="stuck">
        <strong>{plural(stuck.length, "gym")}</strong> {stuck.length === 1 ? "has" : "have"} waited more than {STUCK_AFTER_DAYS} days on a step
      </span>
    ),
    expiring.length > 0 && (
      <span key="expiring">
        <strong>{expiring[0].title}</strong>&apos;s signup link {expiring[0].detail.replace("Signup link ", "")}
      </span>
    ),
  ].filter(Boolean);

  return (
    <>
      <div className="title-row">
        <div>
          <h1>Overview</h1>
          <p className="sub">
            {finding.length === 0 ? (
              snapshot.gyms.length === 0
                ? "Invite your first gym to start tracking onboarding and activity."
                : "Every gym is moving: nobody has waited more than a week on a step."
            ) : (
              <>
                {finding[0]}
                {finding[1] && <>, and {finding[1]}</>}.
              </>
            )}
          </p>
        </div>
        <div className="title-actions">
          <OverviewRefresh live={snapshot.source === "database"} />
          <NewLinkButton />
        </div>
      </div>

      <div className="with-rail">
        <div className="stack">
          <Kpis
            items={[
              { label: "Live this week", value: int(live), unit: `/ ${int(active.length)} gyms`, caption: <>Recorded something in the last 7 days</> },
              {
                label: "Active members",
                value: int(membersUnderManagement),
                caption: <>{recent.membersAdded > 0 ? `+${int(recent.membersAdded)}` : "None"} added in the last 4 full weeks</>,
              },
              {
                label: "Payments recorded",
                value: inr(recent.payments),
                caption: <>Last 4 full weeks · <Change now={recent.payments} before={recent.paymentsPrior} window="the 4 before" format={inr} /></>,
              },
              {
                label: "New accounts",
                value: int(recent.accounts.length),
                caption: <>Last 4 full weeks · {plural(ownersNew, "owner")}, {int(recent.accounts.length - ownersNew)} team</>,
              },
            ]}
          />

          <section className="panel" aria-labelledby="ladder-title">
            <div className="panel-head">
              <h2 id="ladder-title">Activation ladder</h2>
              <span className="meta">
                {plural(active.length, "gym")} and {plural(ladderData.rungs[0].waiting.length, "link")} out · longest wait first
              </span>
            </div>
            <ol className="ladder">
              {ladderData.rungs.map((rung) => {
                const share = ladderData.total ? rung.reached / ladderData.total : 0;
                const shown = rung.waiting.slice(0, CHIPS_PER_RUNG);
                return (
                  <li key={rung.key} className="rung">
                    <span className="rung-name">{rung.label}</span>
                    <div className="rung-count">
                      <span className="figure">
                        <strong>{int(rung.reached)}</strong> of {int(ladderData.total)}
                      </span>
                      <span className="rung-track" aria-hidden="true">
                        <i style={{ width: `${share * 100}%` }} />
                      </span>
                    </div>
                    <div className="waiting">
                      {rung.key === "live" ? (
                        <span className="none">The top rung: {plural(rung.reached, "gym")} recorded something this week</span>
                      ) : shown.length === 0 ? (
                        <span className="none">Nobody waiting here</span>
                      ) : (
                        <>
                          {shown.map((item) => (
                            <Link
                              key={item.id}
                              href={item.href ?? "#"}
                              className={`chip${item.days > STUCK_AFTER_DAYS ? " stuck" : ""}`}
                              title={`${item.name}: ${item.days} days on this rung`}
                            >
                              <span>{item.name}</span>
                              <small className="num">{item.days} d</small>
                            </Link>
                          ))}
                          {rung.waiting.length > shown.length && (
                            <Link href="/gyms?view=onboarding" className="chip more">+{rung.waiting.length - shown.length} more</Link>
                          )}
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="panel-note">
              Each gym sits on the last rung it reached; chips are the gyms waiting to climb past it, with days on that
              rung. Amber after {STUCK_AFTER_DAYS} days.
            </p>
          </section>

          <section className="panel" aria-labelledby="payments-title">
            <div className="panel-head">
              <h2 id="payments-title">Payments recorded per week, all gyms</h2>
              <span className="meta">Last {CHART_WEEKS} weeks · this week so far in pale</span>
            </div>
            <Chart
              label={`Payments recorded per week across all gyms, last ${CHART_WEEKS} weeks`}
              spec={{
                kind: "bars",
                labels,
                values: weekly,
                format: "inr",
                dim: [weekly.length - 1],
                height: 210,
                annotations: firstPayments
                  .toSorted((a, b) => a.at - b.at)
                  .slice(-1)
                  .map(({ gym, at }) => ({ at, label: `${gym.name} starts recording`, short: gym.name.split(" ")[0] })),
              }}
            />
          </section>
        </div>

        <aside className="stack rail-columns" aria-label="Follow-ups">
          <section className="rail-block" aria-labelledby="attention-title">
            <h2 id="attention-title">Needs attention</h2>
            <div className="list">
              {needs.length === 0 ? (
                <div className="list-row"><span className="muted">Nothing needs a call today.</span></div>
              ) : (
                needs.slice(0, 5).map((item) => (
                  <Link key={item.id} href={item.href} className="list-row">
                    <span className="main">
                      <strong>{item.title}</strong>
                      <small>{item.detail}</small>
                    </span>
                    <span className="end action">{item.action}</span>
                  </Link>
                ))
              )}
              {needs.length > 5 && (
                <div className="list-foot">
                  <Link href="/gyms?view=onboarding" className="btn view-all">View all {needs.length}</Link>
                </div>
              )}
            </div>
          </section>

          <section className="rail-block" aria-labelledby="top-title">
            <h2 id="top-title">Most recorded, 4 full weeks</h2>
            <div className="list">
              {top.length === 0 && <div className="list-row"><span className="muted">No payments recorded in the last 4 full weeks.</span></div>}
              <ol className="ranked">
                {top.slice(0, 5).map(({ gym, value }) => (
                  <li key={gym.id}>
                    <span className="line">
                      <Link href={`/gyms/${gym.id}`}>{gym.name}</Link>
                      <span className="num">{inr(value)}</span>
                    </span>
                    <span className="bar" style={{ width: `${(value / top[0].value) * 100}%` }} aria-hidden="true" />
                  </li>
                ))}
              </ol>
              {top.length > 5 && (
                <div className="list-foot">
                  <Link href="/gyms" className="btn view-all">All {plural(top.length, "gym")} recording</Link>
                </div>
              )}
            </div>
          </section>

          <section className="rail-block" aria-labelledby="accounts-title">
            <h2 id="accounts-title">Newest accounts</h2>
            <div className="list">
              {newest.length === 0 && <div className="list-row"><span className="muted">New owner and team accounts will appear here.</span></div>}
              {newest.map((account) => {
                const role = account.roles[0];
                return (
                  <div key={account.id} className="list-row">
                    <span className="main">
                      <strong>{account.name}</strong>
                      <small>
                        {role ? `${role.role === "OWNER" ? "Owner" : role.role === "TRAINER" ? "Trainer" : "Staff"} · ${role.gymName}` : "No gym"}
                      </small>
                    </span>
                    <span className="end">{ago(account.createdAt, now)}</span>
                  </div>
                );
              })}
              <div className="list-foot">
                <Link href="/accounts" className="btn view-all">View all {int(snapshot.accounts.length)}</Link>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
