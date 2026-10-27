import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pdfSafe, renderBillPdf } from "./bill-pdf";
import { billFileName, billNumber, buildBill, type BillSource } from "./bills";

const date = (value: string) => new Date(`${value}T00:00:00.000Z`);

function source(overrides: Partial<BillSource> = {}): BillSource {
  return {
    id: "3f2a9c1e-55aa-4b11-9c0d-1234567890ab",
    amount: "2000",
    paidOn: date("2026-10-27"),
    createdAt: new Date("2026-10-27T10:15:00Z"),
    status: "SUCCEEDED",
    reference: null,
    voidReason: null,
    gym: { name: "Iron Temple", timezone: "Asia/Kolkata" },
    member: { fullName: "Ananya Rao", memberNumber: "1042" },
    membership: { startsOn: date("2026-10-01"), endsOn: date("2026-12-31"), plan: { name: "Quarterly" } },
    paymentMode: { name: "UPI" },
    recipient: { displayName: "Front desk" },
    allocations: [
      {
        amount: "2000",
        charge: {
          kind: "MEMBERSHIP_FEE",
          description: null,
          amount: "6000",
          dueOn: date("2026-10-01"),
          allocations: [
            { amount: "1500", payment: { id: "earlier", status: "SUCCEEDED", createdAt: new Date("2026-10-02T00:00:00Z") } },
            { amount: "500", payment: { id: "voided", status: "VOIDED", createdAt: new Date("2026-10-03T00:00:00Z") } },
            { amount: "2500", payment: { id: "later", status: "SUCCEEDED", createdAt: new Date("2026-11-01T00:00:00Z") } },
            { amount: "2000", payment: { id: "3f2a9c1e-55aa-4b11-9c0d-1234567890ab", status: "SUCCEEDED", createdAt: new Date("2026-10-27T10:15:00Z") } },
          ],
        },
      },
    ],
    ...overrides,
  };
}

describe("buildBill", () => {
  it("shows the balance as it stood when this payment was made", () => {
    const bill = buildBill(source());

    assert.equal(bill.number, "3F2A9C1E");
    assert.equal(bill.amount, 2000);
    assert.deepEqual(
      bill.lines.map(({ description, charged, paidEarlier, paidNow, balanceAfter }) => ({ description, charged, paidEarlier, paidNow, balanceAfter })),
      // Voided and later payments are ignored, so the bill doesn't change when downloaded later.
      [{ description: "Membership fee", charged: 6000, paidEarlier: 1500, paidNow: 2000, balanceAfter: 2500 }],
    );
    assert.equal(bill.balanceAfter, 2500);
    assert.equal(bill.unapplied, 0);
    assert.equal(bill.planName, "Quarterly");
  });

  it("does not count a voided payment towards the balance", () => {
    const bill = buildBill(source({ status: "VOIDED", voidReason: "Duplicate" }));
    assert.equal(bill.lines[0].paidNow, 2000);
    assert.equal(bill.balanceAfter, 4500);
  });

  it("uses the charge description and reports unapplied credit without float drift", () => {
    const base = source();
    const bill = buildBill({
      ...base,
      amount: "1000.30",
      allocations: [
        { amount: "700.10", charge: { ...base.allocations[0].charge, description: "  Locker rental ", amount: "700.10", allocations: [] } },
      ],
    });
    assert.equal(bill.lines[0].description, "Locker rental");
    assert.equal(bill.lines[0].balanceAfter, 0);
    assert.equal(bill.unapplied, 300.2);
  });

  it("names files by date and bill number", () => {
    assert.equal(billNumber("abcdef12-0000-0000-0000-000000000000"), "ABCDEF12");
    assert.equal(billFileName(buildBill(source())), "bill-2026-10-27-3F2A9C1E.pdf");
  });
});

describe("bill PDF", () => {
  it("folds characters the standard fonts can't encode", () => {
    assert.equal(pdfSafe("José’s – ₹500"), "Jose's - Rs.500");
    assert.equal(pdfSafe("राहुल Sharma"), "????? Sharma");
  });

  it("renders a PDF for paid and voided bills, including non-Latin names", async () => {
    for (const bill of [buildBill(source()), buildBill(source({ status: "VOIDED", member: { fullName: "राहुल", memberNumber: "7" } }))]) {
      const bytes = await renderBillPdf(bill);
      assert.equal(Buffer.from(bytes.subarray(0, 5)).toString(), "%PDF-");
      assert.ok(bytes.byteLength > 1000);
    }
  });
});
