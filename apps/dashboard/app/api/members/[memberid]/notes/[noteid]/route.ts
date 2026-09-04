import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { requirePermission } from "@/app/api/auth/authorization";

export const runtime = "nodejs";

async function getScopedNote(noteId: string, memberId: string, gymId: string) {
  return prisma.memberNote.findFirst({
    where: { id: noteId, memberId, member: { gymId } },
    select: { id: true },
  });
}

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/members/[memberid]/notes/[noteid]">,
) {
  const auth = await requirePermission("members:write");
  if (!auth.ok) return auth.response;
  const { memberid: memberId, noteid: noteId } = await context.params;
  let payload: { body?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const body = typeof payload.body === "string" ? payload.body.trim() : "";
  if (!body || body.length > 2_000)
    return NextResponse.json(
      { error: "Remark must be between 1 and 2,000 characters." },
      { status: 400 },
    );
  const note = await getScopedNote(noteId, memberId, auth.session.activeGym.id);
  if (!note) return NextResponse.json({ error: "Remark not found." }, { status: 404 });
  return NextResponse.json(
    await prisma.memberNote.update({
      where: { id: note.id },
      data: { body },
      select: { id: true, body: true, createdAt: true, createdBy: { select: { fullName: true } } },
    }),
  );
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/members/[memberid]/notes/[noteid]">,
) {
  const auth = await requirePermission("members:write");
  if (!auth.ok) return auth.response;
  const { memberid: memberId, noteid: noteId } = await context.params;
  const note = await getScopedNote(noteId, memberId, auth.session.activeGym.id);
  if (!note) return NextResponse.json({ error: "Remark not found." }, { status: 404 });
  await prisma.memberNote.delete({ where: { id: note.id } });
  return NextResponse.json({ id: note.id, deleted: true });
}
