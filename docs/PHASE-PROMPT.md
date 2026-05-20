# Work2CV Phase Prompts

## How To Use This File

Copy one prompt at a time and send it to the implementation agent. Each prompt is designed to be self-contained, but every prompt also forces the agent to read the project context first.

Project root:

```text
D:\WorkSpace\IndividualProject\Work2CV
```

Mandatory context files:

```text
docs/RULE.md
docs/PLAN.md
docs/ProductBacklog.md
docs/SprintBacklog.md
```

General expectation for every prompt:

- Read the mandatory context files from `docs/` first.
- Map the request to the matching product backlog and sprint backlog IDs.
- Inspect the current codebase before changing files.
- Produce a short task-level plan, then continue immediately.
- Implement the requested task in the same turn; do not stop after planning.
- Test API behavior if the task touches API, data, validation, database, export, or generator logic.
- Test UI behavior if the task touches pages, components, forms, navigation, or layout.
- Test relevant exception and edge cases.
- Run relevant checks such as lint, type check, build, Prisma validate, migration, seed, manual browser verification, and the relevant QA checklist items.
- Final response must include changed files, tests run, exception cases tested, skipped tests with reasons, and remaining risks.

## Sprint 0: Project Setup and Foundation

### SB-001: Scaffold Next.js App

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-001: Scaffold Next.js App. Product backlog link: PB-001.

Goal: Initialize Work2CV as a clean standalone Next.js App Router project with TypeScript, Tailwind CSS, and ESLint.

Required implementation:
- Inspect the current folder first and confirm whether a Next.js app already exists.
- If not scaffolded yet, initialize a Next.js app in the current folder, not in a nested folder. The root may already contain docs and .env.example; if create-next-app cannot run in a non-empty folder, scaffold into a temporary folder, then copy the generated app files into the project root while preserving docs and .env.example.
- Enable TypeScript, App Router, Tailwind CSS, ESLint, and src directory.
- Remove unused starter marketing content.
- Make the root route render a simple usable placeholder dashboard for Work2CV, not a landing page.
- Keep the app independent from any parent project.

Testing and verification:
- Run npm install if needed.
- Run npm run dev long enough to confirm the app starts, then stop it if no longer needed.
- Run npm run lint.
- If available, run npm run build.
- Browser-check the root route and confirm no starter content remains.
- Test exception cases: existing docs/.env.example in target folder, missing package scripts, dependency install failure, create-next-app non-empty-folder failure, and route not rendering.

Final response:
- Summarize scaffold result.
- List changed files.
- List commands and test results.
- Mention any skipped checks and why.
```

### SB-002: Install Core Dependencies

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-002: Install Core Dependencies. Product backlog links: PB-004, PB-009, PB-002.

Goal: Install and verify the core libraries needed for Work2CV: Prisma, Prisma Client, Zod, and Lucide React.

Required implementation:
- Inspect package.json first.
- Install prisma, @prisma/client, zod, and lucide-react only if missing.
- Preserve existing dependency choices and scripts.
- Do not configure Prisma schema in this task unless it is required by the install command.
- Confirm package.json and lock file reflect the installed dependencies.

Testing and verification:
- Run npm install or the needed npm install command.
- Run npm run lint if available.
- Run npm run dev briefly to confirm the app still starts.
- Test exception cases: dependency conflict, missing package.json, app failing after install, and unavailable npm scripts.

Final response:
- List installed dependencies and versions.
- List changed files.
- Include commands run and results.
```

### SB-003: Configure App Folder Structure

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-003: Configure App Folder Structure. Product backlog links: PB-001, PB-003.

Goal: Create a predictable folder structure for shared UI, feature modules, constants, validation, and utilities.

Required implementation:
- Inspect the existing Next.js project structure first.
- Create or normalize these folders when appropriate: src/app, src/components, src/features, src/lib, src/constants, src/validation.
- Add minimal placeholder index or README files only if needed to preserve empty folders.
- Configure path aliases only if the project already supports or clearly benefits from them.
- Do not build feature logic in this task.

Testing and verification:
- Run npm run lint.
- Run npm run build if available.
- Confirm imports still resolve.
- Test exception cases: missing src directory, existing folders with content, path alias misconfiguration.

Final response:
- Explain the final folder structure.
- List changed files.
- Include checks run and results.
```

### SB-004: Add Shared Constants and Types

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-004: Add Shared Constants and Types. Product backlog link: PB-003.

Goal: Define reusable constants and TypeScript union types for task types, impact levels, tag categories, and CV tones.

Required implementation:
- Inspect existing constants/types first.
- Create shared constants for task types, impact levels, tag categories, and CV output tones.
- Export label maps for UI display.
- Export TypeScript union types derived from constants.
- Keep values aligned with PLAN.md and ProductBacklog.md.
- Do not create database schema in this task.

Testing and verification:
- Run npm run lint.
- Run npm run build or TypeScript check if available.
- Test exception cases: duplicate constant values, label missing for a value, invalid imports.

Final response:
- List constants added.
- List changed files.
- Include check results.
```

### SB-005: Create Base App Layout

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-005: Create Base App Layout. Product backlog link: PB-002.

Goal: Build the Work2CV app shell with sidebar navigation and a responsive dashboard-style layout.

Required implementation:
- Inspect current app layout and routing first.
- Create sidebar navigation with Dashboard, Logs, Weekly Review, CV Builder, and Export.
- Use Lucide React icons.
- Add active route styling.
- Add main content area and page container.
- Ensure desktop and tablet layouts are clean.
- Avoid marketing hero or landing-page style UI.

Testing and verification:
- Run npm run lint and npm run build if available.
- Start dev server and browser-check navigation.
- Test UI states: active route, narrow width, long nav labels, keyboard tab focus.
- Test exception cases: missing routes, route refresh, icon import failure, layout overflow.

Final response:
- Summarize layout and navigation behavior.
- List changed files.
- Include browser verification and command results.
```

### SB-006: Create Placeholder Pages

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-006: Create Placeholder Pages. Product backlog link: PB-002.

Goal: Create all MVP routes with useful placeholder states so navigation is complete before feature work starts.

Required implementation:
- Create pages for /, /logs, /logs/new, /weekly, /cv-builder, and /export.
- Ensure placeholders describe the intended product function briefly.
- Keep placeholder content compact and app-like.
- Ensure sidebar links open each route.
- Do not implement full CRUD or API behavior in this task.

Testing and verification:
- Run npm run lint and npm run build if available.
- Start dev server and browser-check every route.
- Test exception cases: direct refresh on every route, unknown route behavior, narrow layout.

Final response:
- List routes created.
- List changed files.
- Include test results.
```

## Sprint 1: Database, Validation, and Seed Data

### SB-007: Initialize Prisma and Supabase

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-007: Initialize Prisma and Supabase. Product backlog link: PB-004.

Goal: Configure Prisma for Supabase hosted database and add a reusable Prisma client helper.

Required implementation:
- Inspect package.json, prisma folder, .env, and .gitignore first.
- Initialize Prisma only if it is not already initialized.
- Configure Prisma datasource for Supabase hosted database.
- Add Supabase `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` env entries.
- Ensure local database files are ignored from git where appropriate.
- Add a Prisma client helper in src/lib.
- Do not define all application models unless needed for initialization; model definition belongs to SB-008.

Testing and verification:
- Run npx prisma validate.
- Run npx prisma generate.
- Run npm run lint.
- Test exception cases: missing .env, invalid DATABASE_URL, Prisma client duplicate instance during dev, database file accidentally tracked.

Final response:
- Summarize Prisma setup.
- List changed files.
- Include commands and results.
```

### SB-008: Define Prisma Schema

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-008: Define Prisma Schema. Product backlog links: PB-005, PB-006, PB-007, PB-008.

Goal: Define Prisma models for WorkLog, Tag, WorkLogTag, WeeklyReview, and CvBullet.

Required implementation:
- Inspect current schema and constants first.
- Add WorkLog with date, title, description, taskType, impactLevel, problem, solution, learning, links, createdAt, updatedAt.
- Add Tag with id, name, category, createdAt.
- Add WorkLogTag join model with cascade behavior where appropriate.
- Add WeeklyReview with weekStart, weekEnd, shipped, blockers, learned, collaboration, nextFocus, timestamps.
- Add CvBullet with sourceLogIds, content, tone, timestamps.
- Add indexes for common filters: date, taskType, impactLevel, tag category/name.
- Keep enum/string values aligned with shared constants.

Testing and verification:
- Run npx prisma format.
- Run npx prisma validate.
- Run npx prisma generate.
- Test exception cases: invalid relation definitions, missing required fields, duplicate tag uniqueness, unsupported Supabase/Prisma field types.

Final response:
- Summarize schema design.
- List changed files.
- Include validation/generate results.
```

### SB-009: Create First Migration

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-009: Create First Migration. Product backlog link: PB-004.

Goal: Create and verify the first Prisma migration against Supabase for the Work2CV schema.

Required implementation:
- Inspect current Prisma schema and migration state first.
- Run the first migration with a clear name such as init.
- Generate Prisma client after migration.
- Confirm tables exist using Prisma or Supabase dashboard/SQL inspection.
- Do not add seed data in this task unless required to verify migration minimally.

Testing and verification:
- Run npx prisma migrate dev.
- Run npx prisma generate.
- Run npx prisma validate.
- Run npm run lint if available.
- Test exception cases: existing database with conflicting schema, failed migration, missing DATABASE_URL, generated client mismatch.

Final response:
- Report migration name.
- List generated files.
- Include command results.
```

### SB-010: Add Validation Schemas

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-010: Add Validation Schemas. Product backlog link: PB-009.

Goal: Add Zod validation schemas for WorkLog, Tag, WeeklyReview, CV generation, and Markdown export.

Required implementation:
- Inspect existing constants and Prisma schema first.
- Add create and update schemas for work logs.
- Add tag create schema.
- Add weekly review schema.
- Add CV bullet generation schema.
- Add export request schema.
- Add a helper for formatting Zod errors consistently.
- Use shared constants for enum validation.

Testing and verification:
- Add unit tests if a test framework exists; otherwise add a small validation smoke script or verify via TypeScript.
- Run npm run lint and npm run build if available.
- Test exception cases: missing title, missing date, invalid task type, invalid impact level, invalid tag category, invalid week range, empty selected log IDs, invalid export type.

Final response:
- Summarize schemas added.
- List changed files.
- Include all validation cases tested.
```

### SB-011: Add Seed Script

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-011: Add Seed Script. Product backlog link: PB-010.

Goal: Add realistic seed data for visual and flow testing.

Required implementation:
- Inspect Prisma schema and package scripts first.
- Add a Prisma seed script.
- Seed at least 8 realistic internship work logs.
- Cover at least 5 task types.
- Include tech, tool, skill, and domain tags.
- Add at least one weekly review.
- Add at least two saved CV bullets.
- Make the seed script repeatable without making the database unusable.

Testing and verification:
- Run the seed command.
- Inspect seeded records.
- Run npm run lint.
- Start app if UI exists and confirm seeded data does not break pages.
- Test exception cases: duplicate seed run, missing database, missing migration, invalid enum values, long text fields.

Final response:
- Summarize seeded data.
- List changed files.
- Include seed command result and repeat-run behavior.
```

## Sprint 2: Work Log CRUD and Tagging

### SB-012: Implement Logs API

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-012: Implement Logs API. Product backlog link: PB-011.

Goal: Implement CRUD API routes for work logs with tags and validation.

Required implementation:
- Inspect Prisma models, validation schemas, and current API structure first.
- Implement GET /api/logs with tags included.
- Implement POST /api/logs to create a log and attach tags.
- Implement GET /api/logs/[id].
- Implement PATCH /api/logs/[id] with partial updates and tag relation updates.
- Implement DELETE /api/logs/[id] with relation cleanup.
- Return consistent JSON response shapes and errors.

Testing and verification:
- Test successful create, list, detail, update, and delete.
- Test missing required fields, invalid enum values, invalid date, invalid tag IDs, unknown log ID, malformed ID, empty database, delete relation cleanup.
- Verify status codes: 200/201 success, 400 validation, 404 unknown ID, 500 unexpected.
- Run npm run lint and npm run build if available.

Final response:
- List API routes implemented.
- List changed files.
- Include API tests and exception cases tested.
```

### SB-013: Implement Tags API

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-013: Implement Tags API. Product backlog link: PB-012.

Goal: Implement tag listing and creation endpoints with duplicate-safe behavior.

Required implementation:
- Inspect Tag model and validation schemas first.
- Implement GET /api/tags.
- Implement POST /api/tags.
- Trim and normalize tag names.
- Prevent duplicate category/name pairs.
- Return existing tag or a clear conflict response for duplicates.
- Keep response shapes consistent with logs API.

Testing and verification:
- Test list with empty database.
- Test create valid tech, tool, skill, and domain tags.
- Test duplicate tag creation.
- Test missing name, missing category, invalid category, very long tag name, whitespace-only name.
- Run npm run lint and npm run build if available.

Final response:
- Summarize endpoint behavior.
- List changed files.
- Include API tests and exception cases tested.
```

### SB-014: Build Log List UI

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-014: Build Log List UI. Product backlog link: PB-013.

Goal: Build /logs so users can review internship logs quickly.

Required implementation:
- Inspect current routes, layout, and logs API first.
- Fetch logs from GET /api/logs.
- Render newest logs first.
- Show date, title, task type, impact, tags, and link count.
- Add create log button.
- Link each row/card to detail page.
- Add loading, empty, and error states.
- Keep the layout readable on desktop and narrower widths.

Testing and verification:
- Browser-test seeded logs.
- Browser-test empty database or mocked empty response if practical.
- Browser-test API failure state if practical.
- Test long title, many tags, no tags, no links, small viewport.
- Run npm run lint and npm run build if available.

Final response:
- Summarize UI behavior.
- List changed files.
- Include browser and command results.
```

### SB-015: Build Log Filters

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-015: Build Log Filters. Product backlog link: PB-014.

Goal: Add search and filters to /logs.

Required implementation:
- Inspect /logs implementation and API capabilities first.
- Add text search for title, description, problem, solution, and learning.
- Add date range filter.
- Add multi-select task type filter.
- Add multi-select impact filter.
- Add tag filter.
- Add clear filters action.
- Preserve filter state in URL query parameters or clearly in component state.
- Ensure filter results update without breaking navigation.

Testing and verification:
- Test every filter alone and in combination.
- Test clear filters.
- Test no matching results.
- Test invalid date range.
- Test long search input.
- Test many tags and many logs.
- Run npm run lint and npm run build if available.

Final response:
- Summarize filter behavior.
- List changed files.
- Include UI and exception tests.
```

### SB-016: Build Log Create Form

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-016: Build Log Create Form. Product backlog link: PB-015.

Goal: Build /logs/new so users can create detailed daily work logs.

Required implementation:
- Inspect logs API, tags API, validation schemas, and existing UI components first.
- Build fields for date, title, description, task type, impact level, tags, problem, solution, learning, and links.
- Default date to today.
- Use select or segmented controls for task type and impact level.
- Allow selecting existing tags and creating new tags.
- Allow multiple links.
- Show validation errors near fields.
- Submit to POST /api/logs.
- Redirect to log detail or list after successful create.

Testing and verification:
- Test complete valid log creation.
- Test minimal valid log creation.
- Test missing title, missing date, invalid date, invalid task type, invalid impact level, duplicate tag, broken link, many links, many tags, very long text.
- Test API failure state and validation response rendering.
- Run npm run lint and npm run build if available.

Final response:
- Summarize form behavior.
- List changed files.
- Include API/UI/exception tests.
```

### SB-017: Build Log Detail and Edit Flow

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-017: Build Log Detail and Edit Flow. Product backlog link: PB-016.

Goal: Build /logs/[id] for viewing, editing, and deleting a work log.

Required implementation:
- Inspect logs API and log form code first.
- Load a log by ID.
- Display all log details, tags, and clickable links.
- Add edit mode, reusing create form logic when practical.
- Save edits through PATCH /api/logs/[id].
- Add delete confirmation and DELETE /api/logs/[id].
- Show friendly 404 state for missing logs.

Testing and verification:
- Test view existing log.
- Test edit all fields.
- Test partial edits.
- Test delete confirmation and cancel.
- Test deleted record opened by URL.
- Test unknown ID, malformed ID, API failure, invalid edit payload, broken links, long text, many tags.
- Run npm run lint and npm run build if available.

Final response:
- Summarize detail/edit/delete behavior.
- List changed files.
- Include API/UI/exception tests.
```

### SB-018: Add Badges and Reusable UI Pieces

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-018: Add Badges and Reusable UI Pieces. Product backlog links: PB-017, PB-037.

Goal: Add reusable UI components for task type badges, impact badges, tag badges, empty states, and loading states.

Required implementation:
- Inspect existing components first.
- Create badge components using shared constants.
- Create reusable empty state component.
- Create reusable loading state component.
- Replace duplicated badge/empty/loading markup in existing pages where safe.
- Keep styles compact and readable.

Testing and verification:
- Browser-check badges in list and detail views.
- Test long tag names, unknown value fallback, many badges, small viewport.
- Run npm run lint and npm run build if available.

Final response:
- List reusable components added.
- List changed files.
- Include UI tests and edge cases.
```

## Sprint 3: Dashboard and Problem-Solution Notes

### SB-019: Implement Dashboard Aggregation

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-019: Implement Dashboard Aggregation. Product backlog link: PB-018.

Goal: Compute dashboard metrics from saved logs and bullets.

Required implementation:
- Inspect database schema, logs API, and dashboard page first.
- Compute total logs, logs this week, top tech tags, task type distribution, impact level distribution, saved CV bullet count, and recent highlight logs.
- Put aggregation in a reusable server utility or API route consistent with the current architecture.
- Handle empty database without throwing.

Testing and verification:
- Test with seeded data.
- Test empty database.
- Test many logs.
- Test logs across week boundaries.
- Test logs with no tags and no bullets.
- Run npm run lint and npm run build if available.

Final response:
- Summarize aggregation source and outputs.
- List changed files.
- Include test cases and results.
```

### SB-020: Build Dashboard Summary Cards

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-020: Build Dashboard Summary Cards. Product backlog link: PB-019.

Goal: Show key dashboard metrics in compact summary cards.

Required implementation:
- Inspect dashboard aggregation from SB-019 first.
- Build cards for total logs, logs this week, top technology, and saved CV bullets.
- Use Lucide icons.
- Add loading and empty states.
- Keep cards responsive and visually restrained.

Testing and verification:
- Browser-test with seeded data.
- Browser-test empty values.
- Test narrow width.
- Test long technology names.
- Run npm run lint and npm run build if available.

Final response:
- Summarize cards added.
- List changed files.
- Include UI tests and command results.
```

### SB-021: Build Tech Ranking Widget

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-021: Build Tech Ranking Widget. Product backlog link: PB-020.

Goal: Display most-used technology tags.

Required implementation:
- Inspect dashboard aggregation first.
- Display top tech tags by count as compact bars or a ranked list.
- Show name and count for each technology.
- Handle no tech tags.
- Avoid layout shift and text clipping.

Testing and verification:
- Test with no tech tags, one tag, many tags, very long tag names.
- Browser-check desktop and narrower widths.
- Run npm run lint and npm run build if available.

Final response:
- Summarize widget behavior.
- List changed files.
- Include UI/edge-case tests.
```

### SB-022: Build Task Distribution Widget

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-022: Build Task Distribution Widget. Product backlog link: PB-021.

Goal: Display task type distribution from logs.

Required implementation:
- Inspect dashboard aggregation and task type constants first.
- Display task type counts using compact chart, bars, or list.
- Reuse task type badges.
- Handle no logs.
- Keep dimensions stable.

Testing and verification:
- Test empty logs, one task type, many task types, long labels, narrow viewport.
- Run npm run lint and npm run build if available.

Final response:
- Summarize distribution UI.
- List changed files.
- Include UI tests and results.
```

### SB-023: Build Recent Highlights Widget

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-023: Build Recent Highlights Widget. Product backlog links: PB-022, PB-032.

Goal: Surface recent high-value logs on the dashboard.

Required implementation:
- Inspect dashboard aggregation and impact constants first.
- Select up to 5 recent logs with implemented, reviewed, fixed, or improved impact.
- Show title, date, impact, and key tags.
- Link each item to log detail.
- Add empty state that suggests creating a high-impact log.

Testing and verification:
- Test with high-impact logs, no high-impact logs, deleted linked log, many tags, long title.
- Browser-check dashboard layout.
- Run npm run lint and npm run build if available.

Final response:
- Summarize highlight selection logic.
- List changed files.
- Include UI/edge-case tests.
```

### SB-024: Add Problem-Solution Filter

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-024: Add Problem-Solution Filter. Product backlog link: PB-023.

Goal: Make logs with problem or solution content easy to find and review.

Required implementation:
- Inspect logs list filters and detail page first.
- Detect logs with problem or solution fields.
- Add a problem-solution filter to /logs.
- Add a clear problem/solution/learning section to log detail.
- Link recent problem-solution notes from dashboard if it fits existing dashboard structure.

Testing and verification:
- Test logs with problem only, solution only, both, and neither.
- Test filter combined with existing filters.
- Test empty results.
- Test long problem/solution text.
- Run npm run lint and npm run build if available.

Final response:
- Summarize filter and detail changes.
- List changed files.
- Include UI/exception tests.
```

## Sprint 4: Weekly Review

### SB-025: Implement Weekly Review API

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-025: Implement Weekly Review API. Product backlog link: PB-025.

Goal: Implement CRUD API routes for weekly reviews.

Required implementation:
- Inspect WeeklyReview model and validation schema first.
- Implement GET /api/weekly-reviews.
- Implement POST /api/weekly-reviews.
- Implement PATCH /api/weekly-reviews/[id].
- Implement DELETE /api/weekly-reviews/[id].
- Prevent duplicate week records or update existing record predictably.
- Validate weekStart and weekEnd.

Testing and verification:
- Test create, list, update, delete.
- Test duplicate week, invalid date range, missing fields, unknown ID, malformed ID, empty database.
- Verify response status codes and body shape.
- Run npm run lint and npm run build if available.

Final response:
- Summarize weekly review API behavior.
- List changed files.
- Include API tests and exception cases.
```

### SB-026: Build Week Selection UI

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-026: Build Week Selection UI. Product backlog link: PB-026.

Goal: Add week selection to /weekly and load logs/review for the selected week.

Required implementation:
- Inspect /weekly page, logs API, and weekly review API first.
- Add week picker or date picker.
- Compute weekStart and weekEnd consistently.
- Default to current week.
- Load logs in selected week.
- Load existing review for selected week.

Testing and verification:
- Test current week default.
- Test previous and next week selection.
- Test week with no logs.
- Test logs on week boundary dates.
- Test API failure.
- Run npm run lint and npm run build if available.

Final response:
- Summarize week selection behavior.
- List changed files.
- Include UI/API tests.
```

### SB-027: Build Weekly Review Form

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-027: Build Weekly Review Form. Product backlog link: PB-026.

Goal: Allow users to create and update weekly reflections.

Required implementation:
- Inspect weekly API and week selector first.
- Add textareas for shipped, blockers, learned, collaboration, and next focus.
- Load existing review into the form.
- Save new review or update existing review.
- Show validation, loading, success, and error states.

Testing and verification:
- Test create review.
- Test edit existing review.
- Test empty week.
- Test invalid week range from UI if possible.
- Test very long text, API failure, refresh after save.
- Run npm run lint and npm run build if available.

Final response:
- Summarize form behavior.
- List changed files.
- Include UI/API/exception tests.
```

### SB-028: Add Weekly Prefill Logic

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-028: Add Weekly Prefill Logic. Product backlog link: PB-027.

Goal: Generate editable weekly review draft text from logs in the selected week.

Required implementation:
- Inspect weekly page, selected week logs, and review form first.
- Generate shipped text from feature, bugfix, testing, refactor, and documentation logs.
- Generate blockers text from problem fields.
- Generate learned text from learning fields.
- Generate collaboration text from meeting, code review, and assisted logs.
- Make prefill an explicit user action.
- Do not overwrite an existing saved review unless the user explicitly triggers and confirms or the UI makes it clear.

Testing and verification:
- Test week with multiple logs.
- Test week with no logs.
- Test logs missing learning/problem fields.
- Test existing review not overwritten accidentally.
- Test long generated text.
- Run npm run lint and npm run build if available.

Final response:
- Summarize prefill rules.
- List changed files.
- Include UI/edge-case tests.
```

### SB-029: Show Selected Week Log Summary

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-029: Show Selected Week Log Summary. Product backlog link: PB-026.

Goal: Show the source logs behind the selected weekly review.

Required implementation:
- Inspect /weekly page and week selection behavior first.
- Display selected week log count.
- Display list of logs in the selected week.
- Show task type, impact, tags, and date.
- Link each log to detail page.
- Add empty state for weeks with no logs.

Testing and verification:
- Test current week logs, empty week, logs across boundary dates, many logs, long titles, many tags.
- Run npm run lint and npm run build if available.

Final response:
- Summarize weekly log summary behavior.
- List changed files.
- Include UI tests.
```

## Sprint 5: CV Builder

### SB-030: Implement Offline CV Generator

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-030: Implement Offline CV Generator. Product backlog link: PB-029.

Goal: Create deterministic CV bullet generation logic from selected work logs.

Required implementation:
- Inspect constants, WorkLog shape, and existing utilities first.
- Create a generator utility.
- Map impact levels to action verbs.
- Extract tech tags from selected logs.
- Use title, description, task type, impact, tech tags, and learning as source truth.
- Generate three variants: concise CV, detailed CV, internship report style.
- Add fallback for missing tech tags.
- Add fallback for unclear impact.
- Do not call external AI APIs.
- Do not invent tools or claims not present in logs.

Testing and verification:
- Add unit tests if test framework exists; otherwise add a focused smoke script or test helper.
- Test one log, multiple logs, no tech tags, unclear impact, very long title, empty selected logs.
- Run npm run lint and npm run build if available.

Final response:
- Summarize generator rules.
- List changed files.
- Include tests and edge cases.
```

### SB-031: Add CV Bullet API

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-031: Add CV Bullet API. Product backlog link: PB-030.

Goal: Add API routes for generating, saving, editing, and deleting CV bullets.

Required implementation:
- Inspect CvBullet model, generator utility, and validation schemas first.
- Implement GET /api/cv-bullets.
- Implement POST /api/cv-bullets/generate.
- Implement PATCH /api/cv-bullets/[id].
- Implement DELETE /api/cv-bullets/[id].
- Validate selected log IDs and tone.
- Allow generated bullet to be saved with source log IDs.

Testing and verification:
- Test generate with one log and multiple logs.
- Test save, list, edit, and delete.
- Test no selected logs, unknown log ID, invalid tone, unknown bullet ID, malformed ID, empty database.
- Verify status codes and response body shape.
- Run npm run lint and npm run build if available.

Final response:
- Summarize CV API behavior.
- List changed files.
- Include API tests and exception cases.
```

### SB-032: Build CV Builder Selection UI

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-032: Build CV Builder Selection UI. Product backlog link: PB-031.

Goal: Allow users to select candidate logs for CV generation.

Required implementation:
- Inspect /cv-builder page, logs API, and high-value logic if available.
- Display candidate logs.
- Allow selecting one or multiple logs.
- Add filters by impact and tags.
- Highlight suggested high-value logs.
- Show selected count.
- Add empty state that guides the user to create logs first.

Testing and verification:
- Test select one log, select multiple logs, deselect, no logs, many logs, filter by impact, filter by tag, long titles.
- Browser-check narrow width and keyboard focus.
- Run npm run lint and npm run build if available.

Final response:
- Summarize selection UI.
- List changed files.
- Include UI tests.
```

### SB-033: Build CV Generation and Editing UI

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-033: Build CV Generation and Editing UI. Product backlog links: PB-031, PB-033.

Goal: Generate, edit, save, copy, and delete CV bullets in /cv-builder.

Required implementation:
- Inspect CV Builder selection UI and CV API first.
- Add tone or output style selector.
- Trigger generation from selected logs.
- Display generated variants.
- Allow editing generated text before saving.
- Save selected bullet.
- Show saved bullets.
- Allow delete saved bullet with confirmation.
- Add copy-to-clipboard if practical.

Testing and verification:
- Test generate with valid selected logs.
- Test no selected logs.
- Test edit before save.
- Test saved bullet persists after refresh.
- Test delete and cancel delete.
- Test copy action if implemented.
- Test API failure, long bullet text, empty generated response.
- Run npm run lint and npm run build if available.

Final response:
- Summarize generation/editing UI.
- List changed files.
- Include UI/API/exception tests.
```

### SB-034: Add High-Value Log Suggestions

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-034: Add High-Value Log Suggestions. Product backlog link: PB-032.

Goal: Score and suggest logs likely to produce strong CV bullets.

Required implementation:
- Inspect existing dashboard highlight logic and CV Builder first.
- Score logs by impact level.
- Add points for problem and solution fields.
- Add points for links.
- Add points for multiple tech tags.
- Sort or label suggested logs in CV Builder.
- Reuse the same logic in Dashboard if compatible.

Testing and verification:
- Test implemented, fixed, improved, reviewed logs.
- Test logs with links, problem/solution, many tech tags.
- Test logs with low impact.
- Test empty logs and equal scores.
- Run npm run lint and npm run build if available.

Final response:
- Summarize scoring logic.
- List changed files.
- Include tests and edge cases.
```

## Sprint 6: Markdown Export and Final MVP Polish

### SB-035: Implement Markdown Export Utility

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-035: Implement Markdown Export Utility. Product backlog link: PB-034.

Goal: Create utility functions that export Work2CV data as readable Markdown.

Required implementation:
- Inspect data models and existing utilities first.
- Format selected logs as Markdown.
- Format weekly review as Markdown.
- Format CV bullets as Markdown.
- Format full internship summary as Markdown.
- Include dates, tags, task types, impact, and links where useful.
- Omit empty optional fields cleanly.

Testing and verification:
- Add unit tests if test framework exists; otherwise add focused verification.
- Test selected logs, weekly review, CV bullets, full summary, empty optional fields, empty arrays, malformed links, long text.
- Run npm run lint and npm run build if available.

Final response:
- Summarize export formats.
- List changed files.
- Include tests and edge cases.
```

### SB-036: Implement Export API

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-036: Implement Export API. Product backlog link: PB-035.

Goal: Implement POST /api/export/markdown.

Required implementation:
- Inspect Markdown export utility and validation schema first.
- Accept export type and selected IDs.
- Validate export type and selected IDs.
- Load requested records.
- Return Markdown text.
- Return clear errors for invalid requests.

Testing and verification:
- Test valid log export, weekly review export, CV bullet export, full summary export.
- Test invalid export type, no selected items, invalid IDs, unknown IDs, empty database.
- Verify status codes and response body shape.
- Run npm run lint and npm run build if available.

Final response:
- Summarize export API behavior.
- List changed files.
- Include API tests and exceptions.
```

### SB-037: Build Export Center UI

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-037: Build Export Center UI. Product backlog link: PB-036.

Goal: Build /export so users can preview, copy, and download Markdown exports.

Required implementation:
- Inspect export API and available data APIs first.
- Add export type selector.
- Add item selector based on export type.
- Add generate preview action.
- Show Markdown preview.
- Add copy-to-clipboard.
- Add download .md file.
- Add empty, loading, error, and success states.

Testing and verification:
- Test exporting logs, weekly reviews, CV bullets, full summary.
- Test no selected items, invalid API response, copy success/failure, download file, long Markdown.
- Browser-check desktop and narrow widths.
- Run npm run lint and npm run build if available.

Final response:
- Summarize export UI.
- List changed files.
- Include UI/API/exception tests.
```

### SB-038: Add Global Empty and Error States

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-038: Add Global Empty and Error States. Product backlog link: PB-037.

Goal: Review the whole MVP UI and add consistent loading, empty, error, validation, and confirmation states.

Required implementation:
- Inspect all MVP pages first: Dashboard, Logs, Log Detail, New Log, Weekly, CV Builder, Export.
- Add missing loading states.
- Add missing empty states.
- Add missing error states.
- Add delete confirmations where dangerous actions exist.
- Add user-friendly validation messages.
- Reuse shared components where possible.

Testing and verification:
- Browser-test empty database.
- Browser-test API failure where practical.
- Test validation errors on forms.
- Test delete confirmations.
- Test loading states where practical.
- Run npm run lint and npm run build if available.

Final response:
- Summarize pages improved.
- List changed files.
- Include UI and exception tests.
```

### SB-039: Responsive and Accessibility Pass

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-039: Responsive and Accessibility Pass. Product backlog links: PB-038, PB-039.

Goal: Improve responsive layout and accessibility basics across the MVP.

Required implementation:
- Inspect all MVP pages and shared components first.
- Check dashboard at desktop and tablet widths.
- Check forms at narrow width.
- Ensure inputs have labels.
- Ensure icon-only buttons have aria labels or titles.
- Ensure focus states are visible.
- Ensure text does not overflow buttons, badges, cards, tables, and nav.
- Keep UI compact and practical.

Testing and verification:
- Browser-test common desktop width.
- Browser-test tablet or narrow width.
- Keyboard-navigate forms and major actions.
- Test long labels, long tags, many badges, and tables/cards on narrow widths.
- Run npm run lint and npm run build if available.

Final response:
- Summarize responsive/accessibility improvements.
- List changed files.
- Include viewport and keyboard tests.
```

### SB-040: Add Manual QA Checklist

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-040: Add Manual QA Checklist. Product backlog link: PB-042.

Goal: Document a manual QA checklist for verifying the MVP.

Required implementation:
- Inspect README and docs structure first.
- Create or update a QA checklist document.
- Include work log CRUD flow.
- Include tag reuse.
- Include dashboard stats.
- Include weekly review generation.
- Include CV bullet generation.
- Include Markdown export.
- Include empty state and validation checks.
- Include build/lint verification.

Testing and verification:
- Confirm checklist can be followed by another agent or developer.
- Run markdown lint if available, otherwise visually inspect formatting.
- Test exception cases: missing feature references, outdated commands, unclear pass/fail criteria.

Final response:
- List checklist location.
- Summarize coverage.
- Include any verification done.
```

### SB-041: Final Build Verification

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-041: Final Build Verification. Product backlog link: PB-043.

Goal: Verify the MVP is ready by running final checks and manually testing critical flows.

Required implementation:
- Inspect package scripts and current git/worktree status first.
- Run npm run lint.
- Run npm run build.
- Fix TypeScript and lint errors caused by project code.
- Manually test critical flows: logs CRUD, tags, dashboard, weekly review, CV builder, export.
- Do not introduce unrelated refactors.

Testing and verification:
- Required: npm run lint.
- Required: npm run build.
- Required: manual browser test of critical flows.
- Test exception cases: empty database, invalid form submission, unknown detail route, API failure if practical, export without selected items, CV generation without selected logs.

Final response:
- Report pass/fail for lint and build.
- Summarize manual QA results.
- List changed files if fixes were needed.
- List remaining risks.
```

## Post-MVP Sprint 7: Optional Enhancements

### SB-042: Optional OpenAI CV Rewriter

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-042: Optional OpenAI CV Rewriter. Product backlog link: PB-044.

Important scope note: This is post-MVP. Do not implement unless the user explicitly confirms that MVP is complete or they intentionally want this post-MVP feature now.

Goal: Add optional AI rewriting while keeping the offline generator as the default.

Required implementation:
- Inspect existing CV generator and CV Builder first.
- Add optional API key configuration without committing secrets.
- Keep offline generator working without AI.
- Design rewrite flow that uses selected logs as source truth.
- Display AI output as editable draft.
- Add clear error handling when API key is missing.
- Never claim facts not present in logs.

Testing and verification:
- Test AI disabled/no key.
- Test offline generator still works.
- Test missing key error.
- Test API failure.
- Test generated draft edit/save.
- Run npm run lint and npm run build.

Final response:
- Confirm post-MVP scope.
- List changed files.
- Include tests and secret-handling notes.
```

### SB-043: GitHub Import

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-043: GitHub Import. Product backlog link: PB-045.

Important scope note: This is post-MVP. Do not implement unless the user explicitly confirms that MVP is complete or they intentionally want this post-MVP feature now.

Goal: Allow users to paste GitHub commit or PR links and convert metadata into draft work logs.

Required implementation:
- Inspect Work Log create flow first.
- Add URL parser for GitHub PR and commit URLs.
- Support metadata extraction approach chosen for current app constraints.
- Create draft work log from imported metadata.
- Keep manual log flow unchanged.
- Handle private/inaccessible links gracefully.

Testing and verification:
- Test valid PR URL.
- Test valid commit URL.
- Test malformed URL.
- Test unsupported GitHub URL.
- Test inaccessible URL.
- Test draft creation and manual edit before save.
- Run npm run lint and npm run build.

Final response:
- Summarize import behavior.
- List changed files.
- Include URL/error tests.
```

### SB-044: PDF Export

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-044: PDF Export. Product backlog link: PB-046.

Important scope note: This is post-MVP. Do not implement unless the user explicitly confirms that MVP is complete or they intentionally want this post-MVP feature now.

Goal: Add PDF export for weekly reviews and internship summaries.

Required implementation:
- Inspect Markdown export first.
- Choose a PDF generation approach that fits Next.js and local-first usage.
- Add weekly review PDF export.
- Add internship summary PDF export.
- Keep Markdown export available.
- Verify layout visually.

Testing and verification:
- Test weekly review PDF.
- Test full summary PDF.
- Test empty optional fields.
- Test long text.
- Test missing data.
- Visually inspect generated PDF.
- Run npm run lint and npm run build.

Final response:
- Summarize PDF approach.
- List changed files.
- Include visual verification and tests.
```

### SB-045: Backup and Restore

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, and any supporting specs relevant to this task: docs/API-SPEC.md for API work, docs/DATA-MODEL.md for data/Prisma/validation/seed work, docs/UI-SPEC.md for UI work, and docs/QA-CHECKLIST.md for verification. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-045: Backup and Restore. Product backlog link: PB-047.

Important scope note: This is post-MVP. Do not implement unless the user explicitly confirms that MVP is complete or they intentionally want this post-MVP feature now.

Goal: Add JSON backup and restore so users can protect their internship records.

Required implementation:
- Inspect Prisma schema and export flow first.
- Export all app data as JSON.
- Validate imported JSON before writing.
- Add duplicate handling strategy.
- Add restore confirmation.
- Preserve relationships between logs, tags, weekly reviews, and CV bullets.

Testing and verification:
- Test export with full data.
- Test export with empty database.
- Test import valid backup.
- Test import malformed JSON.
- Test import duplicate data.
- Test restore cancellation.
- Run npm run lint and npm run build.

Final response:
- Summarize backup/restore behavior.
- List changed files.
- Include import/export and exception tests.
```



## Sprint 8: Deployment and CI/CD

### SB-046: Add GitHub Actions CI Workflow

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, docs/DEPLOYMENT.md, docs/CI-CD.md, and docs/QA-CHECKLIST.md. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-046: Add GitHub Actions CI Workflow. Product backlog link: PB-048.

Goal: Add a GitHub Actions CI workflow that verifies Work2CV can lint and build before merge/deploy.

Required implementation:
- Inspect package.json scripts first.
- Create or update .github/workflows/ci.yml.
- Trigger on pull_request to main and push to main.
- Use actions/checkout@v4 and actions/setup-node@v4.
- Use Node.js 20.
- Use npm ci, not npm install.
- Run npm run lint.
- Run npm run build.
- Do not add deployment tokens or secrets.

Testing and verification:
- Run npm run lint locally.
- Run npm run build locally.
- Inspect workflow YAML for syntax and correct paths.
- Test exception cases: missing package-lock.json, missing scripts, wrong Node version, secret leakage.

Final response:
- Summarize CI workflow.
- List changed files.
- List commands and results.
- Mention deployment-readiness impact and skipped checks.
```

### SB-047: Add Deployment Documentation

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, docs/DEPLOYMENT.md if it exists, docs/CI-CD.md if it exists, and docs/QA-CHECKLIST.md. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-047: Add Deployment Documentation. Product backlog link: PB-049.

Goal: Document how to deploy Work2CV free as a web app.

Required implementation:
- Create or update docs/DEPLOYMENT.md.
- Recommend Vercel Hobby as the default free hosting path.
- Explain GitHub integration for preview and production deployments.
- Explain GitHub Pages limitations for this full-stack Next.js MVP.
- Explain that Work2CV uses Supabase hosted database for local, preview, and production instead of SQLite/local PostgreSQL.
- Recommend Supabase Free for all Work2CV database persistence.
- Do not add secrets or real tokens.

Testing and verification:
- Verify docs are consistent with package scripts and current project structure.
- Verify docs do not suggest committing secrets.
- Verify docs consistently describe Supabase as the database for local, preview, and production.
- Run npm run lint and npm run build if code/config was changed.

Final response:
- Summarize documentation added.
- List changed files.
- List verification performed.
```

### SB-048: Update Agent Config for Deployment Work

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, docs/DEPLOYMENT.md, docs/CI-CD.md, docs/QA-CHECKLIST.md, and AGENTS.md. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-048: Update Agent Config for Deployment Work. Product backlog links: PB-049, PB-052.

Goal: Make AGENTS.md explicit about Work2CV docs, deployment, CI/CD, and secret safety.

Required implementation:
- Update AGENTS.md without removing existing Next.js version warning.
- Point agents to docs/RULE.md and supporting docs.
- Add deployment-specific instructions to read docs/DEPLOYMENT.md and docs/CI-CD.md.
- Require npm run lint and npm run build for deploy-related changes.
- Prohibit committing secrets or token values.
- Mention that CRUD should use Supabase hosted database and not SQLite/local PostgreSQL.

Testing and verification:
- Inspect AGENTS.md for clarity.
- Verify paths are correct.
- Verify no secrets are present.
- Run npm run lint and npm run build if code/config was changed.

Final response:
- Summarize agent config changes.
- List changed files.
- List verification performed.
```

### SB-049: Update Environment Variable Documentation

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, docs/DEPLOYMENT.md, docs/CI-CD.md, docs/DATA-MODEL.md, and docs/QA-CHECKLIST.md. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-049: Update Environment Variable Documentation. Product backlog link: PB-050.

Goal: Keep local and production environment variable documentation safe and deploy-ready.

Required implementation:
- Review .env.example.
- Keep DATABASE_URL documented.
- Add comments or documentation for Supabase local and Vercel environment usage if helpful.
- Update docs/DEPLOYMENT.md if needed.
- Do not add real credentials.
- Do not commit .env.

Testing and verification:
- Verify .env.example has no secrets.
- Verify .gitignore ignores .env files as appropriate.
- Verify deployment docs explain where Vercel environment variables are configured.
- Run npm run lint and npm run build if code/config was changed.

Final response:
- Summarize env documentation.
- List changed files.
- List safety checks.
```

### SB-050: Define Production Database Path

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, docs/DATA-MODEL.md, docs/API-SPEC.md, docs/DEPLOYMENT.md, docs/CI-CD.md, and docs/QA-CHECKLIST.md. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-050: Define Production Database Path. Product backlog link: PB-051.

Goal: Document the production database path for deployed Work2CV CRUD features.

Required implementation:
- Explain Supabase hosted database usage for local development.
- Explain why Work2CV uses Supabase hosted database instead of SQLite/local PostgreSQL.
- Recommend Supabase Free as production database options.
- Explain Prisma provider implications and migration timing.
- Update docs/PLAN.md, docs/DATA-MODEL.md, and docs/DEPLOYMENT.md if needed.
- Do not implement database migration unless explicitly requested.

Testing and verification:
- Verify docs are internally consistent.
- Verify no production secret values are included.
- Verify future agents are instructed to implement CRUD against Supabase hosted database.

Final response:
- Summarize database strategy.
- List changed files.
- List verification performed.
```

### SB-051: Add Deploy Readiness QA Checklist

```text
You are working in D:\WorkSpace\IndividualProject\Work2CV.

Before doing anything, read docs/RULE.md, docs/PLAN.md, docs/ProductBacklog.md, and docs/SprintBacklog.md. Then read docs/README.md, docs/CONVENTIONS.md, docs/DEPLOYMENT.md, docs/CI-CD.md, and docs/QA-CHECKLIST.md. Follow docs/RULE.md strictly. Do not stop after planning: write a short task-level plan, then immediately implement, test, run the relevant checklist, and report results in the same turn.

Task: Complete SB-051: Add Deploy Readiness QA Checklist. Product backlog link: PB-052.

Goal: Add deployment readiness checks to docs/QA-CHECKLIST.md.

Required implementation:
- Add CI checks.
- Add Vercel deployment checks.
- Add environment variable checks.
- Add root route smoke-test checks.
- Add production database caveat checks.
- Keep checklist actionable.

Testing and verification:
- Verify checklist items are concrete and not duplicated excessively.
- Verify docs/DEPLOYMENT.md and docs/CI-CD.md are referenced where useful.
- Run npm run lint and npm run build if code/config was changed.

Final response:
- Summarize checklist additions.
- List changed files.
- List verification performed.
```



