import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseLeadInput, phoneKey } from "./shared";

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

  it("requires a next step for every open lead", () => {
    const base = { fullName: "Riya Mehta", phone: "9876543210" };
    assert.equal(parseLeadInput(base).ok, false);
    assert.equal(parseLeadInput({ ...base, status: "TRIAL_BOOKED" }).ok, false);
    assert.equal(
      parseLeadInput({ ...base, status: "TRIAL_BOOKED", trialAt: "2026-10-15T12:30:00.000Z" }).ok,
      true,
    );
    assert.equal(
      parseLeadInput({ ...base, status: "TRIAL_COMPLETED", trialAt: "2026-10-15T12:30:00.000Z" })
        .ok,
      false,
    );
  });

  it("requires a structured reason for lost leads and clears follow-ups", () => {
    const base = { fullName: "Riya Mehta", phone: "9876543210", status: "LOST" };
    assert.equal(parseLeadInput(base).ok, false);
    const result = parseLeadInput({
      ...base,
      lostReasonCode: "PRICE",
      nextFollowUpAt: "2026-10-15T12:30:00.000Z",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.data.lostReasonCode, "PRICE");
    assert.equal(result.data.nextFollowUpAt, null);
  });

  it("rejects won status and malformed owners", () => {
    const base = {
      fullName: "Riya Mehta",
      phone: "9876543210",
      nextFollowUpAt: "2026-10-15T12:30:00.000Z",
    };
    assert.equal(parseLeadInput({ ...base, status: "WON" }).ok, false);
    assert.equal(parseLeadInput({ ...base, assignedToUserId: "someone" }).ok, false);
  });
});

describe("phone matching key", () => {
  it("matches the same number written differently", () => {
    assert.equal(phoneKey("+91 98765 43210"), "9876543210");
    assert.equal(phoneKey("098765-43210"), "9876543210");
    assert.equal(phoneKey("123"), null);
    assert.equal(phoneKey(null), null);
  });
});
