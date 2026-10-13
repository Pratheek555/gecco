import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allPermissions, effectivePermissions, hasPermission, normalizeGrant, rolePresets } from "./permissions";

describe("Gecco permission policy", () => {
  it("gives owners every permission regardless of stored grants", () => {
    assert.deepEqual(effectivePermissions("OWNER", [], "ASSIGNED"), [...allPermissions]);
  });

  it("keeps the staff preset free of configuration access", () => {
    const staff = effectivePermissions("STAFF", rolePresets.STAFF.permissions, rolePresets.STAFF.memberScope);
    assert.equal(hasPermission(staff, "members:write"), true);
    assert.equal(hasPermission(staff, "payments:record"), true);
    assert.equal(hasPermission(staff, "plans:manage"), false);
    assert.equal(hasPermission(staff, "trainer-incentives:manage"), false);
    assert.equal(hasPermission(staff, "team:manage"), false);
  });

  it("never grants owner-only permissions to non-owners", () => {
    assert.deepEqual(normalizeGrant(["gym:manage", "team:manage", "plans:manage"], "ALL"), []);
  });

  it("adds the permissions a screen depends on", () => {
    assert.deepEqual(normalizeGrant(["payments:record"], "ALL"), ["members:read", "payments:read", "payments:record"]);
    assert.deepEqual(normalizeGrant(["memberships:write"], "ALL"), [
      "members:read",
      "memberships:read",
      "memberships:write",
      "plans:read",
      "trainers:read",
    ]);
  });

  it("drops gym-wide permissions for assigned-member access", () => {
    assert.deepEqual(normalizeGrant(["overview:read", "members:read"], "ASSIGNED"), ["members:read"]);
  });

  it("gives trainers only their own members by default", () => {
    const trainer = effectivePermissions("TRAINER", rolePresets.TRAINER.permissions, rolePresets.TRAINER.memberScope);
    assert.equal(hasPermission(trainer, "members:read"), true);
    assert.equal(hasPermission(trainer, "payments:read"), false);
    assert.equal(hasPermission(trainer, "leads:read"), false);
    assert.equal(hasPermission(trainer, "overview:read"), false);
  });

  it("ignores unknown roles and permission keys", () => {
    assert.deepEqual(effectivePermissions("UNKNOWN", ["members:read"], "ALL"), []);
    assert.deepEqual(normalizeGrant(["members:delete", "members:read"], "ALL"), ["members:read"]);
  });
});
