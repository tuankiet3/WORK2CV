# Work2CV Sprint Backlog

## Sprint Plan Overview

This sprint backlog breaks the Work2CV product backlog into implementation-ready tasks. The recommended cadence is 1 week per sprint, but each sprint can be stretched depending on school, internship preparation, or available time.

## Definition of Done

A task is done only when:

- code is implemented
- TypeScript has no errors
- lint passes for touched files
- UI state is manually checked
- errors and empty states are handled
- relevant acceptance criteria are satisfied
- related backlog item status can be updated

## Sprint 0: Project Setup and Foundation

### Sprint Goal

Create the standalone Work2CV app foundation and prepare the codebase for feature development.

### Sprint Backlog Items

#### SB-001: Scaffold Next.js App

- Product backlog link: PB-001
- Estimate: 3
- Priority: P0
- Owner: Developer
- Tasks:
  - Initialize Next.js app inside `Work2CV`.
  - Enable TypeScript.
  - Enable App Router.
  - Add Tailwind CSS.
  - Confirm `npm run dev` starts the app.
  - Confirm root route renders.
  - Remove unused scaffold content.
- Acceptance checks:
  - Local app opens in browser.
  - No starter marketing content remains.
  - Project scripts are available in `package.json`.

#### SB-002: Install Core Dependencies

- Product backlog link: PB-004, PB-009, PB-002
- Estimate: 2
- Priority: P0
- Owner: Developer
- Tasks:
  - Install Prisma.
  - Install Prisma client.
  - Install Zod.
  - Install Lucide React.
  - Confirm dependency versions are recorded in `package.json`.
  - Add any missing dev dependencies needed for Prisma and Supabase workflow.
- Acceptance checks:
  - Dependencies install without peer dependency errors.
  - App still starts after install.

#### SB-003: Configure App Folder Structure

- Product backlog link: PB-001, PB-003
- Estimate: 3
- Priority: P0
- Owner: Developer
- Tasks:
  - Create folder for shared UI components.
  - Create folder for lib utilities.
  - Create folder for validation schemas.
  - Create folder for app constants.
  - Create folder for feature-specific components if needed.
  - Add path aliases if desired.
- Suggested structure:
  - `src/app`
  - `src/components`
  - `src/features`
  - `src/lib`
  - `src/constants`
  - `src/validation`
- Acceptance checks:
  - Imports are clean and predictable.
  - Folder purpose is obvious.

#### SB-004: Add Shared Constants and Types

- Product backlog link: PB-003
- Estimate: 2
- Priority: P0
- Owner: Developer
- Tasks:
  - Define task type constants.
  - Define impact level constants.
  - Define tag category constants.
  - Define CV tone constants.
  - Export TypeScript union types from constants.
  - Add label maps for UI display.
- Acceptance checks:
  - Constants compile.
  - Constants are ready for forms and filters.

#### SB-005: Create Base App Layout

- Product backlog link: PB-002
- Estimate: 5
- Priority: P0
- Owner: Developer
- Tasks:
  - Create sidebar navigation.
  - Add Dashboard, Logs, Weekly Review, CV Builder, Export links.
  - Add icons from Lucide React.
  - Add active route styling.
  - Add main content container.
  - Add responsive behavior for smaller screens.
- Acceptance checks:
  - Navigation works across planned routes.
  - Layout does not overflow on desktop or tablet widths.

#### SB-006: Create Placeholder Pages

- Product backlog link: PB-002
- Estimate: 2
- Priority: P0
- Owner: Developer
- Tasks:
  - Create `/`.
  - Create `/logs`.
  - Create `/logs/new`.
  - Create `/weekly`.
  - Create `/cv-builder`.
  - Create `/export`.
  - Add simple placeholder states for each route.
- Acceptance checks:
  - Every sidebar link opens a route.
  - No route returns 404 except unsupported routes.

### Sprint 0 Deliverable

A runnable Next.js app with navigation, layout, dependencies, constants, and placeholder pages.

### Sprint 0 QA

- Run `npm run dev`.
- Open all planned routes.
- Run `npm run lint`.
- Confirm UI does not show scaffold marketing content.

## Sprint 1: Database, Validation, and Seed Data

### Sprint Goal

Add persistent local storage and validation for the core Work2CV data model.

### Sprint Backlog Items

#### SB-007: Initialize Prisma and Supabase

- Product backlog link: PB-004
- Estimate: 5
- Priority: P0
- Owner: Developer
- Tasks:
  - Run Prisma initialization.
  - Configure Prisma datasource for Supabase hosted database.
  - Add `DATABASE_URL`, `DIRECT_URL`, and Supabase public env examples.
  - Ensure local database file is ignored from git if needed.
  - Add Prisma client helper in `src/lib`.
  - Verify Prisma generate works.
- Acceptance checks:
  - Prisma can validate against the Supabase datasource configuration.
  - Prisma client helper can be imported by server code.

#### SB-008: Define Prisma Schema

- Product backlog link: PB-005, PB-006, PB-007, PB-008
- Estimate: 8
- Priority: P0
- Owner: Developer
- Tasks:
  - Add `WorkLog` model.
  - Add `Tag` model.
  - Add `WorkLogTag` join model.
  - Add `WeeklyReview` model.
  - Add `CvBullet` model.
  - Add enum-like string fields or Prisma enums for task type, impact level, category, and tone.
  - Add timestamps.
  - Add indexes for date, task type, impact level, and tag name.
- Acceptance checks:
  - Schema validates.
  - Relations are correct.
  - Migration can be generated.

#### SB-009: Create First Migration

- Product backlog link: PB-004
- Estimate: 2
- Priority: P0
- Owner: Developer
- Tasks:
  - Run first Prisma migration.
  - Generate Prisma client.
  - Check database tables exist.
  - Confirm migration files are created.
- Acceptance checks:
  - Migration completes successfully.
  - App still starts.

#### SB-010: Add Validation Schemas

- Product backlog link: PB-009
- Estimate: 5
- Priority: P0
- Owner: Developer
- Tasks:
  - Create work log create schema.
  - Create work log update schema.
  - Create tag create schema.
  - Create weekly review schema.
  - Create CV bullet generation schema.
  - Create export request schema.
  - Add helper for formatting validation errors.
- Acceptance checks:
  - Schemas accept valid sample data.
  - Schemas reject missing required fields.
  - Update schemas support partial updates.

#### SB-011: Add Seed Script

- Product backlog link: PB-010
- Estimate: 3
- Priority: P1
- Owner: Developer
- Tasks:
  - Add Prisma seed script.
  - Create realistic tags.
  - Create at least 8 work logs.
  - Include feature, bugfix, testing, documentation, meeting, onboarding logs.
  - Add at least one weekly review.
  - Add at least two saved CV bullets.
- Acceptance checks:
  - Seed command runs.
  - Seeded dashboard has enough data for visual testing.
  - Re-running seed does not make data unusable.

### Sprint 1 Deliverable

Database schema, validation layer, Prisma migration, and seed data are ready.

### Sprint 1 QA

- Run Prisma validate.
- Run migration.
- Run seed.
- Start app and confirm no runtime errors.
- Run `npm run lint`.

## Sprint 2: Work Log CRUD and Tagging

### Sprint Goal

Make the app useful for daily internship logging.

### Sprint Backlog Items

#### SB-012: Implement Logs API

- Product backlog link: PB-011
- Estimate: 8
- Priority: P0
- Owner: Developer
- Tasks:
  - Implement `GET /api/logs`.
  - Implement `POST /api/logs`.
  - Implement `GET /api/logs/[id]`.
  - Implement `PATCH /api/logs/[id]`.
  - Implement `DELETE /api/logs/[id]`.
  - Include tags in returned logs.
  - Use Zod validation.
  - Add consistent error responses.
- Acceptance checks:
  - CRUD works with valid data.
  - Invalid payload returns 400.
  - Missing log returns 404.
  - Deleting log removes tag relations.

#### SB-013: Implement Tags API

- Product backlog link: PB-012
- Estimate: 5
- Priority: P0
- Owner: Developer
- Tasks:
  - Implement `GET /api/tags`.
  - Implement `POST /api/tags`.
  - Normalize tag names.
  - Prevent duplicate category/name pairs.
  - Return created or existing tag predictably.
- Acceptance checks:
  - Existing tags load.
  - New tag can be created.
  - Duplicate tags do not break the app.

#### SB-014: Build Log List UI

- Product backlog link: PB-013
- Estimate: 8
- Priority: P0
- Owner: Developer
- Tasks:
  - Fetch logs from API.
  - Render logs by newest date first.
  - Show date, title, task type, impact, tags, and link count.
  - Add create log button.
  - Add row click or detail link.
  - Add empty state.
  - Add loading and error states.
- Acceptance checks:
  - Seeded logs appear.
  - Empty database displays useful message.
  - User can navigate to create page.

#### SB-015: Build Log Filters

- Product backlog link: PB-014
- Estimate: 8
- Priority: P0
- Owner: Developer
- Tasks:
  - Add text search input.
  - Add date range filter.
  - Add task type filter.
  - Add impact level filter.
  - Add tag filter.
  - Add clear filters action.
  - Preserve filters in URL query or component state.
  - Ensure filtered results update without full page break.
- Acceptance checks:
  - Search finds title and body fields.
  - Task filter works.
  - Impact filter works.
  - Tag filter works.
  - Clear filters resets list.

#### SB-016: Build Log Create Form

- Product backlog link: PB-015
- Estimate: 8
- Priority: P0
- Owner: Developer
- Tasks:
  - Build form fields for all log data.
  - Default date to today.
  - Use select or segmented control for task type.
  - Use select or segmented control for impact level.
  - Build reusable tag picker.
  - Allow creating new tags from form.
  - Allow adding multiple links.
  - Show validation errors.
  - Submit to API.
  - Redirect after successful create.
- Acceptance checks:
  - User can create complete log.
  - User can create minimal valid log.
  - Invalid form shows messages.
  - Created log appears in list.

#### SB-017: Build Log Detail and Edit Flow

- Product backlog link: PB-016
- Estimate: 8
- Priority: P0
- Owner: Developer
- Tasks:
  - Create `/logs/[id]` page.
  - Load log by ID.
  - Display full details.
  - Display tags as badges.
  - Display links as clickable anchors.
  - Add edit mode.
  - Reuse log form for edit if practical.
  - Submit updates to API.
  - Add delete confirmation.
  - Handle missing log.
- Acceptance checks:
  - User can view log details.
  - User can edit and save changes.
  - User can delete after confirmation.
  - Missing log shows friendly state.

#### SB-018: Add Badges and Reusable UI Pieces

- Product backlog link: PB-017, PB-037
- Estimate: 3
- Priority: P1
- Owner: Developer
- Tasks:
  - Create task type badge component.
  - Create impact badge component.
  - Create tag badge component.
  - Create empty state component.
  - Create basic loading state component.
- Acceptance checks:
  - Badges are reused in list and detail views.
  - Text remains readable.

### Sprint 2 Deliverable

User can create, edit, delete, search, filter, and tag daily internship work logs.

### Sprint 2 QA

- Create a log with tags and links.
- Edit the log.
- Delete the log.
- Create a tag from the form.
- Filter logs by task type, impact level, and tag.
- Run `npm run lint`.

## Sprint 3: Dashboard and Problem-Solution Notes

### Sprint Goal

Turn raw logs into useful overview insights.

### Sprint Backlog Items

#### SB-019: Implement Dashboard Aggregation

- Product backlog link: PB-018
- Estimate: 5
- Priority: P0
- Owner: Developer
- Tasks:
  - Compute total logs.
  - Compute logs this week.
  - Compute top tech tags.
  - Compute task type distribution.
  - Compute impact level distribution.
  - Compute saved CV bullet count.
  - Select recent highlight logs.
- Acceptance checks:
  - Aggregation works with seeded data.
  - Aggregation works with empty database.
  - Counts update after creating or deleting logs.

#### SB-020: Build Dashboard Summary Cards

- Product backlog link: PB-019
- Estimate: 5
- Priority: P0
- Owner: Developer
- Tasks:
  - Build total logs card.
  - Build this week card.
  - Build top technology card.
  - Build saved CV bullets card.
  - Add icons.
  - Add loading and empty states.
- Acceptance checks:
  - Cards display real data.
  - Cards are readable and compact.

#### SB-021: Build Tech Ranking Widget

- Product backlog link: PB-020
- Estimate: 5
- Priority: P1
- Owner: Developer
- Tasks:
  - Display top tech tags by count.
  - Add compact bars or ranked list.
  - Show count per tag.
  - Handle no tech tags.
- Acceptance checks:
  - Ranking matches seeded data.
  - No layout break with long tag names.

#### SB-022: Build Task Distribution Widget

- Product backlog link: PB-021
- Estimate: 5
- Priority: P1
- Owner: Developer
- Tasks:
  - Display task type counts.
  - Use compact chart, bars, or list.
  - Use task type badges.
  - Handle no logs.
- Acceptance checks:
  - Distribution matches logs.
  - Empty state is useful.

#### SB-023: Build Recent Highlights Widget

- Product backlog link: PB-022, PB-032
- Estimate: 3
- Priority: P1
- Owner: Developer
- Tasks:
  - Select high-impact logs.
  - Show up to 5 recent highlights.
  - Link each highlight to detail page.
  - Show date, impact, title, and tags.
- Acceptance checks:
  - High-impact logs are visible.
  - Empty state suggests adding implemented/fixed/improved logs.

#### SB-024: Add Problem-Solution Filter

- Product backlog link: PB-023
- Estimate: 5
- Priority: P1
- Owner: Developer
- Tasks:
  - Detect logs with problem or solution content.
  - Add filter to logs page.
  - Add problem-solution section to detail page.
  - Link recent problem-solution notes from dashboard if useful.
- Acceptance checks:
  - Filter shows only relevant logs.
  - Detail page separates issue, solution, and lesson clearly.

### Sprint 3 Deliverable

Dashboard shows real progress, trends, highlights, and problem-solution notes are easier to find.

### Sprint 3 QA

- Add logs with different task types.
- Confirm dashboard counts update.
- Add problem and solution text.
- Confirm problem-solution filter works.
- Run `npm run lint`.

## Sprint 4: Weekly Review

### Sprint Goal

Help the intern summarize each week from daily logs.

### Sprint Backlog Items

#### SB-025: Implement Weekly Review API

- Product backlog link: PB-025
- Estimate: 5
- Priority: P0
- Owner: Developer
- Tasks:
  - Implement `GET /api/weekly-reviews`.
  - Implement `POST /api/weekly-reviews`.
  - Implement `PATCH /api/weekly-reviews/[id]`.
  - Implement `DELETE /api/weekly-reviews/[id]`.
  - Add validation.
  - Prevent duplicate week records or update existing record.
- Acceptance checks:
  - Review can be created.
  - Existing review can be updated.
  - Review can be deleted.
  - Invalid week range returns validation error.

#### SB-026: Build Week Selection UI

- Product backlog link: PB-026
- Estimate: 3
- Priority: P0
- Owner: Developer
- Tasks:
  - Add week picker or date picker.
  - Compute week start and week end.
  - Load logs in selected week.
  - Load existing review for selected week.
- Acceptance checks:
  - Changing week updates logs.
  - Current week is selected by default.

#### SB-027: Build Weekly Review Form

- Product backlog link: PB-026
- Estimate: 5
- Priority: P0
- Owner: Developer
- Tasks:
  - Add shipped textarea.
  - Add blockers textarea.
  - Add learned textarea.
  - Add collaboration textarea.
  - Add next focus textarea.
  - Save review.
  - Show validation and save states.
- Acceptance checks:
  - Review saves successfully.
  - Existing review is editable.
  - Empty week does not crash.

#### SB-028: Add Weekly Prefill Logic

- Product backlog link: PB-027
- Estimate: 5
- Priority: P1
- Owner: Developer
- Tasks:
  - Generate shipped text from completed work logs.
  - Generate blockers text from problem fields.
  - Generate learned text from learning fields.
  - Generate collaboration text from meetings, code review, and assisted logs.
  - Keep generated content editable.
- Acceptance checks:
  - Prefill reflects selected week logs.
  - User can modify prefilled text.
  - Prefill does not overwrite saved review unless user confirms or explicitly triggers it.

#### SB-029: Show Selected Week Log Summary

- Product backlog link: PB-026
- Estimate: 3
- Priority: P1
- Owner: Developer
- Tasks:
  - Display log count for week.
  - Display list of logs in week.
  - Show task types and tags.
  - Link each log to detail page.
- Acceptance checks:
  - User can trace review content back to logs.
  - Empty state is clear.

### Sprint 4 Deliverable

User can create and update weekly reflections using daily logs as source material.

### Sprint 4 QA

- Create logs across two weeks.
- Select each week.
- Generate prefill.
- Save review.
- Edit existing review.
- Run `npm run lint`.

## Sprint 5: CV Builder

### Sprint Goal

Convert work logs into CV-ready bullet points without external AI.

### Sprint Backlog Items

#### SB-030: Implement Offline CV Generator

- Product backlog link: PB-029
- Estimate: 8
- Priority: P0
- Owner: Developer
- Tasks:
  - Create generator utility.
  - Map impact levels to action verbs.
  - Extract tech tags from selected logs.
  - Summarize task titles and descriptions.
  - Generate concise CV variant.
  - Generate detailed CV variant.
  - Generate internship report variant.
  - Add fallback for missing tech tags.
  - Add fallback for unclear impact.
- Acceptance checks:
  - One selected log returns three variants.
  - Multiple selected logs return coherent variants.
  - No external API is called.
  - Output does not invent tools not present in logs.

#### SB-031: Add CV Bullet API

- Product backlog link: PB-030
- Estimate: 5
- Priority: P0
- Owner: Developer
- Tasks:
  - Implement `GET /api/cv-bullets`.
  - Implement `POST /api/cv-bullets/generate`.
  - Implement `PATCH /api/cv-bullets/[id]`.
  - Implement `DELETE /api/cv-bullets/[id]`.
  - Validate selected log IDs.
  - Save selected generated bullet.
- Acceptance checks:
  - Generate endpoint returns variants.
  - Saved bullet appears in list.
  - Edited bullet persists.
  - Deleted bullet disappears.

#### SB-032: Build CV Builder Selection UI

- Product backlog link: PB-031
- Estimate: 5
- Priority: P0
- Owner: Developer
- Tasks:
  - Show candidate logs.
  - Allow multi-select logs.
  - Add filters for impact and tags.
  - Highlight suggested high-value logs.
  - Show selected count.
- Acceptance checks:
  - User can select one or multiple logs.
  - User can filter candidate logs.
  - High-value logs are easy to notice.

#### SB-033: Build CV Generation and Editing UI

- Product backlog link: PB-031, PB-033
- Estimate: 8
- Priority: P0
- Owner: Developer
- Tasks:
  - Add tone/output style selector.
  - Trigger generation.
  - Display generated variants.
  - Allow editing generated text.
  - Save bullet.
  - Show saved bullets.
  - Allow delete saved bullet.
  - Add copy-to-clipboard action if quick to implement.
- Acceptance checks:
  - User can generate bullet.
  - User can edit before saving.
  - Saved bullet remains after refresh.
  - Saved bullet can be deleted.

#### SB-034: Add High-Value Log Suggestions

- Product backlog link: PB-032
- Estimate: 5
- Priority: P1
- Owner: Developer
- Tasks:
  - Score logs by impact.
  - Add points for problem-solution fields.
  - Add points for links.
  - Add points for multiple tech tags.
  - Sort or label suggestions.
- Acceptance checks:
  - Logs with implemented, fixed, improved, reviewed impact are prioritized.
  - Suggested logs appear in CV Builder.
  - Suggested logs appear in Dashboard if widget already supports it.

### Sprint 5 Deliverable

User can select logs, generate offline CV bullets, edit them, save them, and reuse them.

### Sprint 5 QA

- Generate bullet from one feature log.
- Generate bullet from multiple logs.
- Generate bullet from log with no tech tags.
- Edit and save generated bullet.
- Delete saved bullet.
- Run `npm run lint`.

## Sprint 6: Markdown Export and Final MVP Polish

### Sprint Goal

Make Work2CV data portable and bring MVP quality to a usable level.

### Sprint Backlog Items

#### SB-035: Implement Markdown Export Utility

- Product backlog link: PB-034
- Estimate: 5
- Priority: P0
- Owner: Developer
- Tasks:
  - Create export utility.
  - Format selected logs as Markdown.
  - Format weekly review as Markdown.
  - Format CV bullets as Markdown.
  - Format full internship summary as Markdown.
  - Include dates, tags, task types, and links where useful.
- Acceptance checks:
  - Markdown is readable.
  - Empty optional fields are omitted cleanly.
  - Multiple export types work.

#### SB-036: Implement Export API

- Product backlog link: PB-035
- Estimate: 3
- Priority: P0
- Owner: Developer
- Tasks:
  - Implement `POST /api/export/markdown`.
  - Validate export type.
  - Validate selected IDs.
  - Return Markdown text.
  - Return helpful errors.
- Acceptance checks:
  - Valid export returns Markdown.
  - Invalid ID returns error.
  - Empty selection behavior is predictable.

#### SB-037: Build Export Center UI

- Product backlog link: PB-036
- Estimate: 8
- Priority: P1
- Owner: Developer
- Tasks:
  - Build export type selector.
  - Build item selector based on export type.
  - Add generate preview action.
  - Show Markdown preview.
  - Add copy-to-clipboard.
  - Add download `.md` file.
  - Add empty and error states.
- Acceptance checks:
  - User can export logs.
  - User can export weekly review.
  - User can export CV bullets.
  - User can copy Markdown.
  - User can download Markdown file.

#### SB-038: Add Global Empty and Error States

- Product backlog link: PB-037
- Estimate: 5
- Priority: P0
- Owner: Developer
- Tasks:
  - Review every page for loading state.
  - Review every page for empty state.
  - Review every page for error state.
  - Add delete confirmations.
  - Add user-friendly validation messages.
- Acceptance checks:
  - Empty database is usable.
  - API failure does not produce blank screen.
  - Dangerous actions require confirmation.

#### SB-039: Responsive and Accessibility Pass

- Product backlog link: PB-038, PB-039
- Estimate: 5
- Priority: P1
- Owner: Developer
- Tasks:
  - Check dashboard at common desktop width.
  - Check dashboard at tablet width.
  - Check forms at narrow width.
  - Ensure inputs have labels.
  - Ensure icon buttons have accessible names.
  - Ensure focus states are visible.
  - Ensure text does not overflow buttons or badges.
- Acceptance checks:
  - UI remains readable across common widths.
  - Keyboard navigation is acceptable.
  - No obvious text clipping remains.

#### SB-040: Add Manual QA Checklist

- Product backlog link: PB-042
- Estimate: 2
- Priority: P0
- Owner: Developer
- Tasks:
  - Create QA checklist in project docs or README.
  - Include work log CRUD flow.
  - Include tag flow.
  - Include dashboard flow.
  - Include weekly review flow.
  - Include CV builder flow.
  - Include export flow.
- Acceptance checks:
  - Checklist can be followed by another person.
  - Checklist covers MVP completion criteria.

#### SB-041: Final Build Verification

- Product backlog link: PB-043
- Estimate: 2
- Priority: P0
- Owner: Developer
- Tasks:
  - Run `npm run lint`.
  - Run `npm run build`.
  - Fix TypeScript errors.
  - Fix lint errors.
  - Manually test critical flows.
- Acceptance checks:
  - Lint passes.
  - Build passes.
  - Critical user flows pass.

### Sprint 6 Deliverable

MVP is portable, polished enough for daily use, and verified by lint/build/manual QA.

### Sprint 6 QA

- Export all supported Markdown types.
- Copy and download Markdown.
- Check empty states.
- Check form validation.
- Run `npm run lint`.
- Run `npm run build`.

## Post-MVP Sprint 7: Optional Enhancements

### Sprint Goal

Add integrations or advanced export features only after MVP is stable.

### Candidate Items

#### SB-042: Optional OpenAI CV Rewriter

- Product backlog link: PB-044
- Estimate: 13
- Priority: P2
- Tasks:
  - Add optional API key configuration.
  - Keep offline generator as default.
  - Design prompt that uses selected logs as source truth.
  - Display AI output as editable draft.
  - Add clear error handling when API key is missing.

#### SB-043: GitHub Import

- Product backlog link: PB-045
- Estimate: 13
- Priority: P2
- Tasks:
  - Add GitHub URL parser.
  - Support PR URL metadata.
  - Support commit URL metadata.
  - Create draft work log from imported metadata.
  - Keep manual log flow unchanged.

#### SB-044: PDF Export

- Product backlog link: PB-046
- Estimate: 8
- Priority: P2
- Tasks:
  - Choose PDF generation approach.
  - Add weekly review PDF export.
  - Add internship summary PDF export.
  - Verify layout visually.

#### SB-045: Backup and Restore

- Product backlog link: PB-047
- Estimate: 8
- Priority: P2
- Tasks:
  - Export all data as JSON.
  - Validate imported JSON.
  - Add duplicate handling.
  - Add restore confirmation.

## Sprint 8: Deployment and CI/CD

### Sprint Goal

Make Work2CV deployable as a free web app with CI checks and documented production constraints.

### Sprint Backlog Items

#### SB-046: Add GitHub Actions CI Workflow

- Product backlog link: PB-048
- Estimate: 3
- Priority: P0
- Owner: Developer
- Tasks:
  - Create `.github/workflows/ci.yml`.
  - Trigger on pull requests to `main`.
  - Trigger on pushes to `main`.
  - Use Node.js 20.
  - Install dependencies with `npm ci`.
  - Run `npm run lint`.
  - Run `npm run build`.
- Acceptance checks:
  - Workflow YAML exists.
  - Workflow uses official checkout and setup-node actions.
  - Local lint and build pass.

#### SB-047: Add Deployment Documentation

- Product backlog link: PB-049
- Estimate: 2
- Priority: P0
- Owner: Developer
- Tasks:
  - Create deployment documentation.
  - Recommend Vercel Hobby as default free app hosting.
  - Explain GitHub integration.
  - Explain why GitHub Pages is not ideal for full-stack MVP.
  - Explain that Supabase is the database for local, preview, and production environments.
- Acceptance checks:
  - Deployment doc is clear enough to follow.
  - Free deployment options are compared.
  - Production database caveat is explicit.

#### SB-048: Update Agent Config for Deployment Work

- Product backlog link: PB-049, PB-052
- Estimate: 2
- Priority: P0
- Owner: Developer
- Tasks:
  - Update `AGENTS.md`.
  - Point agents to `docs/RULE.md`, `docs/DEPLOYMENT.md`, and `docs/CI-CD.md`.
  - Require lint/build checks for deployment-related tasks.
  - Prohibit committing secrets.
- Acceptance checks:
  - Agent config references deployment docs.
  - Agent config explains CI/CD expectations.
  - No secret values are added.

#### SB-049: Update Environment Variable Documentation

- Product backlog link: PB-050
- Estimate: 2
- Priority: P0
- Owner: Developer
- Tasks:
  - Review `.env.example`.
  - Document local `DATABASE_URL`.
  - Document production `DATABASE_URL` setup in Vercel.
  - Make clear that real values belong in Vercel dashboard or local `.env`, not git.
- Acceptance checks:
  - `.env.example` contains no secrets.
  - Deployment docs describe environment variable setup.

#### SB-050: Define Production Database Path

- Product backlog link: PB-051
- Estimate: 5
- Priority: P1
- Owner: Developer
- Tasks:
  - Document Supabase hosted database role in local and deployed environments.
  - Document Supabase hosted database recommendation for deployed CRUD.
  - List Supabase Free as options.
  - Explain Prisma provider implications.
  - Explain that DB migration should happen before deployed CRUD is considered complete.
- Acceptance checks:
  - Database deployment constraints are clear.
  - Agent prompts require Supabase hosted database and warn against SQLite/local PostgreSQL setup.

#### SB-051: Add Deploy Readiness QA Checklist

- Product backlog link: PB-052
- Estimate: 2
- Priority: P0
- Owner: Developer
- Tasks:
  - Add deployment checks to `docs/QA-CHECKLIST.md`.
  - Include lint, build, CI workflow, env vars, root route smoke test, and production DB caveat.
- Acceptance checks:
  - QA checklist covers deployment readiness.
  - Checklist is actionable.

### Sprint 8 QA

- Run `npm run lint`.
- Run `npm run build`.
- Verify `.github/workflows/ci.yml` exists.
- Verify deployment docs exist.
- Verify no secrets are committed.
- Smoke-test root route locally.

## MVP Sprint Order Summary

1. Sprint 0: project setup and layout.
2. Sprint 1: database, validation, seed data.
3. Sprint 2: work log CRUD and tagging.
4. Sprint 3: dashboard analytics and problem-solution notes.
5. Sprint 4: weekly review.
6. Sprint 5: CV bullet builder.
7. Sprint 6: Markdown export and final polish.

## Recommended First Development Command Sequence

```powershell
cd "D:\WorkSpace\IndividualProject\Work2CV"
npx create-next-app@latest . --ts --eslint --tailwind --app --src-dir
npm install prisma @prisma/client zod lucide-react
npx prisma init --datasource-provider sqlite
npm run dev
```

## MVP Release Checklist

- Work log CRUD works.
- Tags can be created and reused.
- Dashboard stats use real data.
- Weekly reviews can be created and prefilled.
- CV bullets can be generated offline.
- Saved bullets can be edited.
- Markdown export works.
- Empty states are clear.
- Validation errors are clear.
- Lint passes.
- Build passes.



