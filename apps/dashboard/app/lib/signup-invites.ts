import "server-only";

import { prisma } from "db/client";
import { createInviteToken, hashInviteToken } from "@/app/lib/team";

export const SIGNUP_INVITE_LIFETIME_DAYS = 14;
export const MAX_SEAT_LIMIT = 100;

export { createInviteToken as createSignupToken };

export function signupInviteExpiry() {
  return new Date(Date.now() + SIGNUP_INVITE_LIFETIME_DAYS * 24 * 60 * 60 * 1000);
}

/** Uses APP_URL when the dashboard runs behind a proxy whose host differs from the public one. */
export function signupInviteUrl(request: Request, token: string) {
  return new URL(`/signup/${token}`, process.env.APP_URL || request.url).toString();
}

export const pendingSignupInviteWhere = () => ({
  usedAt: null,
  revokedAt: null,
  expiresAt: { gt: new Date() },
});

/** The still-usable invite behind a signup link, or null. */
export function findPendingSignupInvite(token: string) {
  return prisma.gymSignupInvite.findFirst({
    where: { tokenHash: hashInviteToken(token), ...pendingSignupInviteWhere() },
    select: { id: true, gymName: true, email: true, seatLimit: true },
  });
}

export const signupInviteSelect = {
  id: true,
  gymName: true,
  email: true,
  seatLimit: true,
  note: true,
  expiresAt: true,
  usedAt: true,
  revokedAt: true,
  createdAt: true,
  createdBy: { select: { fullName: true } },
  gym: { select: { id: true, name: true } },
} as const;

type SignupInviteRow = {
  id: string;
  gymName: string | null;
  email: string | null;
  seatLimit: number;
  note: string | null;
  expiresAt: Date;
  usedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
  createdBy: { fullName: string };
  gym: { id: string; name: string } | null;
};

export type SignupInviteStatus = "PENDING" | "USED" | "REVOKED" | "EXPIRED";

export function toSignupInvite(row: SignupInviteRow) {
  const status: SignupInviteStatus = row.usedAt
    ? "USED"
    : row.revokedAt
      ? "REVOKED"
      : row.expiresAt <= new Date()
        ? "EXPIRED"
        : "PENDING";
  return {
    id: row.id,
    gymName: row.gymName,
    email: row.email,
    seatLimit: row.seatLimit,
    note: row.note,
    status,
    expiresAt: row.expiresAt.toISOString(),
    usedAt: row.usedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy.fullName,
    gym: row.gym,
  };
}
