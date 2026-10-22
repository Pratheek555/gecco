import { strict as assert } from "node:assert";
import { test } from "node:test";
import { addWeekly, attention, bucket, gymState, ladder, lastWeeks, linkStatus, progress, series } from "./derive";
import { sampleSnapshot } from "./sample";

test("headline payments exclude the unfinished week and include deactivated gyms", () => {
  const snapshot = sampleSnapshot();
  const recent = lastWeeks(snapshot, 4);
  const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
  assert.equal(recent.payments, sum(snapshot.gyms.flatMap((gym) => gym.weekly.payments.slice(-5, -1))));
  snapshot.gyms[0].isActive = false;
  snapshot.gyms[0].weekly.payments[snapshot.weekStarts.length - 1] += 1_000_000;
  assert.equal(lastWeeks(snapshot, 4).payments, recent.payments);
  assert.ok(recent.accounts.every((account) => account.createdAt >= recent.since && account.createdAt < recent.until));
});

test("growth running totals reconcile with all recorded gyms, accounts and members", () => {
  const snapshot = sampleSnapshot();
  for (const weeks of [12, 26, 52]) {
    for (const rows of [snapshot.gyms, snapshot.accounts]) {
      const counts = bucket(snapshot.weekStarts, rows.map((row) => row.createdAt)).counts;
      const added = counts.slice(-weeks).reduce((a, b) => a + b, 0);
      assert.equal(series(snapshot.weekStarts, counts, weeks, rows.length - added).running.at(-1), rows.length);
    }
    const counts = addWeekly(snapshot.gyms, "members", snapshot.weekStarts.length);
    const total = snapshot.gyms.reduce((sum, gym) => sum + gym.membersTotal, 0);
    const added = counts.slice(-weeks).reduce((a, b) => a + b, 0);
    assert.equal(series(snapshot.weekStarts, counts, weeks, total - added).running.at(-1), total);
  }
});

test("activation ladder counts decrease and omit deactivated gyms", () => {
  const snapshot = sampleSnapshot();
  const result = ladder(snapshot);
  assert.equal(result.total, snapshot.gyms.filter((gym) => gym.isActive).length + snapshot.links.filter((link) => linkStatus(link, snapshot.now) === "waiting").length);
  result.rungs.forEach((rung, index) => {
    assert.ok(rung.reached >= 0 && rung.reached <= result.total);
    if (index) assert.ok(rung.reached <= result.rungs[index - 1].reached);
  });
  const disabled = snapshot.gyms.find((gym) => !gym.isActive)!;
  assert.equal(gymState(progress(disabled, snapshot.now)), "deactivated");
  assert.ok(!attention(snapshot).some((item) => item.href === `/gyms/${disabled.id}`));
});

test("used and revoked links cannot return to waiting; expiry boundary is closed", () => {
  const snapshot = sampleSnapshot();
  const link = { ...snapshot.links[0], usedAt: null, revokedAt: null, expiresAt: snapshot.now };
  assert.equal(linkStatus(link, snapshot.now), "expired");
  assert.equal(linkStatus({ ...link, revokedAt: snapshot.now }, snapshot.now), "revoked");
  assert.equal(linkStatus({ ...link, usedAt: snapshot.now }, snapshot.now), "signed-up");
});

test("week boundaries place events in exactly one bucket", () => {
  const starts = ["2026-10-05T00:00:00.000Z", "2026-10-12T00:00:00.000Z", "2026-10-19T00:00:00.000Z"];
  assert.deepEqual(bucket(starts, ["2026-10-04T23:59:59.999Z", starts[0], "2026-10-11T23:59:59.999Z", starts[1], starts[2]]), { before: 1, counts: [2, 1, 1] });
});
