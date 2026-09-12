import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseLeadInput } from "./shared";

describe("lead input validation", () => {
  it("accepts a lead with a phone number and normalized optional fields", () => {
    const result = parseLeadInput({
      fullName: "  Riya Mehta ",
      phone: " +91 98765 43210 ",
      email: "",
      source: "REFERRAL",
      interestedPlan: "PT",
      nextFollowUpAt: "2026-09-10T10:30:00.000Z",
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.data.fullName, "Riya Mehta");
    assert.equal(result.data.phone, "+91 98765 43210");
    assert.equal(result.data.email, null);
    assert.equal(result.data.interestedPlan, "PT");
  });

  it("requires at least one usable contact method", () => {
    const result = parseLeadInput({ fullName: "Riya Mehta", phone: "", email: "" });
    assert.deepEqual(result, {
      ok: false,
      error: "Add at least a phone number or email address.",
    });
  });

  it("rejects invalid sources, emails, and follow-up dates", () => {
    assert.equal(
      parseLeadInput({ fullName: "Riya", email: "not-an-email", source: "GOOGLE" }).ok,
      false,
    );
    assert.equal(
      parseLeadInput({
        fullName: "Riya",
        phone: "123",
        source: "UNKNOWN",
      }).ok,
      false,
    );
    assert.equal(
      parseLeadInput({
        fullName: "Riya",
        phone: "123",
        nextFollowUpAt: "not-a-date",
      }).ok,
      false,
    );
  });
});
