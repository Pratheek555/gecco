import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";

const bucket = process.env.R2_BUCKET_NAME;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const endpoint =
  process.env.R2_ENDPOINT ??
  (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) {
  throw new Error("R2 configuration is incomplete.");
}

const client = new S3Client({
  region: "auto",
  endpoint,
  requestChecksumCalculation: "WHEN_REQUIRED",
  credentials: { accessKeyId, secretAccessKey },
});

await client.send(
  new PutBucketCorsCommand({
    Bucket: bucket,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedOrigins: ["http://localhost:3001", "https://dashboard.gecco.in"],
          AllowedMethods: ["PUT"],
          AllowedHeaders: ["Content-Type"],
          ExposeHeaders: ["ETag"],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  }),
);

console.log(`R2 CORS policy applied to ${bucket}.`);
