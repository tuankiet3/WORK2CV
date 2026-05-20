# Work2CV CI/CD Spec

## Purpose

This file defines the CI/CD expectations for Work2CV.

## CI Goals

Every pull request and main branch push should verify:

- dependencies install cleanly
- lint passes
- production build passes

## Default CI Workflow

Workflow path:

```text
.github/workflows/ci.yml
```

Triggers:

- pull requests targeting `main`
- pushes to `main`

Required jobs:

- checkout repository
- setup Node.js
- install with `npm ci`
- run `npm run lint`
- run `npm run build`

Recommended Node version:

```text
20.x
```

## Deployment Flow

Recommended:

1. GitHub Actions runs CI.
2. Vercel GitHub integration creates preview deployments for pull requests.
3. Vercel deploys production from `main`.

Do not duplicate Vercel deployment in GitHub Actions unless the user explicitly wants token-based Vercel CLI deployment.

## Required Secrets

For CI-only:

- No secrets required.

For Vercel Git integration:

- Configure secrets and environment variables in Vercel dashboard, not GitHub Actions.

For future token-based deploy workflow:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Only add those when token-based deployment is explicitly requested.

## Database CI/CD Notes

Before database features exist:

- CI only needs lint and build.

After Prisma is added:

- Add `npx prisma validate`.
- Add `npx prisma generate`.

After Supabase/Prisma database features are added:

- Do not run destructive migrations automatically.
- Prefer manual migration during early MVP.
- If migration automation is later added, require explicit review and production safeguards.

## Branch Policy

Recommended:

- `main`: production deployment branch
- feature branches: preview deployment branches
- pull requests: must pass CI before merge

## Agent Rules For CI/CD

When changing CI/CD:

- Inspect package scripts first.
- Keep workflows minimal.
- Use official GitHub Actions where possible.
- Pin broad stable versions like `actions/checkout@v4` and `actions/setup-node@v4`.
- Use `npm ci`, not `npm install`, in CI.
- Do not add deployment tokens unless explicitly requested.
- Run or reason through all workflow steps locally when possible.



