# Work2CV Deployment Plan

## Deployment Decision

Default deployment target for Work2CV:

- App hosting: Vercel Hobby plan
- CI: GitHub Actions
- Database for local, preview, and production: Supabase hosted database
- ORM: Prisma
- Future auth: Supabase Auth

Work2CV does not use SQLite and does not require a locally installed PostgreSQL server.

## Why Vercel + Supabase

Vercel is the recommended default for the Next.js app because:

- It supports Next.js with minimal configuration.
- It has a free Hobby plan suitable for personal projects.
- It integrates directly with GitHub for preview and production deployments.

Supabase is the recommended database platform because:

- It provides a hosted database with a free plan.
- It works with Prisma.
- It can support future Auth, RLS, and Storage features.
- It avoids local database setup across development machines.

## Database Strategy

Use Supabase hosted database for all environments:

- Local development uses a Supabase project connection string in local `.env`.
- Vercel preview uses Supabase env vars in Vercel preview settings.
- Vercel production uses Supabase env vars in Vercel production settings.

Do not use SQLite for Work2CV persistence. Do not require local PostgreSQL.

## Required Environment Variables

Local `.env` and Vercel environment settings must include:

```env
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=""
DATABASE_URL=""
DIRECT_URL=""
SUPABASE_SERVICE_ROLE_KEY=""
```

Only use `SUPABASE_SERVICE_ROLE_KEY` in server-only code when an admin operation explicitly needs it. Never expose it in client components.

## Prisma With Supabase

When Prisma is initialized, the datasource should use Supabase:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

The provider name is `postgresql` because that is Prisma's connector for Supabase's database. This does not mean developers need local PostgreSQL.

## Vercel Setup Steps

1. Push repository to GitHub.
2. Create a Vercel account or sign in.
3. Import the GitHub repository.
4. Use default Next.js settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Install Command: `npm ci`
   - Output Directory: leave default for Next.js
5. Add Supabase environment variables in Vercel project settings.
6. Deploy.
7. Confirm production URL loads.

## Supabase Setup Steps

1. Create a Supabase project.
2. Copy the project URL and publishable key.
3. Copy the database connection strings from the Supabase dashboard.
4. Fill local `.env`.
5. Add the same values to Vercel environment variables.
6. Run Prisma validation/generation after Prisma is configured.
7. Run migrations only after schema review.

## GitHub Actions CI

CI should run before deploy or before merging:

- install dependencies with `npm ci`
- run lint with `npm run lint`
- run build with `npm run build`

The default CI workflow lives at:

```text
.github/workflows/ci.yml
```

## Deployment Readiness Checklist

Before deploying the current app shell:

- [ ] `npm ci` works.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] Root route `/` renders.
- [ ] No starter content remains.
- [ ] `.env.example` documents Supabase variables.
- [ ] `docs/SUPABASE.md` is up to date.

Before deploying CRUD/database features:

- [ ] Supabase project exists.
- [ ] Local `.env` is filled.
- [ ] Vercel environment variables are filled.
- [ ] Prisma datasource uses Supabase.
- [ ] Migrations are tested against Supabase.
- [ ] API routes handle validation and database errors.
- [ ] Service role key is not exposed client-side.

## Agent Rules For Deployment Work

When working on deployment or CI/CD tasks, the agent must:

- Read `docs/DEPLOYMENT.md`.
- Read `docs/CI-CD.md`.
- Read `docs/SUPABASE.md`.
- Read `docs/RULE.md`, `docs/PLAN.md`, `docs/ProductBacklog.md`, and `docs/SprintBacklog.md`.
- Inspect `package.json`, `next.config.ts`, `.env.example`, `.gitignore`, `.github/workflows`, and `.env` presence.
- Run `npm run lint`.
- Run `npm run build`.
- Never commit secrets.
- Never put production credentials into `.env.example`.
