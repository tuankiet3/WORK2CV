# Work2CV Product Backlog

## Product Vision

Work2CV is a local-first internship work log dashboard that helps a developer intern record daily work, track technical growth, and convert real internship activity into CV-ready bullet points and weekly reports.

## Backlog Legend

- Priority: `P0` must-have, `P1` should-have, `P2` nice-to-have.
- Estimate: story points using Fibonacci scale.
- Status: `Todo`, `In Progress`, `Done`.
- MVP: included in first usable release.

## Epic 1: Project Foundation

### PB-001: Initialize Work2CV Next.js App

- Priority: P0
- Estimate: 3
- MVP: Yes
- Status: Todo
- User story: As a developer, I want a clean Next.js project foundation so the app can be implemented with a maintainable structure.
- Description: Scaffold the app with Next.js App Router, TypeScript, Tailwind CSS, ESLint, and a predictable folder structure.
- Acceptance criteria:
  - Next.js app runs locally with `npm run dev`.
  - TypeScript is enabled.
  - Tailwind CSS is configured and usable.
  - ESLint command is available.
  - App uses App Router under `src/app` or the selected project default.
  - Root page renders a usable placeholder dashboard.
- Notes:
  - This project lives inside `D:\WorkSpace\IndividualProject\Work2CV`.
  - Keep it independent from the existing Windows Spotlight Launcher app.

### PB-002: Define Base UI Layout

- Priority: P0
- Estimate: 5
- MVP: Yes
- Status: Todo
- User story: As a user, I want a consistent dashboard layout so I can navigate all Work2CV features easily.
- Description: Create the app shell with sidebar navigation, main content area, page header, and responsive behavior.
- Acceptance criteria:
  - Sidebar contains links to Dashboard, Logs, Weekly Review, CV Builder, and Export.
  - Active route is visually highlighted.
  - Layout works on desktop and tablet widths.
  - Mobile layout collapses navigation into a compact menu or top navigation.
  - No marketing landing page appears before the product experience.
- UI requirements:
  - Use compact productivity dashboard styling.
  - Use Lucide icons in navigation.
  - Keep cards restrained with 8px radius or less.

### PB-003: Configure Shared Constants and Types

- Priority: P0
- Estimate: 2
- MVP: Yes
- Status: Todo
- User story: As a developer, I want shared constants and types so forms, filters, APIs, and generator logic stay consistent.
- Description: Define task types, impact levels, tag categories, CV tones, and reusable TypeScript types.
- Acceptance criteria:
  - Task types include onboarding, feature, bugfix, testing, refactor, code review, documentation, meeting, research, support.
  - Impact levels include learned, assisted, implemented, reviewed, fixed, improved.
  - Tag categories include tech, domain, skill, tool.
  - CV tones include concise CV, detailed CV, internship report.
  - Constants are reused by forms, badges, filters, and API validation.

## Epic 2: Database and Validation

### PB-004: Configure Prisma and Supabase

- Priority: P0
- Estimate: 5
- MVP: Yes
- Status: Todo
- User story: As a user, I want my internship logs stored locally so I can use the app without cloud setup or login.
- Description: Add Prisma with Supabase hosted database for persistent storage in all environments.
- Acceptance criteria:
  - Prisma is installed and configured.
  - Supabase database is configured through `DATABASE_URL` and `DIRECT_URL`.
  - `prisma migrate dev` creates the schema successfully.
  - A Prisma client helper is available for server routes.
  - Generated database files are ignored from git where appropriate.

### PB-005: Implement WorkLog Data Model

- Priority: P0
- Estimate: 3
- MVP: Yes
- Status: Todo
- User story: As an intern, I want to save detailed daily work logs so I can remember what I actually did.
- Description: Create the `WorkLog` model with fields from the plan.
- Acceptance criteria:
  - `WorkLog` has `id`, `date`, `title`, `description`, `taskType`, `impactLevel`, `problem`, `solution`, `learning`, `links`, `createdAt`, `updatedAt`.
  - Required fields are date, title, task type, and impact level.
  - Optional long-text fields support empty values.
  - Links can store multiple references in a structured or serialized format.
  - `createdAt` and `updatedAt` are automatically handled.

### PB-006: Implement Tag and WorkLogTag Models

- Priority: P0
- Estimate: 3
- MVP: Yes
- Status: Todo
- User story: As an intern, I want to tag logs by technology, domain, skill, and tool so I can later filter and summarize my growth.
- Description: Add tag models and many-to-many relation with work logs.
- Acceptance criteria:
  - `Tag` has `id`, `name`, `category`, `createdAt`.
  - `WorkLogTag` links logs and tags.
  - Tag names are unique per category.
  - Deleting a work log removes its join rows.
  - Existing tags can be reused across logs.

### PB-007: Implement WeeklyReview Model

- Priority: P0
- Estimate: 2
- MVP: Yes
- Status: Todo
- User story: As an intern, I want weekly reflection records so I can prepare internship reports and track progress over time.
- Description: Add model for weekly reflections.
- Acceptance criteria:
  - `WeeklyReview` has `id`, `weekStart`, `weekEnd`, `shipped`, `blockers`, `learned`, `collaboration`, `nextFocus`, `createdAt`, `updatedAt`.
  - One review can be saved per week range.
  - Week date range can be queried from the API.

### PB-008: Implement CvBullet Model

- Priority: P0
- Estimate: 2
- MVP: Yes
- Status: Todo
- User story: As an intern, I want to save generated CV bullets so I can refine and reuse them later.
- Description: Add model for generated and manually edited CV bullets.
- Acceptance criteria:
  - `CvBullet` has `id`, `sourceLogIds`, `content`, `tone`, `createdAt`, `updatedAt`.
  - A bullet can reference one or more work logs.
  - Saved bullets can be edited and deleted.

### PB-009: Add Zod Validation Schemas

- Priority: P0
- Estimate: 5
- MVP: Yes
- Status: Todo
- User story: As a developer, I want validation schemas so invalid data does not enter the app.
- Description: Create validation for logs, tags, weekly reviews, CV bullets, and export requests.
- Acceptance criteria:
  - Work log create and update schemas exist.
  - Tag create schema validates name and category.
  - Weekly review schema validates date range and text fields.
  - CV generation schema validates selected log IDs and tone.
  - API routes return clear validation errors.

### PB-010: Add Seed Data

- Priority: P1
- Estimate: 3
- MVP: Yes
- Status: Todo
- User story: As a developer, I want realistic seed data so I can test the dashboard and flows quickly.
- Description: Seed realistic internship logs, tags, reviews, and bullets.
- Acceptance criteria:
  - Seed command inserts at least 8 work logs.
  - Seed data covers at least 5 task types.
  - Seed data includes tech, tool, skill, and domain tags.
  - Seed can be run repeatedly without creating excessive duplicates.

## Epic 3: Work Log Management

### PB-011: Create Work Log API Routes

- Priority: P0
- Estimate: 8
- MVP: Yes
- Status: Todo
- User story: As an intern, I want the app to create, read, update, and delete work logs so I can maintain my internship records.
- Description: Implement API routes for work log CRUD.
- Acceptance criteria:
  - `GET /api/logs` returns logs with tags.
  - `POST /api/logs` creates a log and attaches tags.
  - `GET /api/logs/[id]` returns one log with tags.
  - `PATCH /api/logs/[id]` updates log fields and tag relations.
  - `DELETE /api/logs/[id]` removes a log.
  - API returns 404 for unknown log IDs.
  - API returns 400 for invalid payloads.

### PB-012: Create Tag API Routes

- Priority: P0
- Estimate: 5
- MVP: Yes
- Status: Todo
- User story: As an intern, I want to create and reuse tags so my logs stay organized.
- Description: Implement tag listing and creation endpoints.
- Acceptance criteria:
  - `GET /api/tags` returns tags grouped or sortable by category.
  - `POST /api/tags` creates a tag.
  - Duplicate tag creation reuses existing tag or returns a clear conflict response.
  - Tag names are trimmed and normalized.

### PB-013: Build Work Log List Page

- Priority: P0
- Estimate: 8
- MVP: Yes
- Status: Todo
- User story: As an intern, I want to see all logs in one place so I can review my internship activity quickly.
- Description: Build `/logs` page with table/list view.
- Acceptance criteria:
  - Page displays date, title, task type, impact, tags, and link count.
  - Logs are sorted by newest date first.
  - Empty state appears when no logs exist.
  - Each row links to detail or edit page.
  - Create log button is visible.
  - Layout remains readable on smaller screens.

### PB-014: Add Search and Filters for Work Logs

- Priority: P0
- Estimate: 8
- MVP: Yes
- Status: Todo
- User story: As an intern, I want to filter logs by date, task type, impact, and tags so I can find useful evidence later.
- Description: Add filter controls to `/logs`.
- Acceptance criteria:
  - Search matches title, description, problem, solution, and learning.
  - Date filter supports from and to date.
  - Task type filter supports multiple values.
  - Impact level filter supports multiple values.
  - Tag filter supports technology and category filters.
  - Clear filters resets the list.
  - Filter state is reflected in URL query parameters or preserved during the session.

### PB-015: Build Work Log Create Form

- Priority: P0
- Estimate: 8
- MVP: Yes
- Status: Todo
- User story: As an intern, I want a guided form for daily logs so I do not forget important details.
- Description: Build `/logs/new` form.
- Acceptance criteria:
  - User can enter all WorkLog fields.
  - Required fields are visually indicated.
  - Date defaults to today.
  - Task type and impact level use select or segmented controls.
  - Tags can be selected from existing tags.
  - User can create a new tag from the form.
  - Links can be added as multiple entries.
  - Save creates the log and redirects to the log detail or list page.
  - Validation messages are shown near fields.

### PB-016: Build Work Log Detail and Edit Page

- Priority: P0
- Estimate: 8
- MVP: Yes
- Status: Todo
- User story: As an intern, I want to review and update a log so my records stay accurate.
- Description: Build `/logs/[id]` page with view and edit behavior.
- Acceptance criteria:
  - Page shows all log details.
  - Tags are displayed as badges.
  - Links are clickable.
  - User can switch to edit mode.
  - User can save edits.
  - User can delete the log after confirmation.
  - 404 state appears for missing logs.

### PB-017: Add Impact and Task Type Badges

- Priority: P1
- Estimate: 3
- MVP: Yes
- Status: Todo
- User story: As an intern, I want visual badges so I can scan logs quickly.
- Description: Add consistent badge components for task types and impact levels.
- Acceptance criteria:
  - Each task type has a readable badge style.
  - Each impact level has a readable badge style.
  - Badge text fits without wrapping awkwardly.
  - Components are reused across dashboard, logs, and detail pages.

## Epic 4: Dashboard Analytics

### PB-018: Implement Dashboard Data Aggregation

- Priority: P0
- Estimate: 5
- MVP: Yes
- Status: Todo
- User story: As an intern, I want summarized progress so I can quickly see what I have done.
- Description: Compute dashboard metrics from saved logs.
- Acceptance criteria:
  - Total work log count is computed.
  - Logs this week count is computed.
  - Most used tech tags are computed.
  - Task type distribution is computed.
  - Impact level distribution is computed.
  - Recent highlights are selected from high-impact logs.
  - Empty state metrics do not crash.

### PB-019: Build Dashboard Summary Cards

- Priority: P0
- Estimate: 5
- MVP: Yes
- Status: Todo
- User story: As an intern, I want summary cards so I can read key progress at a glance.
- Description: Build top dashboard cards.
- Acceptance criteria:
  - Cards show total logs, logs this week, top tech, and saved CV bullets.
  - Cards use icons.
  - Cards are responsive.
  - Cards use real data.
  - Empty values display cleanly.

### PB-020: Build Tech Stack Heatmap or Ranking

- Priority: P1
- Estimate: 5
- MVP: Yes
- Status: Todo
- User story: As an intern, I want to see which technologies I used most so I know what to emphasize in my CV.
- Description: Display technology tag frequency.
- Acceptance criteria:
  - Tech tags are counted from work logs.
  - Top technologies are shown visually.
  - Each item shows name and count.
  - View works with zero, few, and many tags.

### PB-021: Build Task Type Distribution

- Priority: P1
- Estimate: 5
- MVP: Yes
- Status: Todo
- User story: As an intern, I want to see the kind of work I did so I can understand my internship profile.
- Description: Display task types by count.
- Acceptance criteria:
  - Distribution includes all task types with count greater than zero.
  - User can see relative frequency.
  - Chart or compact bars render without layout shift.
  - Empty state is handled.

### PB-022: Build Recent Highlights Widget

- Priority: P1
- Estimate: 3
- MVP: Yes
- Status: Todo
- User story: As an intern, I want to see high-value logs so I can identify CV material quickly.
- Description: Show recent logs with impact levels implemented, reviewed, fixed, or improved.
- Acceptance criteria:
  - Widget shows up to 5 recent highlight logs.
  - Each item links to the log detail.
  - Item shows title, date, impact, and key tags.
  - Empty state suggests creating a high-impact log.

## Epic 5: Problem-Solution Library

### PB-023: Mark Logs as Problem-Solution Notes

- Priority: P1
- Estimate: 5
- MVP: Yes
- Status: Todo
- User story: As an intern, I want logs with problems and solutions to be easy to find so I can reuse debugging knowledge.
- Description: Add UI and data behavior to identify logs containing problem-solution content.
- Acceptance criteria:
  - Logs with problem or solution fields are identified as problem-solution notes.
  - User can filter logs to only problem-solution notes.
  - Detail page displays problem, solution, and learning in a clear section.
  - Dashboard can link to recent problem-solution notes.

### PB-024: Add Problem-Solution View

- Priority: P2
- Estimate: 5
- MVP: No
- Status: Todo
- User story: As an intern, I want a focused problem-solution library so I can quickly revisit debugging lessons.
- Description: Optional dedicated page or tab for debugging notes.
- Acceptance criteria:
  - Page lists notes by newest first.
  - Search matches problem, solution, and learning.
  - Notes show related tags.
  - Empty state explains that logs with problem/solution will appear here.

## Epic 6: Weekly Review

### PB-025: Create Weekly Review API Routes

- Priority: P0
- Estimate: 5
- MVP: Yes
- Status: Todo
- User story: As an intern, I want to save weekly reflections so I can build internship reports over time.
- Description: Implement weekly review CRUD.
- Acceptance criteria:
  - `GET /api/weekly-reviews` returns reviews.
  - `POST /api/weekly-reviews` creates a review.
  - `PATCH /api/weekly-reviews/[id]` updates a review.
  - `DELETE /api/weekly-reviews/[id]` deletes a review.
  - Duplicate review for same week is prevented or updates existing review.

### PB-026: Build Weekly Review Page

- Priority: P0
- Estimate: 8
- MVP: Yes
- Status: Todo
- User story: As an intern, I want a weekly review page so I can summarize what happened each week.
- Description: Build `/weekly` page with week selector, logs list, and reflection form.
- Acceptance criteria:
  - User can select a week.
  - Page shows logs from selected week.
  - Form includes shipped, blockers, learned, collaboration, next focus.
  - Existing review loads when available.
  - User can save or update review.
  - Empty week state is handled.

### PB-027: Prefill Weekly Review from Logs

- Priority: P1
- Estimate: 5
- MVP: Yes
- Status: Todo
- User story: As an intern, I want weekly reviews to be prefilled from logs so reflection takes less effort.
- Description: Generate draft review text from logs in selected week.
- Acceptance criteria:
  - Prefill shipped from feature, bugfix, testing, refactor, documentation logs.
  - Prefill learned from learning fields.
  - Prefill blockers from problem fields.
  - Prefill collaboration from meeting, code review, and assisted logs.
  - User can edit generated text before saving.

### PB-028: Weekly Timeline Summary

- Priority: P2
- Estimate: 5
- MVP: No
- Status: Todo
- User story: As an intern, I want a timeline of weekly growth so I can see progress across the internship.
- Description: Show week-by-week summary of log counts, technologies, and highlights.
- Acceptance criteria:
  - Timeline groups activity by week.
  - Each week shows count, top tags, and review status.
  - Timeline links to weekly review.

## Epic 7: CV Bullet Builder

### PB-029: Create CV Bullet Generator Logic

- Priority: P0
- Estimate: 8
- MVP: Yes
- Status: Todo
- User story: As an intern, I want to generate CV bullets from work logs so I can update my CV with concrete evidence.
- Description: Implement deterministic offline templates.
- Acceptance criteria:
  - Generator accepts selected logs and tone.
  - Generator produces concise CV, detailed CV, and internship report variants.
  - Generator uses task type, impact level, title, description, tech tags, and learning fields.
  - Generator handles missing tech tags gracefully.
  - Generator handles unclear impact with softer wording.
  - No external API is called.

### PB-030: Create CV Bullet API Routes

- Priority: P0
- Estimate: 5
- MVP: Yes
- Status: Todo
- User story: As an intern, I want generated bullets to be saved and edited so I can refine them later.
- Description: Implement API routes for generation and saved bullets.
- Acceptance criteria:
  - `GET /api/cv-bullets` returns saved bullets.
  - `POST /api/cv-bullets/generate` returns generated variants.
  - `PATCH /api/cv-bullets/[id]` updates saved bullet content.
  - `DELETE /api/cv-bullets/[id]` deletes a bullet.
  - Generated bullet can be saved with source log IDs.

### PB-031: Build CV Builder Page

- Priority: P0
- Estimate: 8
- MVP: Yes
- Status: Todo
- User story: As an intern, I want a CV builder page so I can choose logs and generate useful CV statements.
- Description: Build `/cv-builder`.
- Acceptance criteria:
  - User can browse and select logs.
  - User can filter candidate logs by impact and tag.
  - User can choose tone or output style.
  - User can generate bullets.
  - Generated bullets are editable before saving.
  - Saved bullets list appears on the page.
  - Empty state guides user to create logs first.

### PB-032: Add High-Value Log Detection

- Priority: P1
- Estimate: 5
- MVP: Yes
- Status: Todo
- User story: As an intern, I want the app to suggest strong logs for CV bullets so I do not miss important contributions.
- Description: Detect logs likely to be CV-worthy.
- Acceptance criteria:
  - Logs with impact implemented, fixed, improved, or reviewed are suggested.
  - Logs with problem and solution are suggested.
  - Logs with links are suggested.
  - Logs with multiple tech tags are suggested.
  - Suggestions appear in CV Builder and Dashboard.

### PB-033: Saved Bullet Editing Experience

- Priority: P1
- Estimate: 5
- MVP: Yes
- Status: Todo
- User story: As an intern, I want to edit generated bullets so the final wording sounds natural and accurate.
- Description: Add edit/save/delete interactions for CV bullets.
- Acceptance criteria:
  - User can edit bullet text inline or in a modal.
  - User can save changes.
  - User can delete a bullet after confirmation.
  - Source logs remain visible.
  - User can copy a bullet to clipboard.

## Epic 8: Markdown Export

### PB-034: Implement Markdown Export Utility

- Priority: P0
- Estimate: 5
- MVP: Yes
- Status: Todo
- User story: As an intern, I want Markdown exports so I can reuse my data in reports, notes, and CV drafts.
- Description: Build server-side or shared utility to format app data as Markdown.
- Acceptance criteria:
  - Utility can export selected logs.
  - Utility can export one weekly review.
  - Utility can export saved CV bullets.
  - Utility can export full internship summary.
  - Output is readable and structured.

### PB-035: Create Export API Route

- Priority: P0
- Estimate: 3
- MVP: Yes
- Status: Todo
- User story: As an intern, I want export requests handled consistently so the UI can generate Markdown reliably.
- Description: Implement `POST /api/export/markdown`.
- Acceptance criteria:
  - API accepts export type and selected IDs.
  - API returns Markdown text.
  - API validates requested IDs.
  - API handles empty selections with a clear error or useful empty output.

### PB-036: Build Export Center Page

- Priority: P1
- Estimate: 8
- MVP: Yes
- Status: Todo
- User story: As an intern, I want an export page so I can prepare CV and report material quickly.
- Description: Build `/export`.
- Acceptance criteria:
  - User can choose export type.
  - User can select logs, weekly reviews, or bullets depending on type.
  - Markdown preview is shown.
  - User can copy Markdown to clipboard.
  - User can download Markdown as a `.md` file.

## Epic 9: UI Quality and Usability

### PB-037: Add Loading, Empty, and Error States

- Priority: P0
- Estimate: 5
- MVP: Yes
- Status: Todo
- User story: As a user, I want the app to respond clearly in every state so I know what to do next.
- Description: Add consistent states across pages.
- Acceptance criteria:
  - Loading states appear during data fetches or mutations.
  - Empty states appear on dashboard, logs, weekly, CV builder, and export.
  - API errors are visible to the user.
  - Form validation errors are specific.
  - Delete confirmation prevents accidental removal.

### PB-038: Add Responsive Polish

- Priority: P1
- Estimate: 5
- MVP: Yes
- Status: Todo
- User story: As a user, I want the app to work on different screen sizes so I can use it comfortably.
- Description: Ensure UI works on common desktop and tablet sizes.
- Acceptance criteria:
  - Dashboard does not overflow on tablet widths.
  - Forms remain readable on narrow widths.
  - Tables collapse or become cards on small screens.
  - Buttons and badges do not clip text.
  - Navigation remains usable.

### PB-039: Add Accessibility Basics

- Priority: P1
- Estimate: 5
- MVP: Yes
- Status: Todo
- User story: As a user, I want accessible forms and controls so the app is easier to use.
- Description: Add semantic labels, keyboard support, and focus states.
- Acceptance criteria:
  - Inputs have labels.
  - Buttons have accessible names.
  - Icon-only buttons have titles or aria labels.
  - Focus states are visible.
  - Forms can be used with keyboard navigation.

### PB-040: Add Copy-to-Clipboard Feedback

- Priority: P2
- Estimate: 2
- MVP: No
- Status: Todo
- User story: As an intern, I want feedback after copying bullets or exports so I know the action worked.
- Description: Add small toast or inline confirmation for copy actions.
- Acceptance criteria:
  - Copy action works for CV bullets.
  - Copy action works for Markdown export.
  - User sees success feedback.
  - User sees error feedback if clipboard fails.

## Epic 10: Testing and Delivery

### PB-041: Add Basic Unit Tests for Generator and Export

- Priority: P1
- Estimate: 5
- MVP: Yes
- Status: Todo
- User story: As a developer, I want tests for formatting logic so generated CV bullets and exports stay reliable.
- Description: Add tests for deterministic business logic.
- Acceptance criteria:
  - CV generator tests cover single-log generation.
  - CV generator tests cover multi-log generation.
  - CV generator tests cover missing tags and unclear impact.
  - Markdown export tests cover logs, weekly review, and bullets.

### PB-042: Add Manual QA Checklist

- Priority: P0
- Estimate: 2
- MVP: Yes
- Status: Todo
- User story: As a developer, I want a manual QA checklist so I can verify the MVP before using it.
- Description: Document user-flow checks.
- Acceptance criteria:
  - Checklist includes create/edit/delete log.
  - Checklist includes tag reuse.
  - Checklist includes dashboard stats.
  - Checklist includes weekly review generation.
  - Checklist includes CV bullet generation.
  - Checklist includes Markdown export.

### PB-043: Verify Production Build

- Priority: P0
- Estimate: 2
- MVP: Yes
- Status: Todo
- User story: As a developer, I want a successful production build so the app is ready to run reliably.
- Description: Run lint and build before considering MVP complete.
- Acceptance criteria:
  - `npm run lint` passes.
  - `npm run build` passes.
  - No TypeScript errors remain.
  - No known broken route remains.

## Epic 11: Future Enhancements

### PB-044: Optional OpenAI CV Rewriter

- Priority: P2
- Estimate: 13
- MVP: No
- Status: Todo
- User story: As an intern, I want optional AI rewriting so I can improve CV wording while preserving my real work.
- Description: Add optional OpenAI-powered rewrite flow after offline generator is stable.
- Acceptance criteria:
  - Feature is disabled unless API key is configured.
  - Offline generator still works without AI.
  - AI prompt uses selected logs as source truth.
  - Generated output can be edited before saving.
  - User can see that AI output is a draft.

### PB-045: GitHub Import

- Priority: P2
- Estimate: 13
- MVP: No
- Status: Todo
- User story: As an intern, I want to import commits or PR links so logs can be created faster.
- Description: Add GitHub integration for importing commit and PR metadata.
- Acceptance criteria:
  - User can paste a GitHub commit or PR link.
  - App extracts title, date, and URL.
  - User can convert imported metadata into a work log.
  - Existing manual flow still works.

### PB-046: PDF Export

- Priority: P2
- Estimate: 8
- MVP: No
- Status: Todo
- User story: As an intern, I want PDF export so I can submit weekly or final reports more easily.
- Description: Export selected content as PDF.
- Acceptance criteria:
  - User can export weekly review as PDF.
  - User can export internship summary as PDF.
  - PDF layout is readable.
  - Markdown export remains available.

### PB-047: Backup and Restore

- Priority: P2
- Estimate: 8
- MVP: No
- Status: Todo
- User story: As an intern, I want backup and restore so I do not lose internship records.
- Description: Export/import app data as JSON.
- Acceptance criteria:
  - User can export all data as JSON.
  - User can import a previous backup.
  - Import validates data before writing.
  - Import handles duplicates predictably.

## Epic 12: Deployment and CI/CD

### PB-048: Add GitHub Actions CI

- Priority: P0
- Estimate: 3
- MVP: Yes
- Status: Todo
- User story: As a developer, I want CI to run lint and build so broken changes are caught before deploy.
- Description: Add a GitHub Actions workflow for pull requests and pushes to main.
- Acceptance criteria:
  - Workflow exists at `.github/workflows/ci.yml`.
  - Workflow uses `npm ci`.
  - Workflow runs `npm run lint`.
  - Workflow runs `npm run build`.
  - Workflow triggers on pull request and push to main.

### PB-049: Document Free Web Deployment

- Priority: P0
- Estimate: 2
- MVP: Yes
- Status: Todo
- User story: As a developer, I want deployment instructions so I can publish Work2CV as a web app for free.
- Description: Document Vercel Hobby deployment, GitHub integration, and production database caveats.
- Acceptance criteria:
  - Deployment doc explains recommended free path.
  - Deployment doc explains why GitHub Pages is not recommended for full-stack MVP.
  - Deployment doc explains that Work2CV uses Supabase for local, preview, and production database persistence.
  - Deployment doc explains how to configure Supabase environment variables locally and in Vercel.

### PB-050: Prepare Environment Variable Documentation

- Priority: P0
- Estimate: 2
- MVP: Yes
- Status: Todo
- User story: As a developer, I want environment variables documented so deploy setup is repeatable and safe.
- Description: Keep `.env.example` aligned with local and production deployment needs.
- Acceptance criteria:
  - `.env.example` includes `DATABASE_URL`.
  - No secrets are committed.
  - Docs explain where production environment variables should be configured.

### PB-051: Define Production Database Strategy

- Priority: P1
- Estimate: 5
- MVP: Yes
- Status: Todo
- User story: As a developer, I want a production database strategy so deployed CRUD features persist safely.
- Description: Decide and document the path from Supabase hosted database for all environments for deployed web usage.
- Acceptance criteria:
  - Docs explain Supabase local/dev usage vs Supabase deployed usage.
  - Prisma provider migration risk is documented.
  - Recommended free providers are listed.
  - Agent is instructed to use Supabase hosted database and avoid SQLite/local PostgreSQL setup.

### PB-052: Verify Deploy Readiness

- Priority: P0
- Estimate: 3
- MVP: Yes
- Status: Todo
- User story: As a developer, I want deploy readiness checks so the app can be safely published.
- Description: Verify build, lint, environment docs, and deployment documentation before publishing.
- Acceptance criteria:
  - `npm run lint` passes.
  - `npm run build` passes.
  - CI workflow syntax is present.
  - Deployment docs exist.
  - Root route is smoke-tested.

## MVP Completion Criteria

The MVP is complete when:

- User can manage work logs with tags.
- Dashboard shows real stats.
- Weekly review can be created from weekly logs.
- CV bullets can be generated offline from selected logs.
- Saved bullets can be edited and reused.
- Markdown export works.
- Empty states, validation errors, and loading states are handled.
- `npm run lint` and `npm run build` pass.


