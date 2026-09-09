import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { requirePermission } from "@/app/api/auth/authorization";

export const MAX_IMPORT_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_IMPORT_ROWS = 10_000;

export const importFileTypes = {
  csv: "text/csv",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
} as const;

export type ImportFileExtension = keyof typeof importFileTypes;

export function getImportFileExtension(fileName: string): ImportFileExtension | null {
  const extension = fileName.trim().toLowerCase().split(".").pop();
  return extension === "csv" || extension === "xlsx" ? extension : null;
}

export function serializeImport(memberImport: {
  id: string;
  originalFileName: string;
  fileSize: number;
  status: string;
  totalRows: number;
  processedRows: number;
  validRows: number;
  excludedRows: number;
  importedRows: number;
  correctionForId: string | null;
  failureMessage: string | null;
  createdAt: Date;
  completedAt: Date | null;
}) {
  return {
    ...memberImport,
    createdAt: memberImport.createdAt.toISOString(),
    completedAt: memberImport.completedAt?.toISOString() ?? null,
  };
}

export async function getAuthorizedImport(
  importId: string,
  permission: "members:read" | "members:write",
) {
  const auth = await requirePermission(permission);
  if (!auth.ok) return auth;

  const memberImport = await prisma.memberImport.findFirst({
    where: { id: importId, gymId: auth.session.activeGym.id },
  });

  if (!memberImport) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Import not found." }, { status: 404 }),
    };
  }

  return { ok: true as const, auth, memberImport };
}
