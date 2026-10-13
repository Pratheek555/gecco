import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { requirePermission } from "@/app/api/auth/authorization";
import { lockGymSeats, parseAccess, readObject, TeamError } from "@/app/lib/team";
import { linkedTrainer, teamMemberSelect, toTeamMember } from "../../shared";

export const runtime = "nodejs";

async function findEditableMember(gymId: string, userId: string, callerId: string) {
  if (userId === callerId) throw new TeamError("You cannot change your own access.", 400);
  const member = await prisma.gymUser.findUnique({
    where: { gymId_userId: { gymId, userId } },
    select: { ...teamMemberSelect },
  });
  if (!member) throw new TeamError("Team member not found.", 404);
  if (member.role === "OWNER") throw new TeamError("Owner access cannot be changed.", 400);
  return member;
}

/** Updates role, visible sections, member scope, or active status. Changes apply on the person's next request. */
export async function PATCH(request: Request, context: RouteContext<"/api/team/members/[userid]">) {
  const auth = await requirePermission("team:manage");
  if (!auth.ok) return auth.response;
  const gymId = auth.session.activeGym.id;
  const { userid: userId } = await context.params;

  let body: Record<string, unknown> | null;
  try {
    body = readObject(await request.json());
  } catch {
    body = null;
  }
  if (!body) return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
  if (body.isActive !== undefined && typeof body.isActive !== "boolean") {
    return NextResponse.json({ error: "isActive must be a boolean." }, { status: 400 });
  }

  try {
    const current = await findEditableMember(gymId, userId, auth.session.user.id);
    const access = parseAccess(body, {
      role: current.role as "STAFF" | "TRAINER",
      permissions: current.permissions,
      memberScope: current.memberScope,
    });
    if (typeof access === "string") return NextResponse.json({ error: access }, { status: 400 });
    const isActive = (body.isActive as boolean | undefined) ?? current.isActive;

    const updated = await prisma.$transaction(async (tx) => {
      if (isActive && !current.isActive) {
        const seats = await lockGymSeats(tx, gymId);
        if (seats.activeMembers + seats.pendingInvites >= seats.seatLimit) {
          throw new TeamError(`All ${seats.seatLimit} team seats are in use.`, 409);
        }
      }

      // Assigned-member access works through the trainer profile, so trainers always need one.
      if (access.role === "TRAINER") {
        const trainer = await tx.trainer.findFirst({ where: { gymId, userId }, select: { id: true } });
        if (!trainer) {
          await tx.trainer.create({ data: { gymId, userId, fullName: current.user.fullName } });
        }
      }

      return tx.gymUser.update({
        where: { gymId_userId: { gymId, userId } },
        data: { role: access.role, permissions: access.permissions, memberScope: access.memberScope, isActive },
        select: teamMemberSelect,
      });
    });

    return NextResponse.json(toTeamMember(updated, await linkedTrainer(gymId, userId)));
  } catch (error) {
    if (error instanceof TeamError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
}

/** Removes the person from this gym. Their trainer profile and history stay, unlinked from the login. */
export async function DELETE(_request: Request, context: RouteContext<"/api/team/members/[userid]">) {
  const auth = await requirePermission("team:manage");
  if (!auth.ok) return auth.response;
  const gymId = auth.session.activeGym.id;
  const { userid: userId } = await context.params;

  try {
    await findEditableMember(gymId, userId, auth.session.user.id);
    await prisma.$transaction([
      prisma.trainer.updateMany({ where: { gymId, userId }, data: { userId: null } }),
      prisma.gymUser.delete({ where: { gymId_userId: { gymId, userId } } }),
    ]);
    return NextResponse.json({ userId, removed: true });
  } catch (error) {
    if (error instanceof TeamError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
}
