import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { verifyPassword } from "@/app/api/auth/password";
import { createSession, setSessionCookie } from "@/app/api/auth/session";

export const runtime = "nodejs";

type LoginInput = {
  email: string;
  password: string;
};

/** Verifies password credentials and returns the caller's active workspaces. */
export async function POST(request: Request) {
  let body: Partial<LoginInput>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (
    typeof body.email !== "string" || !body.email.trim() ||
    typeof body.password !== "string" || !body.password
  ) {
    return NextResponse.json({ error: "email and password are required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: body.email.trim().toLowerCase() },
    select: {
      id: true,
      fullName: true,
      email: true,
      passwordHash: true,
      gymUsers: {
        where: { isActive: true, gym: { isActive: true } },
        orderBy: { createdAt: "asc" },
        select: {
          role: true,
          gym: { select: { id: true, name: true, timezone: true } },
        },
      },
    },
  });

  if (!user || !user.passwordHash || !(await verifyPassword(body.password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  if (user.gymUsers.length === 0) {
    return NextResponse.json({ error: "You do not have access to an active gym." }, { status: 403 });
  }

  const gyms = user.gymUsers.map(({ gym, role }) => ({ ...gym, role }));

  const token = await createSession(user.id, gyms[0].id);
  const response = NextResponse.json({
    user: { id: user.id, fullName: user.fullName, email: user.email },
    gyms,
    defaultGym: gyms[0],
  });
  setSessionCookie(response, token);

  return response;
}
