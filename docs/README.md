# Work2CV

Work2CV is a local-first internship work log dashboard for a developer intern. It helps record daily work, track technical learning, create weekly reflections, and convert real internship activity into CV-ready bullet points.

## Project Status

The project is currently in planning and setup. The implementation should follow:

1. `docs/RULE.md`
2. `docs/PLAN.md`
3. `docs/ProductBacklog.md`
4. `docs/SprintBacklog.md`
5. `docs/PHASE-PROMPT.md`

Any agent working on this project must read `docs/RULE.md` before starting a task.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Prisma
- Supabase hosted database
- Zod
- Lucide React

## MVP Features

- Dashboard with internship progress summary
- Daily work log CRUD
- Tagging by technology, domain, skill, and tool
- Problem-solution notes
- Weekly review and reflection
- Offline CV bullet generator
- Saved CV bullets
- Markdown export
- Empty, loading, validation, and error states

## Project Location

```text
D:\WorkSpace\IndividualProject\Work2CV
```

## Initial Setup

When the app has not been scaffolded yet, start with:

```powershell
cd "D:\WorkSpace\IndividualProject\Work2CV"
npx create-next-app@latest . --ts --eslint --tailwind --app --src-dir
npm install prisma @prisma/client zod lucide-react
npx prisma init --datasource-provider sqlite
```

Create a local `.env` file from `.env.example`:

```powershell
Copy-Item .env.example .env
```

## Common Commands

Run development server:

```powershell
npm run dev
```

Run lint:

```powershell
npm run lint
```

Run production build:

```powershell
npm run build
```

Validate Prisma schema:

```powershell
npx prisma validate
```

Generate Prisma client:

```powershell
npx prisma generate
```

Run migration:

```powershell
npx prisma migrate dev
```

Run seed after it exists:

```powershell
npx prisma db seed
```

## Required Agent Workflow

For every implementation task:

1. Read `docs/RULE.md`, `docs/PLAN.md`, `docs/ProductBacklog.md`, and `docs/SprintBacklog.md`.
2. Identify the matching PB and SB task IDs.
3. Inspect the codebase before editing.
4. Write a short task-level implementation plan.
5. Implement the task immediately in the same turn.
6. Test API behavior if data/API logic is touched.
7. Test UI behavior if pages/components/forms are touched.
8. Test relevant exception cases.
9. Run relevant checks and relevant `docs/QA-CHECKLIST.md` items.
10. Report changed files, tests, checklist coverage, skipped checks, and remaining risks.

## Documentation Map

- `docs/RULE.md`: mandatory agent operating rules
- `docs/PLAN.md`: project implementation plan
- `docs/ProductBacklog.md`: epics, stories, acceptance criteria
- `docs/SprintBacklog.md`: sprint-by-sprint implementation tasks
- `docs/PHASE-PROMPT.md`: copy-paste prompts for each sprint task
- `docs/CONVENTIONS.md`: coding, API, UI, validation, and naming rules
- `docs/API-SPEC.md`: endpoint contract and error format
- `docs/DATA-MODEL.md`: data entities, fields, enums, and relations
- `docs/SUPABASE.md`: Supabase env, Prisma connection, and security setup
- `docs/UI-SPEC.md`: pages, layout, states, and component behavior
- `docs/QA-CHECKLIST.md`: manual QA checklist for MVP verification
- `docs/DEPLOYMENT.md`: free deploy plan, Vercel setup, and database deployment notes
- `docs/CI-CD.md`: GitHub Actions and release workflow expectations

## MVP Definition of Done

The MVP is complete when:

- Work log CRUD works.
- Tags can be created and reused.
- Dashboard stats use real data.
- Weekly reviews can be created and prefilled.
- CV bullets can be generated offline.
- Saved bullets can be edited.
- Markdown export works.
- Empty states are clear.
- Validation errors are clear.
- `npm run lint` passes.
- `npm run build` passes.

## Deployment Recommendation

Recommended free deployment path:

- Use Vercel Hobby for the Next.js web app.
- Use GitHub Actions for CI.
- Use Vercel GitHub integration for preview and production deployments.
- Use Supabase Free for database persistence in local, preview, and production environments.

Do not use SQLite or local PostgreSQL for Work2CV persistence. Local development, preview, and production should all use Supabase hosted database.

See `docs/SUPABASE.md` before implementing any database task.


