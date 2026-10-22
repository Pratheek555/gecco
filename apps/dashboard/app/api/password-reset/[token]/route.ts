import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { hashPassword, isValidPassword } from "@/app/api/auth/password";
import { hashResetToken } from "@/app/api/auth/password-reset";

export const runtime = "nodejs";

const INVALID_LINK = "This reset link is invalid or has expired. Request a new one.";

function findUsableToken(token: string) {
  return prisma.passwordResetToken.findFirst({
    where: { tokenHash: hashResetToken(token), usedAt: null, expiresAt: { gt: new Date() } },
    select: { id: true, userId: true, user: { select: { email: true } } },
  });
}

/** Lets the reset page check the link before the user types a new password. */
export async function GET(_request: Request, context: RouteContext<"/api/password-reset/[token]">) {
  const { token } = await context.params;
  const resetToken = await findUsableToken(token);

  if (!resetToken) {
    return NextResponse.json({ error: INVALID_LINK }, { status: 404 });
  }

  return NextResponse.json({ email: resetToken.user.email });
}

/** Sets the new password, burns the link, and signs the account out everywhere. */
export async function POST(request: Request, context: RouteContext<"/api/password-reset/[token]">) {
  const { token } = await context.params;
  let body: { password?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!isValidPassword(body.password)) {
    return NextResponse.json({ error: "Choose a password of at least 8 characters." }, { status: 400 });
  }

  const resetToken = await findUsableToken(token);
  if (!resetToken) {
    return NextResponse.json({ error: INVALID_LINK }, { status: 404 });
  }

  const passwordHash = await hashPassword(body.password);

  const updated = await prisma.$transaction(async (tx) => {
    // Claim the token atomically so two concurrent submissions cannot both succeed.
    const claimed = await tx.passwordResetToken.updateMany({
      where: { id: resetToken.id, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    });
    if (claimed.count === 0) return false;

    await tx.user.update({ where: { id: resetToken.userId }, data: { passwordHash } });
    await tx.passwordResetToken.deleteMany({ where: { userId: resetToken.userId, usedAt: null } });
    await tx.session.deleteMany({ where: { userId: resetToken.userId } });
    return true;
  });

  if (!updated) {
    return NextResponse.json({ error: INVALID_LINK }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
