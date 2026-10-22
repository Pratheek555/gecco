import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { normalizeEmail } from "@/app/api/auth/email";
import { sendEmail } from "@/app/api/auth/mailer";
import {
  createResetToken,
  RESET_REQUEST_COOLDOWN_SECONDS,
  resetEmail,
  resetUrl,
} from "@/app/api/auth/password-reset";

export const runtime = "nodejs";

const SENT_MESSAGE = "If an account exists for that email, a reset link is on its way.";

/**
 * Emails a single-use reset link. The response is identical whether or not the
 * account exists so the endpoint cannot be used to discover registered emails.
 */
export async function POST(request: Request) {
  let body: { email?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  if (!email) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, fullName: true, email: true },
  });

  if (user) {
    const recentRequest = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        createdAt: { gt: new Date(Date.now() - RESET_REQUEST_COOLDOWN_SECONDS * 1000) },
      },
      select: { id: true },
    });

    if (!recentRequest) {
      const { token, tokenHash, expiresAt } = createResetToken();

      // Only the newest link should work.
      await prisma.$transaction([
        prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
        prisma.passwordResetToken.create({ data: { tokenHash, userId: user.id, expiresAt } }),
      ]);

      try {
        await sendEmail({ to: user.email, ...resetEmail(user.fullName, resetUrl(request, token)) });
      } catch (error) {
        console.error("Failed to send password reset email", error);
        return NextResponse.json(
          { error: "We could not send the reset email right now. Please try again shortly." },
          { status: 502 },
        );
      }
    }
  }

  return NextResponse.json({ message: SENT_MESSAGE });
}
