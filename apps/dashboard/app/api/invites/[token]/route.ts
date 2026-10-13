import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { getSession } from "@/app/api/auth/session";
import { hashInviteToken } from "@/app/lib/team";

export const runtime = "nodejs";

function inviteStatus(invite: { acceptedAt: Date | null; revokedAt: Date | null; expiresAt: Date }) {
  if (invite.revokedAt) return "revoked" as const;
  if (invite.acceptedAt) return "accepted" as const;
  if (invite.expiresAt <= new Date()) return "expired" as const;
  return "pending" as const;
}

/** Public preview of an invite so the accept page can greet the invitee. */
export async function GET(_request: Request, context: RouteContext<"/api/invites/[token]">) {
  const { token } = await context.params;
  const invite = await prisma.gymInvite.findUnique({
    where: { tokenHash: hashInviteToken(token) },
    select: {
      gymId: true,
      inviteeName: true,
      role: true,
      expiresAt: true,
      acceptedAt: true,
      revokedAt: true,
      gym: { select: { name: true, isActive: true } },
      invitedBy: { select: { fullName: true } },
    },
  });

  if (!invite || !invite.gym.isActive) {
    return NextResponse.json({ error: "This invite link is not valid." }, { status: 404 });
  }

  const session = await getSession();
  return NextResponse.json({
    status: inviteStatus(invite),
    gymName: invite.gym.name,
    role: invite.role,
    inviteeName: invite.inviteeName,
    invitedBy: invite.invitedBy.fullName,
    expiresAt: invite.expiresAt.toISOString(),
    signedInAs: session
      ? {
          fullName: session.user.fullName,
          email: session.user.email,
          alreadyMember: session.gyms.some((gym) => gym.id === invite.gymId),
        }
      : null,
  });
}
