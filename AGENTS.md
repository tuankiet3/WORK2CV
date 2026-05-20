<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Work2CV Agent Config

Before any Work2CV task, read:

1. `docs/RULE.md`
2. `docs/PLAN.md`
3. `docs/ProductBacklog.md`
4. `docs/SprintBacklog.md`

Then read task-specific docs:

- `docs/CONVENTIONS.md` for coding, API, UI, validation, and testing conventions.
- `docs/API-SPEC.md` for API work.
- `docs/DATA-MODEL.md` for Prisma, validation, seed, or database work.
- `docs/SUPABASE.md` for Supabase database, env, Auth, RLS, and Prisma connection work.
- `docs/UI-SPEC.md` for page, component, form, and layout work.
- `docs/DEPLOYMENT.md` for deploy, hosting, or production-readiness work.
- `docs/CI-CD.md` for GitHub Actions or release workflow work.
- `docs/QA-CHECKLIST.md` before final verification.

Operational rules:

- Do not stop after planning unless the user explicitly asks for planning only.
- Write a short task plan, then implement, test, and report in the same turn.
- Keep `npm run lint` and `npm run build` passing to prevent CI/CD build failures.
- Keep the app deployable as a Next.js web app.
- Never commit secrets, credentials, or tokens (Vercel, Database, GitHub).
- Do not use SQLite or local PostgreSQL for Work2CV persistence; use Supabase hosted database for local, preview, and production.
- Always refer to `docs/DEPLOYMENT.md` and `docs/CI-CD.md` before making configuration or infrastructure changes.
- The Vercel project has already been created manually and connected to GitHub; verify the existing integration instead of creating a duplicate project.
- Never commit or push files under the `docs/` directory to GitHub (they must remain local only).
- Never commit or push directly to the `main` branch. Create or switch to a suitable `<task-id>` branch (e.g., `sb-004`), commit safe non-docs files there, and push that branch.



