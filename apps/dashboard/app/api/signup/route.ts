import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { normalizeEmail } from "@/app/api/auth/email";
import { hashPassword, isValidPassword } from "@/app/api/auth/password";
import { createSession, setSessionCookie } from "@/app/api/auth/session";
import { pendingSignupInviteWhere } from "@/app/lib/signup-invites";
import { hashInviteToken, TeamError } from "@/app/lib/team";
import { isValidTimezone } from "@/app/lib/timezones";

export const runtime = "nodejs";

type SignupInput = {
  fullName: string;
  email: string;
  password: string;
  gymName: string;
  timezone?: string;
  /** Token from the single-use signup link the Gecco team issued. */
  token: string;
};

export async function POST(request: Request) {
  let body: Partial<SignupInput>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const { email, fullName, password, gymName, timezone, token } = body;

  if (typeof token !== "string" || !token) {
    return NextResponse.json(
      { error: "Gecco is invite-only. Contact the Gecco team to get your gym set up." },
      { status: 403 },
    );
  }

  const normalizedEmail = normalizeEmail(email);
  if (
    !normalizedEmail ||
    typeof fullName !== "string" || fullName.trim().length < 2 || fullName.trim().length > 100 ||
    !isValidPassword(password) ||
    typeof gymName !== "string" || gymName.trim().length < 2 || gymName.trim().length > 100 ||
    (timezone !== undefined && (typeof timezone !== "string" || !isValidTimezone(timezone.trim())))
  ) {
    return NextResponse.json(
      { error: "A valid email, your name, a gym name, and a password of at least 8 characters are required." },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(password);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const invite = await tx.gymSignupInvite.findFirst({
        where: { tokenHash: hashInviteToken(token), ...pendingSignupInviteWhere() },
        select: { id: true, email: true, seatLimit: true },
      });
      if (!invite) {
        throw new TeamError("This signup link has expired, was revoked, or was already used. Ask the Gecco team for a new one.", 410);
      }
      if (invite.email && invite.email !== normalizedEmail) {
        throw new TeamError("This signup link was issued for a different email address.", 403);
      }

      const user = await tx.user.create({
        data: {
          authSubject: `password:${crypto.randomUUID()}`,
          email: normalizedEmail,
          fullName: fullName.trim(),
          passwordHash,
        },
      });

      const gym = await tx.gym.create({
        data: {
          name: gymName.trim(),
          timezone: timezone?.trim() || "Asia/Kolkata",
          seatLimit: invite.seatLimit,
        },
      });

      await tx.gymUser.create({
        data: {
          gymId: gym.id,
          userId: user.id,
          role: "OWNER",
        },
      });

      await tx.paymentMode.createMany({
        data: [
          { gymId: gym.id, name: "Cash", sortOrder: 0 },
          { gymId: gym.id, name: "UPI", sortOrder: 1 },
        ],
      });

      await tx.paymentRecipient.create({
        data: {
          gymId: gym.id,
          displayName: gym.name,
          recipientType: "GYM",
        },
      });

      // Conditional claim so two people racing on the same link cannot both create a gym.
      const claimed = await tx.gymSignupInvite.updateMany({
        where: { id: invite.id, ...pendingSignupInviteWhere() },
        data: { usedAt: new Date(), gymId: gym.id },
      });
      if (!claimed.count) throw new TeamError("This signup link was already used.", 410);

      return { userId: user.id, gymId: gym.id };
    }, {
      maxWait: 10_000,
      timeout: 20_000,
    });

    // Sign the owner straight in so onboarding can continue inside the new workspace.
    const response = NextResponse.json(result, { status: 201 });
    setSessionCookie(response, await createSession(result.userId, result.gymId));
    return response;
  } catch (error) {
    if (error instanceof TeamError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }

    throw error;
  }
}
