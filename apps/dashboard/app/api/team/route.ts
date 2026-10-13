import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { requirePermission } from "@/app/api/auth/authorization";
import { pendingInviteWhere, seatUsage } from "@/app/lib/team";
import { inviteSelect, teamMemberSelect, toInvite, toTeamMember } from "./shared";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requirePermission("team:manage");
  if (!auth.ok) return auth.response;
  const gymId = auth.session.activeGym.id;

  const [seats, members, invites, trainers] = await Promise.all([
    seatUsage(gymId),
    prisma.gymUser.findMany({
      where: { gymId },
      orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
      select: teamMemberSelect,
    }),
    prisma.gymInvite.findMany({
      where: { gymId, ...pendingInviteWhere() },
      orderBy: { createdAt: "desc" },
      select: inviteSelect,
    }),
    prisma.trainer.findMany({
      where: { gymId },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true, isActive: true, userId: true },
    }),
  ]);

  const trainersByUserId = new Map(
    trainers.flatMap((trainer) =>
      trainer.userId ? [[trainer.userId, { id: trainer.id, fullName: trainer.fullName }] as const] : [],
    ),
  );
  const invitedTrainerIds = new Set(invites.flatMap((invite) => (invite.trainer ? [invite.trainer.id] : [])));

  return NextResponse.json({
    seats,
    members: members.map((member) => toTeamMember(member, trainersByUserId.get(member.user.id) ?? null)),
    invites: invites.map(toInvite),
    // Trainer profiles that can be connected to a new trainer login.
    linkableTrainers: trainers
      .filter((trainer) => trainer.isActive && !trainer.userId && !invitedTrainerIds.has(trainer.id))
      .map(({ id, fullName }) => ({ id, fullName })),
  });
}
