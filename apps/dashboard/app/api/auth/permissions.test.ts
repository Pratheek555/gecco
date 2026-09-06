import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hasPermission } from "./permissions";

describe("Gecco permission policy", () => {
  it("allows owners to manage all operational settings", () => {
    assert.equal(hasPermission("OWNER", "plans:manage"), true);
    assert.equal(hasPermission("OWNER", "trainer-incentives:manage"), true);
    assert.equal(hasPermission("OWNER", "gym:manage"), true);
    assert.equal(hasPermission("OWNER", "payments:record"), true);
  });

  it("allows staff to operate the gym without configuration access", () => {
    assert.equal(hasPermission("STAFF", "members:write"), true);
    assert.equal(hasPermission("STAFF", "payments:record"), true);
    assert.equal(hasPermission("STAFF", "plans:manage"), false);
    assert.equal(hasPermission("STAFF", "trainer-incentives:manage"), false);
    assert.equal(hasPermission("STAFF", "gym:manage"), false);
  });

  it("does not expose broad member or payment data to trainers", () => {
    assert.equal(hasPermission("TRAINER", "members:read"), false);
    assert.equal(hasPermission("TRAINER", "payments:read"), false);
    assert.equal(hasPermission("TRAINER", "memberships:cancel"), false);
  });

  it("rejects unknown roles", () => {
    assert.equal(hasPermission("UNKNOWN", "members:read"), false);
  });
});
