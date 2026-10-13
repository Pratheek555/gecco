import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { requirePermission } from "@/app/api/auth/authorization";
import {
  createInviteToken,
  inviteExpiry,
  inviteUrl,
  lockGymSeats,
  parseAccess,
  pendingInviteWhere,
  readObject,
  TeamError,
} from "@/app/lib/team";
import { inviteSelect, toInvite } from "../shared";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requirePermission("team:manage");
  if (!auth.ok) return auth.response;
  const { session } = auth;
  const gymId = session.activeGym.id;

  let body: Record<string, unknown> | null;
  try {
    body = readObject(await request.json());
  } catch {
    body = null;
  }
  if (!body) return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });

  const access = parseAccess(body);
  if (typeof access === "string") return NextResponse.json({ error: access }, { status: 400 });

  if (body.inviteeName != null && typeof body.inviteeName !== "string") {
    return NextResponse.json({ error: "inviteeName must be a string." }, { status: 400 });
  }
  const inviteeName = typeof body.inviteeName === "string" ? body.inviteeName.trim() : "";
  if (inviteeName.length > 100) {
    return NextResponse.json({ error: "inviteeName must be at most 100 characters." }, { status: 400 });
  }

  const trainerId = body.trainerId ?? null;
  if (trainerId !== null && typeof trainerId !== "string") {
    return NextResponse.json({ error: "trainerId must be a string." }, { status: 400 });
  }
  if (trainerId && access.role !== "TRAINER") {
    return NextResponse.json({ error: "Only trainer invites can be linked to a trainer profile." }, { status: 400 });
  }

  const { token, tokenHash } = createInviteToken();

  try {
    const invite = await prisma.$transaction(async (tx) => {
      const seats = await lockGymSeats(tx, gymId);
      if (seats.activeMembers + seats.pendingInvites >= seats.seatLimit) {
        throw new TeamError(
          `All ${seats.seatLimit} team seats are in use. Revoke a pending invite or remove someone to free a seat.`,
          409,
        );
      }

      if (trainerId) {
        const trainer = await tx.trainer.findFirst({
          where: { id: trainerId, gymId, isActive: true },
          select: { userId: true, invites: { where: pendingInviteWhere(), select: { id: true } } },
        });
        if (!trainer) throw new TeamError("Trainer not found.", 404);
        if (trainer.userId) throw new TeamError("That trainer already has a login.", 409);
        if (trainer.invites.length) throw new TeamError("That trainer already has a pending invite.", 409);
      }

      return tx.gymInvite.create({
        data: {
          gymId,
          tokenHash,
          inviteeName: inviteeName || null,
          role: access.role,
          permissions: access.permissions,
          memberScope: access.memberScope,
          trainerId,
          invitedByUserId: session.user.id,
          expiresAt: inviteExpiry(),
        },
        select: inviteSelect,
      });
    });

    return NextResponse.json({ invite: toInvite(invite), url: inviteUrl(request, token) }, { status: 201 });
  } catch (error) {
    if (error instanceof TeamError) return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
}
