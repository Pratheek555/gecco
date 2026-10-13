import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { normalizeEmail } from "@/app/api/auth/email";
import { hashPassword, isValidPassword, verifyPassword } from "@/app/api/auth/password";
import { effectivePermissions } from "@/app/api/auth/permissions";
import { createSession, getSession, setSessionCookie } from "@/app/api/auth/session";
import { firstAllowedPath } from "@/app/lib/navigation-access";
import { hashInviteToken, lockGymSeats, pendingInviteWhere, readObject, TeamError } from "@/app/lib/team";

export const runtime = "nodejs";

type Acceptor =
  | { kind: "existing"; userId: string; viaSession: boolean }
  | { kind: "new"; fullName: string; email: string; passwordHash: string };

/**
 * Accepts an invite as the signed-in user ("session"), an existing account
 * ("existing": email + password), or a brand new account ("new").
 */
export async function POST(request: Request, context: RouteContext<"/api/invites/[token]/accept">) {
  const { token } = await context.params;
  let body: Record<string, unknown> | null;
  try {
    body = readObject(await request.json());
  } catch {
    body = null;
  }
  if (!body) return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });

  let acceptor: Acceptor;
  if (body.mode === "session") {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Sign in to accept this invite." }, { status: 401 });
    acceptor = { kind: "existing", userId: session.user.id, viaSession: true };
  } else if (body.mode === "existing") {
    const email = normalizeEmail(body.email);
    const user = email
      ? await prisma.user.findUnique({ where: { email }, select: { id: true, passwordHash: true } })
      : null;
    if (
      !user?.passwordHash ||
      typeof body.password !== "string" ||
      !(await verifyPassword(body.password, user.passwordHash))
    ) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    acceptor = { kind: "existing", userId: user.id, viaSession: false };
  } else if (body.mode === "new") {
    const email = normalizeEmail(body.email);
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    if (!email || fullName.length < 2 || fullName.length > 100 || !isValidPassword(body.password)) {
      return NextResponse.json(
        { error: "Enter your name, a valid email, and a password of at least 8 characters." },
        { status: 400 },
      );
    }
    if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
      return NextResponse.json(
        { error: "An account with this email already exists. Sign in with it to accept the invite." },
        { status: 409 },
      );
    }
    acceptor = { kind: "new", fullName, email, passwordHash: await hashPassword(body.password) };
  } else {
    return NextResponse.json({ error: "mode must be session, existing, or new." }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const invite = await tx.gymInvite.findFirst({
          where: { tokenHash: hashInviteToken(token), ...pendingInviteWhere(), gym: { isActive: true } },
          select: { id: true, gymId: true, role: true, permissions: true, memberScope: true, trainerId: true },
        });
        if (!invite) throw new TeamError("This invite has expired, was revoked, or was already used.", 410);

        const user =
          acceptor.kind === "new"
            ? await tx.user.create({
                data: {
                  authSubject: `password:${crypto.randomUUID()}`,
                  email: acceptor.email,
                  fullName: acceptor.fullName,
                  passwordHash: acceptor.passwordHash,
                },
                select: { id: true, fullName: true },
              })
            : await tx.user.findUniqueOrThrow({ where: { id: acceptor.userId }, select: { id: true, fullName: true } });

        const seats = await lockGymSeats(tx, invite.gymId);
        const existing = await tx.gymUser.findUnique({
          where: { gymId_userId: { gymId: invite.gymId, userId: user.id } },
          select: { isActive: true },
        });
        if (existing?.isActive) throw new TeamError("You are already part of this gym.", 409);
        // This invite was holding one of the counted seats, so only active members need to fit.
        if (seats.activeMembers >= seats.seatLimit) {
          throw new TeamError("This gym has no free team seats. Ask the owner to free one up.", 409);
        }

        const claimed = await tx.gymInvite.updateMany({
          where: { id: invite.id, acceptedAt: null, revokedAt: null },
          data: { acceptedAt: new Date(), acceptedByUserId: user.id },
        });
        if (!claimed.count) throw new TeamError("This invite was already used.", 410);

        const access = { role: invite.role, permissions: invite.permissions, memberScope: invite.memberScope };
        await tx.gymUser.upsert({
          where: { gymId_userId: { gymId: invite.gymId, userId: user.id } },
          create: { gymId: invite.gymId, userId: user.id, ...access },
          update: { ...access, isActive: true },
        });

        if (invite.role === "TRAINER") {
          const ownTrainer = await tx.trainer.findFirst({
            where: { gymId: invite.gymId, userId: user.id },
            select: { id: true },
          });
          if (!ownTrainer) {
            const linked = invite.trainerId
              ? await tx.trainer.updateMany({
                  where: { id: invite.trainerId, gymId: invite.gymId, userId: null },
                  data: { userId: user.id },
                })
              : { count: 0 };
            if (!linked.count) {
              await tx.trainer.create({ data: { gymId: invite.gymId, userId: user.id, fullName: user.fullName } });
            }
          }
        }

        return { userId: user.id, gymId: invite.gymId, ...access };
      },
      { maxWait: 10_000, timeout: 20_000 },
    );

    const redirectTo = firstAllowedPath(effectivePermissions(result.role, result.permissions, result.memberScope));
    const response = NextResponse.json({ redirectTo });

    const session = acceptor.kind === "existing" && acceptor.viaSession ? await getSession() : null;
    if (session) {
      await prisma.session.update({ where: { id: session.id }, data: { activeGymId: result.gymId } });
    } else {
      setSessionCookie(response, await createSession(result.userId, result.gymId));
    }
    return response;
  } catch (error) {
    if (error instanceof TeamError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    throw error;
  }
}
