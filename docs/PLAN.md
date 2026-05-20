# Work2CV Implementation Plan

## Summary

Work2CV is a standalone personal internship dashboard located at `D:\WorkSpace\IndividualProject\Work2CV`. It will be built as a Next.js full-stack web app with TypeScript, Supabase hosted database, and Prisma.

The app helps record daily internship work, organize technical learning, track impact, generate weekly reflections, and turn real work logs into CV-ready bullet points using offline templates.

## Product Goals

- Help the intern consistently record what they did during the internship.
- Convert daily work into structured evidence for CV updates, internship reports, and future interviews.
- Make progress visible through dashboards, timelines, tags, and weekly summaries.
- Stay local-first and simple for v1, with no account system or external AI dependency.

## Target User

The primary user is a developer intern who wants to record real work during an internship and later extract:

- CV bullet points
- internship report material
- learning notes
- problem-solution references
- proof of technical growth

## Recommended Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Prisma
- Supabase hosted database for local development
- Supabase hosted database for deployed web production
- Zod for validation
- Lucide React for icons
- GitHub Actions for CI
- Vercel Hobby for free web deployment

## Core Features

### 1. Dashboard

The dashboard should show a compact overview of internship progress:

- total work logs
- logs this week
- most used tech tags
- task type distribution
- recent highlights
- weekly learning trend
- latest CV bullet suggestions

The first screen should be the usable dashboard, not a marketing landing page.

### 2. Daily Work Logs

Users can create, edit, delete, search, and filter work logs.

Each log should include:

- date
- title
- description
- task type
- impact level
- technologies used
- domain or module
- problem encountered
- solution implemented
- learning notes
- links to PRs, commits, Jira tickets, docs, or references

Suggested task types:

- onboarding
- feature
- bugfix
- testing
- refactor
- code review
- documentation
- meeting
- research
- support

Suggested impact levels:

- learned
- assisted
- implemented
- reviewed
- fixed
- improved

### 3. Tag System

Tags should help group logs by topic.

Tag categories:

- tech
- domain
- skill
- tool

Examples:

- React
- TypeScript
- Spring Boot
- SQL
- Git
- Docker
- API integration
- authentication
- debugging
- testing

### 4. Problem-Solution Library

Every work log can optionally become a reusable problem-solution note.

The app should make it easy to review:

- error or issue
- root cause
- debugging steps
- final fix
- lesson learned

This helps the intern build a personal debugging knowledge base.

### 5. Weekly Review

The weekly review view should group logs by week and help create a reflection.

Weekly review fields:

- shipped this week
- blockers
- technical lessons
- collaboration notes
- next week focus

The app should be able to prefill a weekly review from logs in the selected week.

### 6. CV Bullet Generator

The CV generator for v1 should work offline using templates.

Input:

- one or more selected work logs
- selected tone
- selected detail level

Output:

- concise CV bullet
- detailed CV bullet
- internship report style sentence

Example output:

```text
Implemented a React-based dashboard filter flow using TypeScript, improving task visibility across internship work logs.
```

The generator should not use an external AI API in v1.

### 7. Export

Export should support Markdown output for:

- selected work logs
- weekly review
- CV bullets
- full internship summary

This keeps the data portable and easy to reuse in reports or CV drafts.

## Data Model

### WorkLog

- `id`
- `date`
- `title`
- `description`
- `taskType`
- `impactLevel`
- `problem`
- `solution`
- `learning`
- `links`
- `createdAt`
- `updatedAt`

### Tag

- `id`
- `name`
- `category`
- `createdAt`

### WorkLogTag

- `workLogId`
- `tagId`

### WeeklyReview

- `id`
- `weekStart`
- `weekEnd`
- `shipped`
- `blockers`
- `learned`
- `collaboration`
- `nextFocus`
- `createdAt`
- `updatedAt`

### CvBullet

- `id`
- `sourceLogIds`
- `content`
- `tone`
- `createdAt`
- `updatedAt`

## API Routes

### Work Logs

- `GET /api/logs`
- `POST /api/logs`
- `GET /api/logs/[id]`
- `PATCH /api/logs/[id]`
- `DELETE /api/logs/[id]`

### Tags

- `GET /api/tags`
- `POST /api/tags`

### Weekly Reviews

- `GET /api/weekly-reviews`
- `POST /api/weekly-reviews`
- `PATCH /api/weekly-reviews/[id]`
- `DELETE /api/weekly-reviews/[id]`

### CV Bullets

- `GET /api/cv-bullets`
- `POST /api/cv-bullets/generate`
- `PATCH /api/cv-bullets/[id]`
- `DELETE /api/cv-bullets/[id]`

### Export

- `POST /api/export/markdown`

## UI Structure

Suggested pages:

- `/` - dashboard
- `/logs` - work log list
- `/logs/new` - create work log
- `/logs/[id]` - view or edit work log
- `/weekly` - weekly review
- `/cv-builder` - CV bullet generator
- `/export` - export center

Suggested shared components:

- app sidebar
- top summary cards
- log table
- log editor form
- tag picker
- date filter
- task type filter
- impact badge
- markdown preview
- empty state

## Implementation Steps

1. Create the `Work2CV` folder.
2. Initialize a Next.js TypeScript app inside `Work2CV`.
3. Configure Tailwind CSS and basic app layout.
4. Install Prisma, Supabase-related dependencies, Zod, and Lucide React.
5. Define Prisma schema and create the first Supabase-backed migration.
6. Add seed data for realistic internship logs.
7. Implement database helper and validation schemas.
8. Implement CRUD API routes for logs and tags.
9. Build the dashboard shell and summary cards.
10. Build work log list, filters, and editor form.
11. Implement weekly review page and week-based aggregation.
12. Implement offline CV bullet generator.
13. Implement saved CV bullets.
14. Implement Markdown export.
15. Add polished empty states and loading states.
16. Run lint, build, and manual user-flow testing.

## Offline CV Bullet Generator Rules

The v1 generator should use deterministic templates.

Example template:

```text
{actionVerb} {taskSummary} using {techTags}, resulting in {impactSummary}.
```

Suggested action verbs:

- implemented
- improved
- debugged
- refactored
- documented
- tested
- integrated
- reviewed

If impact is unclear, generate a softer bullet:

```text
Contributed to {taskSummary} using {techTags}, strengthening understanding of {learningTopic}.
```

## Test Plan

Run:

```powershell
npm run lint
npm run build
```

Manual test scenarios:

- create a new work log
- edit an existing work log
- delete a work log
- add and reuse tags
- filter logs by task type and technology
- generate a weekly review from logs
- generate CV bullets from one log
- generate CV bullets from multiple logs
- save an edited CV bullet
- export Markdown for weekly review
- export Markdown for CV bullets
- verify empty database state does not break the UI

## Future Enhancements

- Optional OpenAI-powered CV rewriting
- GitHub integration for importing commits and PRs
- Jira or Linear link enrichment
- Calendar view
- PDF export
- Data backup and restore
- Password lock for local privacy
- Multi-intern mode for mentor/team usage
- Supabase production database setup and migration workflow
- Preview deployments and production deploy workflow

## Assumptions

- Work2CV is a standalone project inside `D:\WorkSpace\IndividualProject`.
- v1 is local-first and single-user.
- No authentication is required in v1.
- No external AI API is required in v1.
- The CV bullet generator uses offline templates first.
- Supabase hosted database is the database for the first version.
- CRUD/database persistence uses Supabase hosted database in both local and deployed environments.
- The project should prioritize practical internship usage over interview showcase features.


