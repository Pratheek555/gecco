"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "db/client";
import { getAdmin, signIn, signOut } from "@/lib/auth";
import { isSampleMode } from "@/lib/load";
import { signInConfigurationError } from "@/lib/config";

export type ActionState = { error?: string; url?: string; title?: string; done?: boolean } | null;

const LINK_LIFETIME_DAYS = 14;
const MAX_SEATS = 100;
const SAMPLE_READ_ONLY = { error: "This is sample data, so nothing was saved. Connect DATABASE_URL to make changes." };

/** Same token scheme the customer dashboard checks: 32 random bytes, stored as a SHA-256 hash. */
function newToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: createHash("sha256").update(token).digest("base64url") };
}

function signupUrl(token: string) {
  const base = process.env.DASHBOARD_URL;
  if (!base) throw new Error("DASHBOARD_URL must be set to build signup links.");
  return new URL(`/signup/${token}`, base).toString();
}

const expiry = () => new Date(Date.now() + LINK_LIFETIME_DAYS * 86_400_000);

async function adminOrError() {
  const admin = await getAdmin();
  if (!admin) return { admin: null, error: { error: "Your session has ended. Sign in again." } };
  if (isSampleMode) return { admin: null, error: SAMPLE_READ_ONLY };
  return { admin, error: null };
}

export async function signInAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const configurationError = signInConfigurationError();
  if (configurationError) return { error: configurationError };
  let signedIn: boolean;
  try {
    signedIn = await signIn(formData.get("email"), formData.get("password"));
  } catch (error) {
    // Connection errors can include credentials in their message; log only safe identifiers.
    console.error("HQ sign-in failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      code: error && typeof error === "object" && "code" in error ? String(error.code) : undefined,
    });
    return { error: "HQ could not connect to its sign-in service. Check the admin app database configuration and try again." };
  }
  if (!signedIn) {
    return { error: "That email and password do not match a Gecco staff account." };
  }
  redirect("/");
}

export async function signOutAction() {
  await signOut();
  redirect("/login");
}

function text(formData: FormData, name: string, max: number) {
  const value = formData.get(name);
  if (typeof value !== "string" || !value.trim()) return { value: null };
  const trimmed = value.trim();
  return trimmed.length > max ? { error: `${name === "note" ? "The note" : "The gym name"} must be at most ${max} characters.` } : { value: trimmed };
}

export async function createSignupLink(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const { admin, error } = await adminOrError();
  if (!admin) return error;

  const gymName = text(formData, "gymName", 100);
  const note = text(formData, "note", 500);
  if ("error" in gymName) return { error: gymName.error };
  if ("error" in note) return { error: note.error };

  const rawEmail = formData.get("email");
  let email: string | null = null;
  if (typeof rawEmail === "string" && rawEmail.trim()) {
    email = rawEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid owner email, or leave it blank." };
    if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
      return { error: "An account with that email already exists." };
    }
  }

  const seatLimit = Number(formData.get("seatLimit") ?? 5);
  if (!Number.isInteger(seatLimit) || seatLimit < 0 || seatLimit > MAX_SEATS) {
    return { error: `Team seats must be a whole number from 0 to ${MAX_SEATS}.` };
  }

  const { token, tokenHash } = newToken();
  const url = signupUrl(token);
  await prisma.gymSignupInvite.create({
    data: { tokenHash, gymName: gymName.value, email, seatLimit, note: note.value, createdByUserId: admin.id, expiresAt: expiry() },
  });
  revalidatePath("/", "layout");
  return { url, title: `Signup link for ${gymName.value ?? email ?? "a new gym"}` };
}

export async function reissueSignupLink(id: string): Promise<ActionState> {
  const { admin, error } = await adminOrError();
  if (!admin) return error;
  const { token, tokenHash } = newToken();
  const url = signupUrl(token);
  const { count } = await prisma.gymSignupInvite.updateMany({
    where: { id, usedAt: null, revokedAt: null },
    data: { tokenHash, expiresAt: expiry() },
  });
  if (!count) return { error: "That link was already used or revoked." };
  revalidatePath("/", "layout");
  return { url, title: "New signup link" };
}

export async function revokeSignupLink(id: string): Promise<ActionState> {
  const { admin, error } = await adminOrError();
  if (!admin) return error;
  const { count } = await prisma.gymSignupInvite.updateMany({
    where: { id, usedAt: null, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  if (!count) return { error: "That link was already used or revoked." };
  revalidatePath("/", "layout");
  return { done: true };
}

export async function updateSeatLimit(gymId: string, _previous: ActionState, formData: FormData): Promise<ActionState> {
  const { admin, error } = await adminOrError();
  if (!admin) return error;
  const seatLimit = Number(formData.get("seatLimit"));
  if (!Number.isInteger(seatLimit) || seatLimit < 0 || seatLimit > MAX_SEATS) {
    return { error: `Team seats must be a whole number from 0 to ${MAX_SEATS}.` };
  }
  await prisma.gym.update({ where: { id: gymId }, data: { seatLimit } });
  revalidatePath("/", "layout");
  return { done: true };
}

export async function setGymActive(gymId: string, isActive: boolean): Promise<ActionState> {
  const { admin, error } = await adminOrError();
  if (!admin) return error;
  await prisma.gym.update({ where: { id: gymId }, data: { isActive } });
  revalidatePath("/", "layout");
  return { done: true };
}
