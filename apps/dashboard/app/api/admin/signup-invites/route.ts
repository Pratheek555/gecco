import { NextResponse } from "next/server";
import { prisma } from "db/client";
import { normalizeEmail } from "@/app/api/auth/email";
import { requirePlatformAdmin } from "@/app/lib/platform-admin";
import {
  createSignupToken,
  MAX_SEAT_LIMIT,
  signupInviteExpiry,
  signupInviteSelect,
  signupInviteUrl,
  toSignupInvite,
} from "@/app/lib/signup-invites";
import { readObject } from "@/app/lib/team";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requirePlatformAdmin();
  if (!auth.ok) return auth.response;

  const invites = await prisma.gymSignupInvite.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: signupInviteSelect,
  });
  return NextResponse.json({ invites: invites.map(toSignupInvite) });
}

function optionalText(value: unknown, field: string, max: number) {
  if (value == null || value === "") return { value: null };
  if (typeof value !== "string") return { error: `${field} must be a string.` };
  const trimmed = value.trim();
  if (trimmed.length > max) return { error: `${field} must be at most ${max} characters.` };
  return { value: trimmed || null };
}

export async function POST(request: Request) {
  const auth = await requirePlatformAdmin();
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown> | null;
  try {
    body = readObject(await request.json());
  } catch {
    body = null;
  }
  if (!body) return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });

  const gymName = optionalText(body.gymName, "Gym name", 100);
  const note = optionalText(body.note, "Note", 500);
  for (const field of [gymName, note]) {
    if ("error" in field) return NextResponse.json({ error: field.error }, { status: 400 });
  }

  let email: string | null = null;
  if (body.email != null && body.email !== "") {
    email = normalizeEmail(body.email);
    if (!email) return NextResponse.json({ error: "Enter a valid owner email, or leave it blank." }, { status: 400 });
    if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }
  }

  const seatLimit = body.seatLimit ?? 5;
  if (typeof seatLimit !== "number" || !Number.isInteger(seatLimit) || seatLimit < 0 || seatLimit > MAX_SEAT_LIMIT) {
    return NextResponse.json({ error: `Seat limit must be a whole number from 0 to ${MAX_SEAT_LIMIT}.` }, { status: 400 });
  }

  const { token, tokenHash } = createSignupToken();
  const invite = await prisma.gymSignupInvite.create({
    data: {
      tokenHash,
      gymName: gymName.value,
      email,
      seatLimit,
      note: note.value,
      createdByUserId: auth.session.user.id,
      expiresAt: signupInviteExpiry(),
    },
    select: signupInviteSelect,
  });

  return NextResponse.json({ invite: toSignupInvite(invite), url: signupInviteUrl(request, token) }, { status: 201 });
}
