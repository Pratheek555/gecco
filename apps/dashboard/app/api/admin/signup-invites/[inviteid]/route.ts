import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { requirePlatformAdmin } from "@/app/lib/platform-admin";
import {
  createSignupToken,
  signupInviteExpiry,
  signupInviteSelect,
  signupInviteUrl,
  toSignupInvite,
} from "@/app/lib/signup-invites";

export const runtime = "nodejs";

/** Issues a fresh link (the old one stops working) and restarts the expiry window. */
export async function POST(request: Request, context: RouteContext<"/api/admin/signup-invites/[inviteid]">) {
  const auth = await requirePlatformAdmin();
  if (!auth.ok) return auth.response;
  const { inviteid: inviteId } = await context.params;
  const { token, tokenHash } = createSignupToken();

  const { count } = await prisma.gymSignupInvite.updateMany({
    where: { id: inviteId, usedAt: null, revokedAt: null },
    data: { tokenHash, expiresAt: signupInviteExpiry() },
  });
  if (!count) return NextResponse.json({ error: "Signup link not found, or it was already used or revoked." }, { status: 404 });

  const invite = await prisma.gymSignupInvite.findUniqueOrThrow({ where: { id: inviteId }, select: signupInviteSelect });
  return NextResponse.json({ invite: toSignupInvite(invite), url: signupInviteUrl(request, token) });
}

export async function DELETE(_request: Request, context: RouteContext<"/api/admin/signup-invites/[inviteid]">) {
  const auth = await requirePlatformAdmin();
  if (!auth.ok) return auth.response;
  const { inviteid: inviteId } = await context.params;

  const { count } = await prisma.gymSignupInvite.updateMany({
    where: { id: inviteId, usedAt: null, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  if (!count) return NextResponse.json({ error: "Signup link not found, or it was already used or revoked." }, { status: 404 });

  return NextResponse.json({ id: inviteId, revoked: true });
}
