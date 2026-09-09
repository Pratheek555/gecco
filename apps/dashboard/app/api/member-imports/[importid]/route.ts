import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { getAuthorizedImport, serializeImport } from "../shared";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/member-imports/[importid]">,
) {
  const { importid } = await context.params;
  const result = await getAuthorizedImport(importid, "members:read");
  if (!result.ok) return result.response;
  return NextResponse.json({ import: serializeImport(result.memberImport) });
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/member-imports/[importid]">,
) {
  const { importid } = await context.params;
  const result = await getAuthorizedImport(importid, "members:write");
  if (!result.ok) return result.response;

  if (!["UPLOADING", "READY_FOR_REVIEW", "FAILED"].includes(result.memberImport.status)) {
    return NextResponse.json({ error: "This import can no longer be cancelled." }, { status: 409 });
  }

  await prisma.memberImport.update({
    where: { id: result.memberImport.id },
    data: { status: "CANCELLED" },
  });
  return new NextResponse(null, { status: 204 });
}
