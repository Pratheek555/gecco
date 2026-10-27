import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildBill, type BillSource } from "@/app/lib/bills";
import { memberReceiptEmail } from "./member-receipt-email";
import { receiptEmailAddress } from "./notify-member";

const date = (value: string) => new Date(`${value}T00:00:00.000Z`);

function bill(overrides: Partial<BillSource> = {}) {
  return buildBill({
    id: "3f2a9c1e-55aa-4b11-9c0d-1234567890ab",
    amount: "2000",
    paidOn: date("2026-10-27"),
    createdAt: new Date("2026-10-27T10:15:00Z"),
    status: "SUCCEEDED",
    reference: "UPI <ref>",
    voidReason: null,
    gym: { name: "Iron & Steel", timezone: "Asia/Kolkata" },
    member: { fullName: "Ananya Rao", memberNumber: "1042" },
    membership: { startsOn: date("2026-10-01"), endsOn: date("2026-12-31"), plan: { name: "Quarterly" } },
    paymentMode: { name: "UPI" },
    recipient: { displayName: "Front desk" },
    allocations: [
      { amount: "2000", charge: { kind: "MEMBERSHIP_FEE", description: null, amount: "2000", dueOn: date("2026-10-01"), allocations: [] } },
    ],
    ...overrides,
  });
}

describe("member receipt email", () => {
  it("shows the member's side only, escaped, with a link to their bills", () => {
    const email = memberReceiptEmail(bill(), "https://app.gecco.in/bills/abc");

    assert.equal(email.subject, "Your receipt from Iron & Steel · ₹2,000");
    assert.match(email.html, /Iron &#38; Steel/);
    assert.match(email.html, /UPI &#60;ref&#62;/);
    assert.match(email.html, /Paid in full/);
    assert.match(email.html, /href="https:\/\/app\.gecco\.in\/bills\/abc"/);
    assert.match(email.text, /Bill number: #3F2A9C1E/);
    // Owner-only business figures never reach the member.
    assert.doesNotMatch(email.html, /Your money this month|Recorded by|Front desk/);
  });

  it("calls out a remaining balance", () => {
    const base = bill();
    const partial = memberReceiptEmail({ ...base, balanceAfter: 1500 }, "https://x");
    assert.match(partial.html, /Balance due &nbsp;₹1,500/);
    assert.match(partial.text, /Balance due: ₹1,500/);
  });
});

describe("receiptEmailAddress", () => {
  it("prefers the primary email and skips invalid or non-email contacts", () => {
    assert.equal(
      receiptEmailAddress([
        { kind: "PHONE", value: "9999999999", isPrimary: true },
        { kind: "EMAIL", value: "old@example.com", isPrimary: false },
        { kind: "EMAIL", value: " Main@Example.com ", isPrimary: true },
      ]),
      "main@example.com",
    );
    assert.equal(receiptEmailAddress([{ kind: "EMAIL", value: "not-an-email", isPrimary: true }, { kind: "EMAIL", value: "b@x.io", isPrimary: false }]), "b@x.io");
    assert.equal(receiptEmailAddress([{ kind: "PHONE", value: "1", isPrimary: true }]), null);
  });
});
