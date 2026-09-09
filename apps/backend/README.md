# Member import worker

This Cloudflare Worker accepts authenticated enqueue requests and validates member CSV/XLSX files from R2 through Cloudflare Queues. It records progress and row-level validation results in Neon. It does not create members.

## Cloudflare resources

The checked-in `wrangler.jsonc` expects these resources:

- R2 bucket: `gecco`
- Queue: `gecco-member-imports`
- Dead-letter queue: `gecco-member-imports-dlq`

If the existing Cloudflare resources use different names, update `wrangler.jsonc` before deployment.

```bash
bunx wrangler r2 bucket create gecco
bunx wrangler queues create gecco-member-imports
bunx wrangler queues create gecco-member-imports-dlq
```

Copy `.dev.vars.example` to `.dev.vars` for local development. Set production secrets without committing them:

```bash
bunx wrangler secret put DATABASE_URL
bunx wrangler secret put IMPORT_WORKER_SECRET
```

Run and deploy:

```bash
bun run dev
bun run deploy
```

The R2 bucket must allow browser `PUT` requests from the dashboard origins. Apply the checked-in policy:

```bash
bunx wrangler r2 bucket cors set gecco --file r2-cors.json
bunx wrangler r2 bucket cors list gecco
```

The equivalent dashboard policy is:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3001", "https://dashboard.gecco.in"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Configure an R2 lifecycle rule for the `member-imports/` prefix that expires objects after 7 days. The Worker cron removes import history and row-level results from Neon after 30 days.
