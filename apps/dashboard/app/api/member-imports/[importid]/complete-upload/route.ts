import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { prisma } from "db/client";
import { NextResponse } from "next/server";
import { getAuthorizedImport } from "../../shared";

export const runtime = "nodejs";

function getWorkerConfig() {
  const workerUrl = process.env.IMPORT_WORKER_URL;
  const workerSecret = process.env.IMPORT_WORKER_SECRET;
  const bucket = process.env.R2_BUCKET_NAME;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const endpoint =
    process.env.R2_ENDPOINT ??
    (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);
  if (!workerUrl || !workerSecret || !bucket || !endpoint || !accessKeyId || !secretAccessKey)
    return null;
  return { workerUrl, workerSecret, bucket, endpoint, accessKeyId, secretAccessKey };
}

export async function POST(
  _request: Request,
  context: RouteContext<"/api/member-imports/[importid]/complete-upload">,
) {
  const { importid } = await context.params;
  const result = await getAuthorizedImport(importid, "members:write");
  if (!result.ok) return result.response;

  if (result.memberImport.status !== "UPLOADING") {
    return NextResponse.json({ error: "This spreadsheet was already submitted." }, { status: 409 });
  }

  const config = getWorkerConfig();
  if (!config) {
    return NextResponse.json({ error: "Import processing is not configured." }, { status: 503 });
  }

  const s3 = new S3Client({
    region: "auto",
    endpoint: config.endpoint,
    requestChecksumCalculation: "WHEN_REQUIRED",
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
  });

  try {
    const object = await s3.send(
      new HeadObjectCommand({ Bucket: config.bucket, Key: result.memberImport.storageKey }),
    );
    if (object.ContentLength !== result.memberImport.fileSize) {
      return NextResponse.json({ error: "The uploaded file size did not match." }, { status: 400 });
    }
  } catch {
    return NextResponse.json(
      { error: "The spreadsheet upload could not be verified." },
      { status: 400 },
    );
  }

  await prisma.memberImport.update({
    where: { id: result.memberImport.id },
    data: { status: "QUEUED", failureMessage: null },
  });

  try {
    const response = await fetch(`${config.workerUrl.replace(/\/$/, "")}/enqueue`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.workerSecret}`,
      },
      body: JSON.stringify({ importId: result.memberImport.id }),
    });
    if (!response.ok) throw new Error(`Worker returned ${response.status}`);
  } catch {
    await prisma.memberImport.updateMany({
      where: { id: result.memberImport.id, status: "QUEUED" },
      data: { status: "UPLOADING" },
    });
    return NextResponse.json({ error: "Could not start spreadsheet validation." }, { status: 502 });
  }

  return NextResponse.json({ importId: result.memberImport.id, status: "QUEUED" }, { status: 202 });
}
