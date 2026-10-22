import { NextResponse } from "next/server";
import { clearSessionCookie, deleteCurrentSession, getSession } from "@/app/api/auth/session";
import { isPlatformAdmin } from "@/app/lib/platform-admin";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  return NextResponse.json({ ...session, isPlatformAdmin: isPlatformAdmin(session.user.email) });
}

export async function DELETE() {
  await deleteCurrentSession();
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}
