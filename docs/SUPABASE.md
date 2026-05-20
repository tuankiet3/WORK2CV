# Work2CV Supabase Setup

## Decision

Work2CV uses Supabase for the database in every environment:

- Local development: Supabase hosted project
- Preview deployment: Supabase hosted project
- Production deployment: Supabase hosted project

Do not use SQLite. Do not require a locally installed PostgreSQL server.

## Recommended Architecture

- Frontend: Next.js on Vercel
- Backend: Next.js Route Handlers or Server Actions
- Database: Supabase hosted database
- ORM: Prisma
- Future Auth: Supabase Auth with `@supabase/ssr`
- CI/CD: GitHub Actions and Vercel GitHub integration

For the MVP, use **Supabase database + Prisma** first. Add Supabase Auth later when the app needs user login.

## Required Environment Variables

Create `.env` locally and configure matching variables in Vercel.

```env
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=""
DATABASE_URL=""
DIRECT_URL=""
SUPABASE_SERVICE_ROLE_KEY=""
```

### Variable Usage

- `NEXT_PUBLIC_SUPABASE_URL`: public Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: public browser-safe key.
- `DATABASE_URL`: Prisma runtime connection string, usually Supavisor transaction pooler for serverless.
- `DIRECT_URL`: Prisma migration/direct connection string.
- `SUPABASE_SERVICE_ROLE_KEY`: optional server-only key. Do not use in client components. Do not commit real value.

## Prisma Datasource

When Prisma is initialized, use Supabase as the datasource:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Even though the Prisma provider is named `postgresql`, the project does not require local PostgreSQL. It uses Supabase hosted database.

## Supabase Security Rules

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser code.
- Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` may be used client-side.
- Enable RLS before exposing user-owned tables through Supabase APIs.
- If using Prisma only through server-side routes, keep writes server-side.
- Add Supabase Auth and RLS before making the app multi-user.

## Setup Checklist

1. Create a Supabase project.
2. Create a dedicated Prisma database user if following the Supabase Prisma guide.
3. Copy Supabase connection strings from the dashboard.
4. Fill `.env` locally.
5. Add the same variables in Vercel project settings.
6. Run `npx prisma validate` after schema setup.
7. Run `npx prisma generate`.
8. Run migrations only after reviewing schema changes.

## Agent Requirements

For Supabase tasks, the agent must:

- Read `docs/SUPABASE.md`.
- Verify current Supabase docs before implementing.
- Avoid SQLite and local PostgreSQL setup.
- Avoid committing secrets.
- Use server-side code for privileged database operations.
- Run lint/build after changes.
