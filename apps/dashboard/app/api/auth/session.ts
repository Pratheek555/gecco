import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { prisma } from "db/client";

export const SESSION_COOKIE = "gecco_session";
const SESSION_LIFETIME_SECONDS = 60 * 60 * 24 * 7;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("base64url");
}

export async function createSession(userId: string, activeGymId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_LIFETIME_SECONDS * 1000);

  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      activeGymId,
      expiresAt,
    },
  });

  return token;
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_LIFETIME_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findFirst({
    where: {
      tokenHash: hashToken(token),
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      activeGymId: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          gymUsers: {
            where: { isActive: true, gym: { isActive: true } },
            select: { role: true, gym: { select: { id: true, name: true, timezone: true } } },
          },
        },
      },
    },
  });

  if (!session || !session.activeGymId) return null;

  const gyms = session.user.gymUsers.map(({ gym, role }) => ({ ...gym, role }));
  const activeGym = gyms.find((gym) => gym.id === session.activeGymId);
  if (!activeGym) return null;

  return {
    id: session.id,
    expiresAt: session.expiresAt,
    user: {
      id: session.user.id,
      fullName: session.user.fullName,
      email: session.user.email,
      gymUsers: {
        role: activeGym.role
      }
    },
    gyms,
    activeGym,
  };
}

export async function deleteCurrentSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
}
