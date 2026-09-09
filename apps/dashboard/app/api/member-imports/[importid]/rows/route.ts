import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { getAuthorizedImport } from "../../shared";

export async function GET(
  request: Request,
  context: RouteContext<"/api/member-imports/[importid]/rows">,
) {
  const { importid } = await context.params;
  const result = await getAuthorizedImport(importid, "members:read");
  if (!result.ok) return result.response;

  const url = new URL(request.url);
  const requestedStatus = url.searchParams.get("status");
  const status = requestedStatus === "VALID" ? "VALID" : "EXCLUDED";
  const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number.parseInt(url.searchParams.get("pageSize") ?? "50", 10) || 50),
  );

  const [rows, total] = await Promise.all([
    prisma.memberImportRow.findMany({
      where: { importId: result.memberImport.id, status },
      orderBy: { rowNumber: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        rowNumber: true,
        memberId: true,
        fullName: true,
        normalizedData: true,
        errors: true,
      },
    }),
    prisma.memberImportRow.count({ where: { importId: result.memberImport.id, status } }),
  ]);

  return NextResponse.json({ rows, total, page, pageSize });
}
