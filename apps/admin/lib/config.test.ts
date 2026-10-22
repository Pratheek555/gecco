import { strict as assert } from "node:assert";
import { test } from "node:test";
import { signInConfigurationError } from "./config";

const configured = {
  DATABASE_URL: "postgresql://test:test@localhost/test",
  PLATFORM_ADMIN_EMAILS: "staff@example.test",
  ADMIN_SESSION_SECRET: "test-only-session-secret-with-32-characters",
};

test("missing database configuration gives an actionable error before connecting", () => {
  assert.match(signInConfigurationError({ ...configured, DATABASE_URL: undefined })!, /DATABASE_URL/);
});

test("invalid connection strings do not expose their contents", () => {
  const result = signInConfigurationError({ ...configured, DATABASE_URL: "invalid-private-value" });
  assert.match(result!, /PostgreSQL/);
  assert.ok(!result!.includes("invalid-private-value"));
});

test("sign-in requires both a staff allowlist and a session secret", () => {
  assert.match(signInConfigurationError({ ...configured, PLATFORM_ADMIN_EMAILS: "" })!, /PLATFORM_ADMIN_EMAILS/);
  assert.match(signInConfigurationError({ ...configured, ADMIN_SESSION_SECRET: "short" })!, /ADMIN_SESSION_SECRET/);
  assert.equal(signInConfigurationError(configured), null);
});
