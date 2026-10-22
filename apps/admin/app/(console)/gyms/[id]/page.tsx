import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Chart } from "@/components/chart";
import { GymActiveButton, SeatLimitForm } from "@/components/gym-controls";
import { Change, Kpis, StatePill } from "@/components/ui";
import { gymState, progress, RUNGS, series } from "@/lib/derive";
import { ago, inr, int, plural, shortDate, weekLabel } from "@/lib/format";
import { loadSnapshot } from "@/lib/load";

const CHART_WEEKS = 12;
const WINDOW = 4;

async function findGym(id: string) {
  const snapshot = await loadSnapshot();
  return { snapshot, gym: snapshot.gyms.find((item) => item.id === id) };
}

export async function generateMetadata({ params }: PageProps<"/gyms/[id]">): Promise<Metadata> {
  const { gym } = await findGym((await params).id);
  return { title: gym?.name ?? "Gym" };
}

const ROLE_LABEL = { OWNER: "Owner", TRAINER: "Trainer", STAFF: "Staff" } as const;

export default async function GymPage({ params }: PageProps<"/gyms/[id]">) {
  const { snapshot, gym } = await findGym((await params).id);
  if (!gym) notFound();
  const { now, weekStarts } = snapshot;

  const p = progress(gym, now);
  const state = gymState(p);
  const rung = RUNGS.find((item) => item.key === p.waitingOn);
  const full = (values: number[], from: number, to: number) => values.slice(from, to).reduce((a, b) => a + b, 0);
  const n = weekStarts.length;
  const payments = full(gym.weekly.payments, n - 1 - WINDOW, n - 1);
  const paymentsPrior = full(gym.weekly.payments, n - 1 - WINDOW * 2, n - 1 - WINDOW);
  const membersAdded = full(gym.weekly.members, n - 1 - WINDOW, n - 1);
  const seatsUsed = gym.teamActive + gym.teamPending;

  const labels = weekStarts.slice(-CHART_WEEKS).map(weekLabel);
  const memberSeries = series(weekStarts, gym.weekly.members, CHART_WEEKS, gym.membersTotal - full(gym.weekly.members, n - CHART_WEEKS, n));
  const people = snapshot.accounts
    .flatMap((account) => account.roles.filter((role) => role.gymId === gym.id).map((role) => ({ account, role })))
    .toSorted((a, b) => (a.role.role === "OWNER" ? -1 : b.role.role === "OWNER" ? 1 : a.account.createdAt.localeCompare(b.account.createdAt)));

  const steps = [
    gym.signupLink && { label: "Signup link issued", detail: `By ${gym.signupLink.createdBy}`, at: gym.signupLink.createdAt },
    { label: "Signed up", detail: gym.owner ? `${gym.owner.name} created the workspace` : "Workspace created", at: gym.createdAt },
    { label: "First member added", detail: gym.firstMemberAt ? `${int(gym.membersTotal)} on record now` : "No members yet", at: gym.firstMemberAt },
    { label: "First payment recorded", detail: gym.firstPaymentAt ? `${inr(payments)} in the last 4 full weeks` : "No payment recorded yet", at: gym.firstPaymentAt },
    { label: "Team invited", detail: gym.firstTeamAt ? `${plural(gym.teamActive, "person", "people")} on the team` : "The owner is working alone", at: gym.firstTeamAt },
    { label: "Latest activity", detail: "A payment, a member or a sign-in", at: gym.lastActivityAt },
  ].filter((step): step is { label: string; detail: string; at: string | null } => Boolean(step));

  const status =
    state === "deactivated"
      ? "Deactivated: nobody at this gym can sign in. Their data is kept."
      : state === "live"
        ? `Live: last recorded something ${ago(gym.lastActivityAt, now)?.toLowerCase()}.`
        : `${rung?.waiting ?? "Waiting"} for ${plural(p.waitingDays, "day")}.`;

  return (
    <>
      <div className="title-row">
        <div>
          <div className="crumb">
            <Link href="/gyms">Gyms</Link>
            <span className="sep" aria-hidden="true">/</span>
            <h1 style={{ font: "inherit" }}>{gym.name}</h1>
            <StatePill state={state} />
          </div>
          <p className="sub">{status}</p>
        </div>
        <div className="title-actions">
          <GymActiveButton gymId={gym.id} name={gym.name} isActive={gym.isActive} />
        </div>
      </div>

      <div className="stack">
        <Kpis
          items={[
            {
              label: "Active members",
              value: int(gym.membersActive),
              caption: <>{membersAdded > 0 ? `+${int(membersAdded)}` : "None"} added in the last 4 full weeks</>,
            },
            {
              label: "Payments recorded",
              value: inr(payments),
              caption: <>Last 4 full weeks · <Change now={payments} before={paymentsPrior} window="the 4 before" format={inr} /></>,
            },
            {
              label: "Team seats",
              value: int(seatsUsed),
              unit: `/ ${gym.seatLimit}`,
              caption: <>{int(gym.teamActive)} active{gym.teamPending > 0 && <>, {int(gym.teamPending)} invite pending</>}{seatsUsed >= gym.seatLimit && " · full"}</>,
            },
          ]}
        />

        <div className="pair">
          <section className="panel" aria-labelledby="gym-payments">
            <div className="panel-head">
              <h2 id="gym-payments">Payments recorded per week</h2>
              <span className="meta">Last {CHART_WEEKS} weeks · this week in pale</span>
            </div>
            <Chart
              className="chart short"
              label={`Payments recorded per week at ${gym.name}`}
              spec={{ kind: "bars", labels, values: gym.weekly.payments.slice(-CHART_WEEKS), format: "inr", dim: [CHART_WEEKS - 1], height: 180 }}
            />
          </section>
          <section className="panel" aria-labelledby="gym-members">
            <div className="panel-head">
              <h2 id="gym-members">Members on record</h2>
              <span className="meta">Running total, last {CHART_WEEKS} weeks</span>
            </div>
            <Chart
              className="chart short"
              label={`Members on record at ${gym.name}`}
              spec={{ kind: "line", labels, series: [{ name: "Members", values: memberSeries.running }], format: "int", endLabel: true, height: 180 }}
            />
          </section>
        </div>

        <div className="pair">
          <section className="panel" aria-labelledby="gym-steps">
            <div className="panel-head">
              <h2 id="gym-steps">Activation</h2>
              <span className="meta">Oldest first</span>
            </div>
            <ol className="steps">
              {steps.map((step) => (
                <li key={step.label} className={`step${step.at ? "" : " open"}`}>
                  <span className="dot" aria-hidden="true" />
                  <span>
                    <strong>{step.label}</strong>
                    <small>{step.detail}</small>
                  </span>
                  <span className="when num">{step.at ? shortDate(step.at, now) : "—"}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="panel" aria-labelledby="gym-people">
            <div className="panel-head">
              <h2 id="gym-people">People</h2>
              <span className="meta">{plural(people.length, "login")}</span>
            </div>
            <div className="rows">
              {people.map(({ account, role }) => (
                <div key={account.id} className="list-row" style={{ padding: "8px 0" }}>
                  <span className="main">
                    <strong>{account.name}</strong>
                    <small>{ROLE_LABEL[role.role]}{role.isActive ? "" : " · removed"} · {account.email}</small>
                  </span>
                  <span className="end">{account.lastSignInAt ? `Signed in ${ago(account.lastSignInAt, now)?.toLowerCase()}` : "Never signed in"}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="pair">
          <section className="panel" aria-labelledby="gym-details">
            <div className="panel-head">
              <h2 id="gym-details">Details</h2>
            </div>
            <dl className="kv">
              <div><dt>Gym ID</dt><dd className="mono">{gym.id.slice(0, 8)}…</dd></div>
              <div><dt>Owner</dt><dd>{gym.owner?.email ?? "—"}</dd></div>
              <div><dt>Timezone</dt><dd>{gym.timezone}</dd></div>
              <div><dt>Joined</dt><dd className="num">{shortDate(gym.createdAt, now)}</dd></div>
              <div><dt>Came through</dt><dd>{gym.signupLink ? `Signup link from ${gym.signupLink.createdBy}` : "Open signup, before links"}</dd></div>
            </dl>
          </section>
          <section className="panel" aria-labelledby="gym-access">
            <div className="panel-head">
              <h2 id="gym-access">Seats</h2>
            </div>
            <div className="usage" style={{ marginBottom: 20 }}>
              <span className="usage-track" aria-hidden="true">
                <i className={seatsUsed >= gym.seatLimit ? "full" : undefined} style={{ width: `${gym.seatLimit ? Math.min(seatsUsed / gym.seatLimit, 1) * 100 : 0}%` }} />
              </span>
              <span className="usage-ends num"><span>{int(seatsUsed)} in use</span><span>{int(gym.seatLimit)} seats</span></span>
            </div>
            <SeatLimitForm gymId={gym.id} seatLimit={gym.seatLimit} used={seatsUsed} />
          </section>
        </div>
      </div>
    </>
  );
}
