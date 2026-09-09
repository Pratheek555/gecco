import { prisma } from "db/client";
import { getAuthorizedImport } from "../../shared";

function csvCell(value: unknown) {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(
  _request: Request,
  context: RouteContext<"/api/member-imports/[importid]/report">,
) {
  const { importid } = await context.params;
  const result = await getAuthorizedImport(importid, "members:read");
  if (!result.ok) return result.response;

  const rows = await prisma.memberImportRow.findMany({
    where: { importId: result.memberImport.id, status: "EXCLUDED" },
    orderBy: { rowNumber: "asc" },
    select: { normalizedData: true },
  });

  const headers = [
    "member_id",
    "full_name",
    "joined_on",
    "status",
    "phone",
    "email",
    "whatsapp",
  ];
  const lines = rows.map((row) => {
    const data = row.normalizedData as Record<string, unknown>;
    return [
      data.member_id,
      data.full_name,
      data.joined_on,
      data.status,
      data.phone,
      data.email,
      data.whatsapp,
    ]
      .map(csvCell)
      .join(",");
  });

  const csv = `\uFEFF${headers.map(csvCell).join(",")}\r\n${lines.join("\r\n")}`;
  const baseName = result.memberImport.originalFileName
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .slice(0, 100);
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${baseName.replaceAll('"', "")}-excluded-rows.csv"`,
      "cache-control": "private, no-store",
    },
  });
}
