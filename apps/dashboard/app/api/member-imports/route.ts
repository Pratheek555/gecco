import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { requirePermission } from "@/app/api/auth/authorization";
import {
  getImportFileExtension,
  importFileTypes,
  MAX_IMPORT_FILE_SIZE,
  serializeImport,
} from "./shared";

export const runtime = "nodejs";

type CreateImportBody = {
  fileName?: unknown;
  fileSize?: unknown;
  correctionForId?: unknown;
};

function getR2Config() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const bucket = process.env.R2_BUCKET_NAME;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const endpoint =
    process.env.R2_ENDPOINT ??
    (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

  if (!bucket || !accessKeyId || !secretAccessKey || !endpoint) return null;
  return { bucket, accessKeyId, secretAccessKey, endpoint };
}

export async function POST(request: Request) {
  const auth = await requirePermission("members:write");
  if (!auth.ok) return auth.response;

  let body: CreateImportBody;
  try {
    body = (await request.json()) as CreateImportBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof body.fileName !== "string" || typeof body.fileSize !== "number") {
    return NextResponse.json({ error: "File name and size are required." }, { status: 400 });
  }
  if (!body.fileName.trim() || body.fileName.length > 255) {
    return NextResponse.json(
      { error: "The file name must be 255 characters or fewer." },
      { status: 400 },
    );
  }

  const extension = getImportFileExtension(body.fileName);
  if (!extension) {
    return NextResponse.json({ error: "Choose a CSV or XLSX spreadsheet." }, { status: 400 });
  }
  if (
    !Number.isInteger(body.fileSize) ||
    body.fileSize <= 0 ||
    body.fileSize > MAX_IMPORT_FILE_SIZE
  ) {
    return NextResponse.json(
      { error: "The spreadsheet must be no larger than 10 MB." },
      { status: 400 },
    );
  }

  const r2 = getR2Config();
  if (!r2) {
    return NextResponse.json({ error: "Spreadsheet storage is not configured." }, { status: 503 });
  }

  const importId = crypto.randomUUID();
  let correctionForId: string | undefined;
  try {
    if (body.correctionForId !== undefined) {
      if (typeof body.correctionForId !== "string") {
        return NextResponse.json({ error: "Invalid correction import." }, { status: 400 });
      }
      const parent = await prisma.memberImport.findFirst({
        where: { id: body.correctionForId, gymId: auth.session.activeGym.id },
        select: { id: true, status: true },
      });
      if (!parent || !["READY_FOR_REVIEW", "COMPLETED_WITH_ERRORS"].includes(parent.status)) {
        return NextResponse.json({ error: "The original import is not ready for corrections." }, { status: 409 });
      }
      correctionForId = parent.id;
    }
  } catch {
    return NextResponse.json(
      { error: "Correction uploads are not available until the latest database migration is deployed." },
      { status: 503 },
    );
  }
  const safeFileName = body.fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .slice(-120);
  const storageKey = `member-imports/${auth.session.activeGym.id}/${importId}/${safeFileName}`;
  const contentType = importFileTypes[extension];

  const s3 = new S3Client({
    region: "auto",
    endpoint: r2.endpoint,
    requestChecksumCalculation: "WHEN_REQUIRED",
    credentials: { accessKeyId: r2.accessKeyId, secretAccessKey: r2.secretAccessKey },
  });

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: r2.bucket,
      Key: storageKey,
      ContentType: contentType,
    }),
    { expiresIn: 10 * 60 },
  );

  let memberImport;
  try {
    memberImport = await prisma.memberImport.create({
      data: {
        id: importId,
        gymId: auth.session.activeGym.id,
        createdByUserId: auth.session.user.id,
        originalFileName: body.fileName.trim(),
        storageKey,
        contentType,
        fileSize: body.fileSize,
        correctionForId,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Correction uploads are not available until the latest database migration is deployed." },
      { status: 503 },
    );
  }

  return NextResponse.json(
    { import: serializeImport(memberImport), uploadUrl, contentType },
    { status: 201 },
  );
}
