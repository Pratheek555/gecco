import "server-only";

import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "db/client";
import { isSampleMode } from "./mode";

export const COOKIE = "gecco_hq";
const LIFETIME_SECONDS = 60 * 60 * 12;

export type Admin = { id: string; name: string; email: string };

const SAMPLE_ADMIN: Admin = { id: "sample-admin", name: "Ananya Iyer", email: "ananya@gecco.in" };

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254 ? email : null;
}

/** Gecco staff listed in PLATFORM_ADMIN_EMAILS. Re-checked on every request, so removing an email locks it out. */
export function isPlatformAdmin(email: string) {
  const target = normalizeEmail(email);
  if (!target) return false;
  return (process.env.PLATFORM_ADMIN_EMAILS ?? "").split(",").some((item) => normalizeEmail(item) === target);
}

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("ADMIN_SESSION_SECRET must be set to at least 32 characters.");
  return value;
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

function encode(admin: Admin) {
  const payload = Buffer.from(
    JSON.stringify({ sub: admin.id, email: admin.email, exp: Math.floor(Date.now() / 1000) + LIFETIME_SECONDS, n: randomBytes(8).toString("base64url") }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decode(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { sub: string; email: string; exp: number };
    return data.exp > Date.now() / 1000 ? data : null;
  } catch {
    return null;
  }
}

/** The signed-in admin, or null. Cached per request. */
export const getAdmin = cache(async (): Promise<Admin | null> => {
  if (isSampleMode) return SAMPLE_ADMIN;
  const token = (await cookies()).get(COOKIE)?.value;
  const data = token ? decode(token) : null;
  if (!data || !isPlatformAdmin(data.email)) return null;
  const user = await prisma.user.findUnique({ where: { id: data.sub }, select: { id: true, fullName: true, email: true } });
  if (!user || user.email !== data.email) return null;
  return { id: user.id, name: user.fullName, email: user.email };
});

/** For pages: sends anyone who is not Gecco staff to the sign-in screen. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/login");
  return admin;
}

function deriveKey(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) =>
    scryptCallback(password, salt, 64, (error, key) => (error ? reject(error) : resolve(key))),
  );
}

/** Same scrypt format the customer dashboard writes: scrypt$<salt>$<key>. */
async function verifyPassword(password: string, encoded: string) {
  const [algorithm, saltValue, keyValue] = encoded.split("$");
  if (algorithm !== "scrypt" || !saltValue || !keyValue) return false;
  const salt = Buffer.from(saltValue, "base64url");
  const expected = Buffer.from(keyValue, "base64url");
  if (salt.length !== 16 || expected.length !== 64) return false;
  return timingSafeEqual(await deriveKey(password, salt), expected);
}

export async function signIn(emailInput: unknown, password: unknown) {
  const email = normalizeEmail(emailInput);
  if (!email || typeof password !== "string" || password.length > 1024) return false;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, fullName: true, email: true, passwordHash: true } });
  // Verify the password before the allowlist so the response does not reveal who is staff.
  const valid = Boolean(user?.passwordHash) && (await verifyPassword(password, user!.passwordHash!));
  if (!valid || !user || !isPlatformAdmin(user.email)) return false;

  (await cookies()).set(COOKIE, encode({ id: user.id, name: user.fullName, email: user.email }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: LIFETIME_SECONDS,
  });
  return true;
}

export async function signOut() {
  (await cookies()).delete(COOKIE);
}
