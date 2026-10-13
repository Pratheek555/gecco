import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { requirePermission } from "@/app/api/auth/authorization";
import { createInviteToken, inviteExpiry, inviteUrl, lockGymSeats, TeamError } from "@/app/lib/team";
import { inviteSelect, toInvite } from "../../shared";

export const runtime = "nodejs";

/** Issues a fresh link (the old one stops working) and restarts the expiry window. */
export async function POST(request: Request, context: RouteContext<"/api/team/invites/[inviteid]">) {
  const auth = await requirePermission("team:manage");
  if (!auth.ok) return auth.response;
  const gymId = auth.session.activeGym.id;
  const { inviteid: inviteId } = await context.params;
  const { token, tokenHash } = createInviteToken();

  try {
    const invite = await prisma.$transaction(async (tx) => {
      const current = await tx.gymInvite.findFirst({
        where: { id: inviteId, gymId, acceptedAt: null, revokedAt: null },
        select: { expiresAt: true },
      });
      if (!current) throw new TeamError("Invite not found.", 404);

      // An expired invite no longer holds a seat, so reviving it needs one.
      if (current.expiresAt <= new Date()) {
        const seats = await lockGymSeats(tx, gymId);
        if (seats.activeMembers + seats.pendingInvites >= seats.seatLimit) {
          throw new TeamError(`All ${seats.seatLimit} team seats are in use.`, 409);
        }
      }

      return tx.gymInvite.update({
        where: { id: inviteId },
        data: { tokenHash, expiresAt: inviteExpiry() },
        select: inviteSelect,
      });
    });

    return NextResponse.json({ invite: toInvite(invite), url: inviteUrl(request, token) });
  } catch (error) {
    if (error instanceof TeamError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
}

export async function DELETE(_request: Request, context: RouteContext<"/api/team/invites/[inviteid]">) {
  const auth = await requirePermission("team:manage");
  if (!auth.ok) return auth.response;
  const { inviteid: inviteId } = await context.params;

  const { count } = await prisma.gymInvite.updateMany({
    where: { id: inviteId, gymId: auth.session.activeGym.id, acceptedAt: null, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  if (!count) return NextResponse.json({ error: "Invite not found." }, { status: 404 });

  return NextResponse.json({ id: inviteId, revoked: true });
}
