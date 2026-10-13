import { prisma } from "db/client";
import { normalizeGrant, type MemberScope } from "@/app/api/auth/permissions";

export const teamMemberSelect = {
  role: true,
  permissions: true,
  memberScope: true,
  isActive: true,
  createdAt: true,
  user: { select: { id: true, fullName: true, email: true } },
} as const;

export const inviteSelect = {
  id: true,
  inviteeName: true,
  role: true,
  permissions: true,
  memberScope: true,
  expiresAt: true,
  createdAt: true,
  trainer: { select: { id: true, fullName: true } },
  invitedBy: { select: { fullName: true } },
} as const;

type TeamMemberRow = {
  role: string;
  permissions: string[];
  memberScope: MemberScope;
  isActive: boolean;
  createdAt: Date;
  user: { id: string; fullName: string; email: string };
};

export function toTeamMember(row: TeamMemberRow, trainer: { id: string; fullName: string } | null) {
  return {
    userId: row.user.id,
    fullName: row.user.fullName,
    email: row.user.email,
    role: row.role,
    permissions: row.role === "OWNER" ? [] : normalizeGrant(row.permissions, row.memberScope),
    memberScope: row.memberScope,
    isActive: row.isActive,
    joinedAt: row.createdAt.toISOString(),
    trainer,
  };
}

export function toInvite(invite: {
  id: string;
  inviteeName: string | null;
  role: string;
  permissions: string[];
  memberScope: MemberScope;
  expiresAt: Date;
  createdAt: Date;
  trainer: { id: string; fullName: string } | null;
  invitedBy: { fullName: string };
}) {
  return {
    id: invite.id,
    inviteeName: invite.inviteeName,
    role: invite.role,
    permissions: normalizeGrant(invite.permissions, invite.memberScope),
    memberScope: invite.memberScope,
    expiresAt: invite.expiresAt.toISOString(),
    createdAt: invite.createdAt.toISOString(),
    trainer: invite.trainer,
    invitedBy: invite.invitedBy.fullName,
  };
}

export async function linkedTrainer(gymId: string, userId: string) {
  return prisma.trainer.findFirst({ where: { gymId, userId }, select: { id: true, fullName: true } });
}
