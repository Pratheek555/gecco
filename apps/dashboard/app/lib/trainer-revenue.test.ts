import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { monthlyIncentives, revenueByMonth, totalAttributedRevenue } from "./trainer-revenue";

function payment(amount: string, paidOn: string) {
  return { amount, paidOn: new Date(`${paidOn}T00:00:00.000Z`) };
}

describe("trainer revenue attribution", () => {
  it("allocates the full membership fee evenly across its duration", () => {
    const assignment = {
      startsOn: new Date("2026-01-01T00:00:00.000Z"),
      endsOn: new Date("2026-03-31T00:00:00.000Z"),
      membership: {
        trainerRevenueEligibleSnapshot: true,
        startsOn: new Date("2026-01-01T00:00:00.000Z"),
        agreedFee: "12000",
        durationMonths: 3,
        payments: [payment("5000", "2026-01-10"), payment("5000", "2026-02-10")],
      },
    };

    assert.deepEqual(revenueByMonth([assignment], ["2026-01", "2026-02", "2026-03"]), [
      { month: "2026-01", amount: 4000 },
      { month: "2026-02", amount: 4000 },
      { month: "2026-03", amount: 4000 },
    ]);
    assert.equal(totalAttributedRevenue([assignment]), 12000);
  });

  it("excludes ineligible memberships and months outside the assignment", () => {
    const assignments = [
      {
        startsOn: new Date("2026-01-01T00:00:00.000Z"),
        endsOn: new Date("2026-03-31T00:00:00.000Z"),
        membership: {
          trainerRevenueEligibleSnapshot: true,
          startsOn: new Date("2025-10-01T00:00:00.000Z"),
          agreedFee: "6000",
          durationMonths: 2,
          payments: [payment("5000", "2025-12-31"), payment("5000", "2026-04-01")],
        },
      },
      {
        startsOn: new Date("2026-01-01T00:00:00.000Z"),
        endsOn: null,
        membership: {
          trainerRevenueEligibleSnapshot: false,
          startsOn: new Date("2026-01-01T00:00:00.000Z"),
          agreedFee: "9000",
          durationMonths: 1,
          payments: [payment("9000", "2026-02-01")],
        },
      },
    ];

    assert.equal(totalAttributedRevenue(assignments), 0);
  });

  it("keeps rounding exact by putting the remainder in the final month", () => {
    const assignment = {
      startsOn: new Date("2026-01-31T00:00:00.000Z"),
      endsOn: null,
      membership: {
        trainerRevenueEligibleSnapshot: true,
        startsOn: new Date("2026-01-31T00:00:00.000Z"),
        agreedFee: "10000",
        durationMonths: 3,
        payments: [],
      },
    };

    assert.deepEqual(revenueByMonth([assignment], ["2026-01", "2026-02", "2026-03"]), [
      { month: "2026-01", amount: 3333.33 },
      { month: "2026-02", amount: 3333.33 },
      { month: "2026-03", amount: 3333.34 },
    ]);
    assert.equal(totalAttributedRevenue([assignment]), 10000);
  });
});

describe("trainer incentives", () => {
  it("uses the effective monthly percentage and preserves historical rules", () => {
    const result = monthlyIncentives(
      [
        { month: "2026-08", amount: 10000 },
        { month: "2026-09", amount: 15000 },
      ],
      [
        {
          id: "eight-percent",
          percentage: "8",
          startsOn: new Date("2026-08-01T00:00:00.000Z"),
          endsOn: new Date("2026-08-31T00:00:00.000Z"),
        },
        {
          id: "ten-percent",
          percentage: "10",
          startsOn: new Date("2026-09-01T00:00:00.000Z"),
          endsOn: null,
        },
      ],
    );

    assert.deepEqual(result, [
      { month: "2026-08", revenue: 10000, percentage: 8, amount: 800 },
      { month: "2026-09", revenue: 15000, percentage: 10, amount: 1500 },
    ]);
  });
});
