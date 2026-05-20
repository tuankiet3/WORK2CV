# Work2CV Agent Rules

## Purpose

This file defines the required workflow for any agent working on Work2CV. Before starting any task, the agent must read and follow this file.

Work2CV is a local-first internship dashboard. The goal is not only to make features work, but to make them useful, tested, maintainable, and aligned with the project plan and backlog.

## Mandatory Reading Before Every Task

Before planning, implementing, or modifying anything, the agent must read these files from the project root:

1. `docs/RULE.md`
2. `docs/PLAN.md`
3. `docs/ProductBacklog.md`
4. `docs/SprintBacklog.md`

If any file is missing, renamed, or inconsistent, the agent must stop and report the issue before implementing.

## Supporting Specs

After reading the mandatory files, the agent must read the supporting specs relevant to the task:

- Read `docs/README.md` for setup, commands, and documentation map.
- Read `docs/CONVENTIONS.md` for coding, naming, API, UI, validation, and testing conventions.
- Read `docs/API-SPEC.md` for API route work.
- Read `docs/DATA-MODEL.md` for Prisma, validation, seed, and data-flow work.
- Read `docs/SUPABASE.md` for any Supabase, database, Prisma connection, env, Auth, RLS, or deploy database work.
- Read `docs/UI-SPEC.md` for page, component, form, layout, and interaction work.
- Read `docs/DEPLOYMENT.md` for deployment, hosting, or production-readiness work.
- Read `docs/CI-CD.md` for GitHub Actions, CI, or release workflow work.
- Read `docs/QA-CHECKLIST.md` before final verification or release-level testing.
- Read `docs/PHASE-PROMPT.md` when selecting or running a sprint task prompt.

## Required Task Workflow

For every user request, the agent must follow this sequence:

1. Read the mandatory files listed above.
2. Identify which product backlog item and sprint backlog item the request belongs to.
3. Inspect the current codebase before making changes.
4. Create a short implementation plan for the specific task.
5. Implement the task immediately after the short plan in the same turn.
6. Test API behavior when the task touches API or data flow.
7. Test UI behavior when the task touches pages, components, forms, or layout.
8. Test exception and edge cases.
9. Run relevant automated checks and relevant `docs/QA-CHECKLIST.md` items.
10. Summarize what changed, what was tested, what checklist items were covered, and what risks remain.

The agent must not skip planning and testing, even for small tasks. The agent must not stop after producing a plan unless the user explicitly asks for planning only or the environment is in Plan Mode.

## Planning Rules

Before implementation, the agent must produce a task-level plan that includes:

- Goal of the task.
- Related backlog IDs.
- Files or modules likely to change.
- Data model or API changes, if any.
- UI behavior to implement, if any.
- Test strategy.
- Known edge cases.

If the user request conflicts with `docs/PLAN.md`, `docs/ProductBacklog.md`, or `docs/SprintBacklog.md`, the agent must explain the conflict and ask for confirmation before proceeding.

## Implementation Rules

- Keep changes aligned with the selected stack: Next.js App Router, React, TypeScript, Tailwind CSS, Prisma, Supabase hosted database, Zod, and Lucide React.
- Keep Work2CV independent from the existing parent project.
- Prefer small, focused changes over broad refactors.
- Reuse shared constants, types, validation schemas, and components when available.
- Do not introduce external AI APIs in v1 unless the user explicitly changes the scope.
- Do not add authentication in v1 unless the user explicitly changes the scope.
- Do not implement post-MVP features before MVP features unless requested.
- Keep UI practical and dashboard-like, not marketing-oriented.
- Use clear empty, loading, success, and error states for user-facing flows.
- Make forms validate both on client and server when possible.
- Make API routes validate input with Zod.
- Keep generated CV bullets deterministic and based only on saved work log data.
- Keep the project deployable as a Next.js web app.
- Do not add features that break `npm run build`.
- Do not use SQLite or local PostgreSQL for Work2CV persistence.
- Use Supabase hosted database for local, preview, and production environments.

## API Testing Rules

When a task touches API routes, database logic, validation, export logic, or generator logic, the agent must test:

- Successful request with valid payload.
- Missing required fields.
- Invalid field type.
- Invalid enum value.
- Unknown ID.
- Empty database behavior.
- Duplicate creation behavior when relevant.
- Delete behavior and relation cleanup when relevant.
- Partial update behavior when relevant.
- Response status code.
- Response body shape.
- Validation error clarity.

Recommended methods:

- Use automated tests for pure utilities such as CV generator and Markdown export.
- Use route-level tests where practical.
- Use manual API calls only when automated test setup is not yet available.

## UI Testing Rules

When a task touches UI, the agent must test:

- Default state.
- Loading state.
- Empty state.
- Error state.
- Valid form submission.
- Invalid form submission.
- Editing existing data.
- Deleting data, including confirmation behavior.
- Navigation between related pages.
- Responsive layout at desktop and narrower widths.
- Keyboard and focus behavior for forms and buttons.
- Text overflow in buttons, badges, cards, and tables.

If a local dev server is needed, the agent should start it and verify the UI in the browser.

## Exception and Edge Case Checklist

For every task, consider all relevant exceptions:

- Network or fetch failure.
- Database unavailable or query failure.
- Empty result set.
- Invalid route parameter.
- Deleted record opened by URL.
- Duplicate tag name.
- Missing tag category.
- Missing work log title.
- Missing date.
- Invalid date range.
- Week with no logs.
- CV generation with no selected logs.
- CV generation with logs that have no tech tags.
- CV generation with unclear impact.
- Export with no selected items.
- Export with invalid IDs.
- Very long text fields.
- Very long tag names.
- Many tags on one log.
- Many logs in the dashboard.
- Broken or malformed link values.

The agent must test every exception that is relevant to the current task. If an exception is not tested, the final response must say why.

## Definition of Done

A task is done only when:

- The implementation matches the user request.
- The implementation matches `docs/PLAN.md`.
- The related product backlog and sprint backlog expectations are satisfied.
- API behavior is tested when applicable.
- UI behavior is tested when applicable.
- Relevant exception cases are tested.
- TypeScript errors are resolved.
- Lint passes or any lint failure is reported clearly.
- Build passes for release-level tasks, or skipped build is explained.
- The final response lists changed files and test results.

## Backlog Update Rule

If the user asks to track progress, the agent may update `docs/ProductBacklog.md` or `docs/SprintBacklog.md` statuses.

The agent must not mark backlog items as `Done` unless:

- all acceptance criteria are satisfied
- relevant tests pass
- exception cases are handled
- the implementation has been verified in the running app when UI is involved

## Communication Rules

During work, the agent should provide short progress updates:

- what it is inspecting
- what it is changing
- what it is testing
- what it found

Final response must include:

- concise summary of implemented changes
- files changed
- tests run
- exception cases tested
- any known limitations or follow-up tasks

## Safety Rules

- Do not delete user work unless explicitly requested.
- Do not rewrite unrelated files.
- Do not run destructive git commands.
- Do not commit, push, or open pull requests unless the user asks.
- Do not store secrets in the repository.
- Do not add external services for v1 without explicit user approval.
- Do not add Vercel, database, or GitHub tokens to files.
- Use `.env.example` for variable names only, never real values.
- Do not commit `.env` or Supabase credentials.

## Current MVP Priority

Build in this order unless the user requests otherwise:

1. Project setup and layout.
2. Database, validation, and seed data.
3. Work log CRUD and tagging.
4. Dashboard analytics and problem-solution notes.
5. Weekly review.
6. CV builder.
7. Markdown export and final polish.
8. Deployment readiness, CI/CD, and production database alignment.


