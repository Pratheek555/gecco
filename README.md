# Gecco

Gecco is a Bun-powered Turborepo containing two independently deployable Next.js applications.

## Applications

- `apps/website` — the public marketing website, served on port 3000 locally.
- `apps/dashboard` — the management dashboard, served on port 3001 locally.

## Getting started

Install dependencies and start both applications from the repository root:

```bash
bun install
bun run dev
```

You can also run one application at a time:

```bash
bun run dev:website
bun run dev:dashboard
```

Set `NEXT_PUBLIC_DASHBOARD_URL` for the website deployment so its dashboard links point to the deployed dashboard origin. It defaults to `http://localhost:3001` in local development.

## Validation

```bash
bun run lint
bun run build
```
