# Work2CV

Work2CV is a local-first internship work log dashboard for a developer intern. It helps record daily work, track technical learning, create weekly reflections, and convert real internship activity into CV-ready bullet points.

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

## Deployment Recommendation

Recommended free deployment path:

- Use Vercel Hobby for the Next.js web app.
- Use GitHub Actions for CI.
- Use Vercel GitHub integration for preview and production deployments.
- Use Supabase Free for database persistence in local, preview, and production environments.

Do not use SQLite or local PostgreSQL for Work2CV persistence. Local development, preview, and production should all use Supabase hosted database.



