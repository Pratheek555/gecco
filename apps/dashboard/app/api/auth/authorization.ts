import { NextResponse } from "next/server";
import type { prisma } from "db/client";
import { getSession } from "./session";
import { hasPermission, type GymRole, type Permission } from "./permissions";

type MemberWhere = NonNullable<NonNullable<Parameters<typeof prisma.member.findFirst>[0]>["where"]>;

export type AuthorizedSession = NonNullable<Awaited<ReturnType<typeof getSession>>>;

type RequirePermissionOptions = {
  /** Reject callers limited to their assigned members (gym-wide data or member creation). */
  fullMemberScope?: boolean;
};

export async function requirePermission(permission: Permission, options: RequirePermissionOptions = {}) {
  const session = await getSession();

  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      ),
    };
  }

  const role = session.activeGym.role as GymRole;

  if (
    !hasPermission(session.activeGym.permissions, permission) ||
    (options.fullMemberScope && session.activeGym.memberScope !== "ALL")
  ) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "You do not have permission to perform this action." },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true as const,
    session,
    role,
  };
}

/** Members the caller may see in the active gym. */
export function memberAccessWhere(session: AuthorizedSession): MemberWhere {
  const gymId = session.activeGym.id;
  if (session.activeGym.memberScope === "ALL") return { gymId };

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return {
    gymId,
    memberships: {
      some: {
        status: "ACTIVE",
        trainerAssignments: {
          some: {
            trainer: { gymId, userId: session.user.id },
            startsOn: { lte: today },
            OR: [{ endsOn: null }, { endsOn: { gte: today } }],
          },
        },
      },
    },
  };
}

/** Relation filter for records that belong to a member (payments, memberships). */
export function memberRelationWhere(session: AuthorizedSession) {
  return session.activeGym.memberScope === "ALL" ? {} : { member: memberAccessWhere(session) };
}
