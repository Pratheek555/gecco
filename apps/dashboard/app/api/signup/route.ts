import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { normalizeEmail } from "@/app/api/auth/email";
import { hashPassword, isValidPassword } from "@/app/api/auth/password";
import { createSession, setSessionCookie } from "@/app/api/auth/session";

function isValidTimezone(value: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export const runtime = "nodejs";

type SignupInput = {
  fullName: string;
  email: string;
  password: string;
  gymName: string;
  timezone?: string;
};

export async function POST(request: Request) {
  let body: Partial<SignupInput>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const { email, fullName, password, gymName, timezone } = body;

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
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }

    throw error;
  }
}
