import "server-only";

import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { getSession } from "@/app/api/auth/session";
import { normalizeEmail } from "@/app/api/auth/email";
import { verifySession } from "@/app/lib/dal";

/**
 * Gecco staff who can onboard new gyms, listed in PLATFORM_ADMIN_EMAILS (comma separated).
 * Only list emails that already have an account: signup does not verify email ownership.
 */
export function isPlatformAdmin(email: string) {
  const target = normalizeEmail(email);
  if (!target) return false;
  return (process.env.PLATFORM_ADMIN_EMAILS ?? "").split(",").some((item) => normalizeEmail(item) === target);
}

export async function requirePlatformAdmin() {
  const session = await getSession();
  if (!session) {
    return { ok: false as const, response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }
  if (!isPlatformAdmin(session.user.email)) {
    return { ok: false as const, response: NextResponse.json({ error: "Not found." }, { status: 404 }) };
  }
  return { ok: true as const, session };
}

/** Admin pages 404 for everyone else so their existence is not advertised. */
export async function requirePlatformAdminPage() {
  const session = await verifySession();
  if (!isPlatformAdmin(session.user.email)) notFound();
  return session;
}
