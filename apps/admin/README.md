# Gecco HQ

The Gecco team's internal console, deployed as its own Next.js / Vercel app from `apps/admin`.

- Overview: activation ladder, gyms needing follow-up, members, recorded payments and new accounts.
- With live data, the overview refreshes every minute while visible and when returning to the tab. The Refresh button fetches immediately. Background refresh pauses while a dialog is open.
- Onboarding: create, reissue and revoke single-use gym signup links, optionally restricted to an owner email.
- Gyms: search and filter the portfolio, inspect activation milestones and team seats, change seat limits and deactivate/reactivate access.
- Accounts: owner and team account creation, roles and latest available sign-in session.
- Growth: weekly and cumulative charts over 12, 26 or 52 weeks.

New owners choose their own password through the customer dashboard's invite-only signup flow. HQ never sets or displays their password. Signup links expire after 14 days; only their hashes are stored.

## Local preview

From the repository root, run `bun install`, copy `apps/admin/.env.example` to `apps/admin/.env.local`, and set `ADMIN_SAMPLE_DATA=1`. Run `bun run dev:admin` and open http://localhost:3002.

Sample mode uses deterministic fixtures, bypasses login, and rejects all mutations. It is ignored when `NODE_ENV=production`.

For live data, remove `ADMIN_SAMPLE_DATA` and configure `DATABASE_URL`, `PLATFORM_ADMIN_EMAILS`, `ADMIN_SESSION_SECRET` (at least 32 characters) and `DASHBOARD_URL`. Staff sign in using their existing Gecco email and password. Only allowlist emails whose accounts you already control; an allowlisted address grants platform-wide access. HQ uses a separate, host-only, HTTP-only cookie lasting 12 hours and rechecks the allowlist on each request.

## Separate Vercel project

1. Import this repository as a new Vercel project with root directory `apps/admin` and the Next.js framework preset.
2. Enable inclusion of files outside the root directory so the workspace package `packages/db` is available.
3. Use `bun install` for installation and `bun run build` for the build. The build generates the shared Prisma client before building Next.js.
4. Add the four live environment variables above. `DATABASE_URL` must reference the same database as the customer dashboard; `DASHBOARD_URL` must be that dashboard's public origin. Use a separate random `ADMIN_SESSION_SECRET` for HQ.
5. Apply the shared Prisma migrations, including `20261022120000_gym_signup_invites`, through your normal database release process before using the live console. From `packages/db`, the command is `bunx prisma migrate deploy`.
6. Assign the new project its own hostname, for example `hq.gecco.in`.

Do not set `ADMIN_SAMPLE_DATA` in Vercel. The app fails closed without a staff allowlist. Deployment and database migrations are separate from the build and have not been run by the design preview.

## Metric definitions and limits

- Weeks start Monday at 00:00 UTC. Headline comparisons use four completed weeks versus the previous four; charts dim the unfinished current week.
- Payments are succeeded gym payments in rupees, grouped by `paidOn`. They are gym collections, not Gecco subscription revenue. Historical collections include deactivated gyms.
- Active members means records with status `ACTIVE` at enabled gyms; it does not infer subscription expiry.
- The activation ladder is sequential: signup, first member, first payment, first team invitation, then activity within seven days. A gym still missing an earlier step remains in onboarding even if someone recently signed in.
- Sign-in information comes from sessions still stored in the database. It is not a permanent login audit log; expired/deleted sessions can remove historical evidence.
- The loader reads all gyms and accounts, with grouped activity queries and up to 500 recent signup links. At larger scale, move filtering/pagination into database queries and add a durable audit log.

## Checks

From `apps/admin`: `bun run lint`, `bun x tsc --noEmit`, `bun test`, and `bun run build`.

Charts are adapted from the MIT-licensed taste-skill helper; see `THIRD_PARTY_NOTICES.md`.
