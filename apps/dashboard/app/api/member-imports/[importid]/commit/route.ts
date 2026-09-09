import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { getAuthorizedImport } from "../../shared";

export async function POST(
  request: Request,
  context: RouteContext<"/api/member-imports/[importid]/commit">,
) {
  const { importid } = await context.params;
  const result = await getAuthorizedImport(importid, "members:write");
  if (!result.ok) return result.response;

  let body: { correctionImportId?: unknown } = {};
  try {
    body = (await request.json()) as { correctionImportId?: unknown };
  } catch {
    // An original import with no correction rows can still be committed.
  }

  if (!["READY_FOR_REVIEW", "COMPLETED_WITH_ERRORS"].includes(result.memberImport.status)) {
    return NextResponse.json({ error: "This import is not ready to finish." }, { status: 409 });
  }
  if (result.memberImport.excludedRows > 0 && typeof body.correctionImportId !== "string") {
    return NextResponse.json({ error: "Correct the excluded rows before finishing this import." }, { status: 409 });
  }

  let correctionImportId: string | null = null;
  if (typeof body.correctionImportId === "string") {
    const correction = await prisma.memberImport.findFirst({
      where: {
        id: body.correctionImportId,
        gymId: result.memberImport.gymId,
        correctionForId: result.memberImport.id,
        status: "READY_FOR_REVIEW",
      },
      select: { id: true, excludedRows: true },
    });
    if (!correction) return NextResponse.json({ error: "The corrected spreadsheet is not ready." }, { status: 409 });
    correctionImportId = correction.id;
  }

  const workerUrl = process.env.IMPORT_WORKER_URL;
  const workerSecret = process.env.IMPORT_WORKER_SECRET;
  if (!workerUrl || !workerSecret) {
    return NextResponse.json({ error: "Import processing is not configured." }, { status: 503 });
  }

  await prisma.memberImport.update({
    where: { id: result.memberImport.id },
    data: { status: "COMMITTING", failureMessage: null },
  });

  try {
    const response = await fetch(`${workerUrl.replace(/\/$/, "")}/enqueue`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${workerSecret}`,
      },
      body: JSON.stringify({
        kind: "commit",
        importId: result.memberImport.id,
        correctionImportId,
      }),
    });
    if (!response.ok) throw new Error(`Worker returned ${response.status}`);
  } catch {
    await prisma.memberImport.updateMany({
      where: { id: result.memberImport.id, status: "COMMITTING" },
      data: { status: "READY_FOR_REVIEW" },
    });
    return NextResponse.json({ error: "Could not start the member import." }, { status: 502 });
  }

  return NextResponse.json({ status: "COMMITTING" }, { status: 202 });
}
