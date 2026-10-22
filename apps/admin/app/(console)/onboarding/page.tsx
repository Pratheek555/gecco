import type { Metadata } from "next";
import Link from "next/link";
import { LinkRowActions, NewLinkButton } from "@/components/link-dialogs";
import { Kpis, Tabs } from "@/components/ui";
import { lastWeeks, linkStatus, median } from "@/lib/derive";
import { daysBetween, int, plural, shortDate } from "@/lib/format";
import { loadSnapshot } from "@/lib/load";
import type { LinkRow } from "@/lib/snapshot";

export const metadata: Metadata = { title: "Onboarding" };

const VIEWS = [
  { key: "waiting", label: "Waiting" },
  { key: "signed-up", label: "Signed up" },
  { key: "expired", label: "Expired" },
  { key: "revoked", label: "Revoked" },
] as const;
type View = (typeof VIEWS)[number]["key"];

function Who({ link }: { link: LinkRow }) {
  const name = link.gym?.name ?? link.gymName;
  return (
    <>
      {link.gym ? <Link href={`/gyms/${link.gym.id}`}>{name}</Link> : <strong style={{ fontWeight: 500 }}>{name ?? "Unnamed gym"}</strong>}
      <span className="sub">{link.note ?? (link.email ? `Locked to ${link.email}` : "Anyone with the link")}</span>
    </>
  );
}

export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  const { view: rawView } = await searchParams;
  const view: View = VIEWS.some((item) => item.key === rawView) ? (rawView as View) : "waiting";
  const snapshot = await loadSnapshot();
  const { now } = snapshot;

  const byStatus = (status: View) => snapshot.links.filter((link) => linkStatus(link, now) === status);
  const groups = Object.fromEntries(VIEWS.map((item) => [item.key, byStatus(item.key)])) as Record<View, LinkRow[]>;
  const rows = groups[view].toSorted((a, b) =>
    view === "waiting" ? a.expiresAt.localeCompare(b.expiresAt) : (b.usedAt ?? b.createdAt).localeCompare(a.usedAt ?? a.createdAt),
  );

  const signupDays = groups["signed-up"].map((link) => daysBetween(link.createdAt, link.usedAt!));
  const medianDays = median(signupDays);
  const window = lastWeeks(snapshot, 4);
  const recentSignups = groups["signed-up"].filter((link) => link.usedAt! >= window.since && link.usedAt! < window.until).length;
  const oldestWaiting = groups.waiting.reduce<number | null>((max, link) => Math.max(max ?? 0, daysBetween(link.createdAt, now)), null);
  const expiringSoon = groups.waiting.filter((link) => daysBetween(now, link.expiresAt) <= 3);

  return (
    <>
      <div className="title-row">
        <div>
          <h1>Onboarding</h1>
          <p className="sub">
            {groups.waiting.length === 0 ? (
              "No signup links are out. Create one when a gym is ready to start."
            ) : (
              <>
                <strong>{plural(groups.waiting.length, "link")}</strong> waiting for an owner
                {expiringSoon.length > 0 && (
                  <>; <strong>{plural(expiringSoon.length, "expires", "expire")}</strong> within 3 days</>
                )}
                .
              </>
            )}
          </p>
        </div>
        <div className="title-actions">
          <NewLinkButton />
        </div>
      </div>

      <div className="stack">
        <Kpis
          items={[
            { label: "Waiting", value: int(groups.waiting.length), caption: oldestWaiting === null ? "No links out" : `Oldest sent ${plural(oldestWaiting, "day")} ago` },
            { label: "Signed up", value: int(groups["signed-up"].length), caption: `${int(recentSignups)} in the last 4 full weeks` },
            { label: "Expired unused", value: int(groups.expired.length), caption: groups.expired.length ? "Reissue one to try again" : "None so far" },
            {
              label: "Link to signup",
              value: medianDays === null ? "—" : int(Math.round(medianDays)),
              unit: medianDays === null ? undefined : medianDays === 1 ? "day" : "days",
              caption: signupDays.length ? `Median of ${plural(signupDays.length, "signup")}` : "No signups yet",
            },
          ]}
        />

        <div>
          <Tabs
            items={VIEWS.map((item) => ({
              href: item.key === "waiting" ? "/onboarding" : `/onboarding?view=${item.key}`,
              label: item.label,
              count: groups[item.key].length,
              current: item.key === view,
            }))}
          />
          <div className="table-wrap">
            <table className="responsive">
              <thead>
                <tr>
                  <th>Gym</th>
                  <th>Owner email</th>
                  <th className="n">Seats</th>
                  <th>Issued by</th>
                  <th className="n">{view === "waiting" ? "Expires" : view === "signed-up" ? "Signed up" : view === "expired" ? "Expired" : "Revoked"}</th>
                  {view !== "revoked" && <th className="n"><span className="sr-only">Actions</span></th>}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty-cell">
                      <p className="empty">{view === "waiting" ? "No links are waiting. New links show up here until the owner signs up." : `No ${VIEWS.find((v) => v.key === view)!.label.toLowerCase()} links.`}</p>
                    </td>
                  </tr>
                )}
                {rows.map((link) => {
                  const left = daysBetween(now, link.expiresAt);
                  const name = link.gym?.name ?? link.gymName ?? link.email ?? "this gym";
                  return (
                    <tr key={link.id}>
                      <td className="identity"><Who link={link} /></td>
                      <td className="line2">{link.email ?? <span className="grey">Any email</span>}</td>
                      <td className="n line2 num">{link.seatLimit}<span className="grey"> seats</span></td>
                      <td className="line2">
                        {link.createdBy}
                        <span className="sub">{shortDate(link.createdAt, now)}</span>
                      </td>
                      <td className="n key num">
                        {view === "waiting" && (left <= 0 ? <span className="pill warn">Today</span> : left <= 3 ? <span className="pill warn">In {plural(left, "day")}</span> : `In ${plural(left, "day")}`)}
                        {view === "signed-up" && (
                          <>
                            {shortDate(link.usedAt!, now)}
                            <span className="sub">after {plural(daysBetween(link.createdAt, link.usedAt!), "day")}</span>
                          </>
                        )}
                        {view === "expired" && shortDate(link.expiresAt, now)}
                        {view === "revoked" && shortDate(link.revokedAt!, now)}
                      </td>
                      {view !== "revoked" && (
                        <td className="actions">
                          {view === "signed-up" ? (
                            link.gym && <Link href={`/gyms/${link.gym.id}`} className="btn small">Open gym</Link>
                          ) : (
                            <LinkRowActions id={link.id} name={name} canRevoke={view === "waiting"} />
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="table-foot">
            <span>{plural(rows.length, "link")}</span>
            <span>Links work once and expire 14 days after they are issued or reissued.</span>
          </p>
        </div>
      </div>
    </>
  );
}
