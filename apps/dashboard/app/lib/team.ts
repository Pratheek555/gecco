import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { prisma } from "db/client";
import {
  isMemberScope,
  normalizeGrant,
  rolePresets,
  type MemberScope,
  type Permission,
} from "@/app/api/auth/permissions";

export const INVITE_LIFETIME_DAYS = 7;

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export class TeamError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("base64url");
}

export function createInviteToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashInviteToken(token) };
}

export function inviteExpiry() {
  return new Date(Date.now() + INVITE_LIFETIME_DAYS * 24 * 60 * 60 * 1000);
}

/** Uses APP_URL when the dashboard runs behind a proxy whose host differs from the public one. */
export function inviteUrl(request: Request, token: string) {
  return new URL(`/invite/${token}`, process.env.APP_URL || request.url).toString();
}

export const pendingInviteWhere = () => ({
  acceptedAt: null,
  revokedAt: null,
  expiresAt: { gt: new Date() },
});

/** Locks the gym row so concurrent invites and accepts cannot overshoot the seat limit. */
export async function lockGymSeats(tx: Tx, gymId: string) {
  // Sequential on purpose: an interactive transaction runs on a single connection.
  const [gym] = await tx.$queryRaw<{ seat_limit: number }[]>`
    SELECT seat_limit FROM gyms WHERE id = ${gymId}::uuid FOR UPDATE`;
  if (!gym) throw new TeamError("Gym not found.", 404);
  const activeMembers = await tx.gymUser.count({ where: { gymId, isActive: true, role: { not: "OWNER" } } });
  const pendingInvites = await tx.gymInvite.count({ where: { gymId, ...pendingInviteWhere() } });
  return { seatLimit: gym.seat_limit, activeMembers, pendingInvites };
}

export async function seatUsage(gymId: string) {
  const [gym, activeMembers, pendingInvites] = await Promise.all([
    prisma.gym.findUniqueOrThrow({ where: { id: gymId }, select: { seatLimit: true } }),
    prisma.gymUser.count({ where: { gymId, isActive: true, role: { not: "OWNER" } } }),
    prisma.gymInvite.count({ where: { gymId, ...pendingInviteWhere() } }),
  ]);
  return {
    seatLimit: gym.seatLimit,
    activeMembers,
    pendingInvites,
    seatsUsed: activeMembers + pendingInvites,
  };
}

export type AccessInput = {
  role: "STAFF" | "TRAINER";
  permissions: Permission[];
  memberScope: MemberScope;
};

/** Validates role/access from a request body; missing access falls back to the role preset. */
export function parseAccess(
  body: Record<string, unknown>,
  current?: { role: AccessInput["role"]; permissions: readonly string[]; memberScope: MemberScope },
): AccessInput | string {
  const role = body.role ?? current?.role;
  if (role !== "STAFF" && role !== "TRAINER") return "role must be STAFF or TRAINER.";

  const preset = rolePresets[role];
  const memberScope = body.memberScope ?? current?.memberScope ?? preset.memberScope;
  if (!isMemberScope(memberScope)) return "memberScope must be ALL or ASSIGNED.";

  const permissions = body.permissions ?? current?.permissions ?? preset.permissions;
  if (!Array.isArray(permissions) || permissions.some((item) => typeof item !== "string")) {
    return "permissions must be an array of permission keys.";
  }

  return { role, memberScope, permissions: normalizeGrant(permissions, memberScope) };
}

export function readObject(payload: unknown) {
  return payload && typeof payload === "object" && !Array.isArray(payload)
    ? (payload as Record<string, unknown>)
    : null;
}
