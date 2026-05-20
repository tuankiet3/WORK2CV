# Work2CV QA Checklist

## Purpose

Use this checklist before marking a sprint task or MVP flow as complete. If a check is not applicable, record why in the final task response.

## Environment Checks

- [ ] Project opens at `D:\WorkSpace\IndividualProject\Work2CV`.
- [ ] `.env` exists and matches `.env.example`.
- [ ] Dependencies are installed.
- [ ] Prisma schema validates.
- [ ] Prisma client generates.
- [ ] Database migration runs.
- [ ] Seed script runs after it exists.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes for release-level checks.

## Dashboard

- [ ] Dashboard route `/` loads.
- [ ] Dashboard does not show starter or marketing content.
- [ ] Total work logs count is correct.
- [ ] Logs this week count is correct.
- [ ] Top technology tag is correct.
- [ ] Saved CV bullet count is correct.
- [ ] Tech ranking handles no tags.
- [ ] Task distribution handles no logs.
- [ ] Recent highlights show high-impact logs.
- [ ] Empty database state is clear.
- [ ] Long labels and tags do not break layout.
- [ ] Dashboard works at desktop width.
- [ ] Dashboard works at tablet or narrow width.

## Work Logs

- [ ] `/logs` route loads.
- [ ] Empty state appears when no logs exist.
- [ ] Seeded logs appear when data exists.
- [ ] Logs sort newest first.
- [ ] Log row/card shows date, title, task type, impact, tags, and link count.
- [ ] Create log button navigates to `/logs/new`.
- [ ] Search matches title.
- [ ] Search matches description.
- [ ] Search matches problem.
- [ ] Search matches solution.
- [ ] Search matches learning.
- [ ] Date range filter works.
- [ ] Invalid date range is handled.
- [ ] Task type filter works.
- [ ] Impact filter works.
- [ ] Tag filter works.
- [ ] Combined filters work.
- [ ] Clear filters works.
- [ ] No matching result state is clear.

## Work Log Create

- [ ] `/logs/new` route loads.
- [ ] Date defaults to today.
- [ ] Required fields are visible.
- [ ] Minimal valid log can be created.
- [ ] Complete log can be created.
- [ ] Existing tags can be selected.
- [ ] New tag can be created.
- [ ] Multiple links can be added.
- [ ] Missing title shows validation error.
- [ ] Missing date shows validation error.
- [ ] Invalid task type is rejected.
- [ ] Invalid impact level is rejected.
- [ ] Duplicate tag is handled.
- [ ] Very long text does not break UI.
- [ ] Broken or malformed link is handled according to validation policy.
- [ ] Successful create redirects to detail or list page.

## Work Log Detail and Edit

- [ ] `/logs/[id]` route loads for existing log.
- [ ] Unknown ID shows friendly not found state.
- [ ] Deleted record opened by URL shows friendly not found state.
- [ ] All fields display correctly.
- [ ] Tags display as badges.
- [ ] Links are clickable.
- [ ] Edit mode opens.
- [ ] Partial edit saves.
- [ ] Full edit saves.
- [ ] Invalid edit shows validation errors.
- [ ] Delete confirmation appears.
- [ ] Delete cancel keeps record.
- [ ] Delete confirm removes record and tag relations.

## Tags

- [ ] `GET /api/tags` returns tags.
- [ ] `POST /api/tags` creates valid tag.
- [ ] Duplicate tag name in same category is handled.
- [ ] Same name in different category follows project policy.
- [ ] Missing tag name is rejected.
- [ ] Missing tag category is rejected.
- [ ] Invalid tag category is rejected.
- [ ] Whitespace-only tag name is rejected.
- [ ] Very long tag name does not break UI.

## Problem-Solution Notes

- [ ] Logs with problem text are detected.
- [ ] Logs with solution text are detected.
- [ ] Logs with both are detected.
- [ ] Logs with neither are excluded from problem-solution filter.
- [ ] Problem-solution filter works with other filters.
- [ ] Detail page separates problem, solution, and learning.
- [ ] Long problem and solution text is readable.

## Weekly Review

- [ ] `/weekly` route loads.
- [ ] Current week is selected by default.
- [ ] User can select previous week.
- [ ] User can select next week.
- [ ] Logs in selected week are shown.
- [ ] Week with no logs has clear empty state.
- [ ] Review form includes shipped, blockers, learned, collaboration, next focus.
- [ ] New weekly review can be saved.
- [ ] Existing weekly review loads.
- [ ] Existing weekly review can be edited.
- [ ] Duplicate week review is prevented or updated predictably.
- [ ] Invalid week range is rejected.
- [ ] Prefill uses logs from selected week.
- [ ] Prefill does not overwrite saved review accidentally.
- [ ] Logs on week boundary dates are handled correctly.

## CV Builder

- [ ] `/cv-builder` route loads.
- [ ] Empty state appears when no logs exist.
- [ ] Candidate logs are shown.
- [ ] One log can be selected.
- [ ] Multiple logs can be selected.
- [ ] Selected count updates.
- [ ] Candidate logs can be filtered by impact.
- [ ] Candidate logs can be filtered by tag.
- [ ] High-value logs are highlighted.
- [ ] Generation with no selected logs is blocked or shows clear error.
- [ ] Generation with one log returns variants.
- [ ] Generation with multiple logs returns variants.
- [ ] Log with no tech tags uses fallback wording.
- [ ] Log with unclear impact uses softer wording.
- [ ] Generated bullet can be edited before saving.
- [ ] Saved bullet persists after refresh.
- [ ] Saved bullet can be deleted after confirmation.
- [ ] Copy to clipboard works if implemented.
- [ ] Generator does not invent tools or achievements.

## Markdown Export

- [ ] `/export` route loads.
- [ ] User can choose export type.
- [ ] User can export selected logs.
- [ ] User can export weekly review.
- [ ] User can export CV bullets.
- [ ] User can export full internship summary.
- [ ] Markdown preview is readable.
- [ ] Empty optional fields are omitted cleanly.
- [ ] Export with no selected items is handled.
- [ ] Export with invalid IDs is handled.
- [ ] Copy Markdown works.
- [ ] Download `.md` file works.
- [ ] Very long Markdown preview remains usable.

## API Error Cases

- [ ] Missing required field returns `400`.
- [ ] Invalid enum value returns `400`.
- [ ] Invalid route param returns `400` or `404`.
- [ ] Unknown ID returns `404`.
- [ ] Duplicate resource returns `409` or reuses existing resource according to spec.
- [ ] Database failure returns safe `500` message.
- [ ] Response body follows API error format.
- [ ] Validation error details are clear enough for UI.

## Accessibility and Responsive Checks

- [ ] Inputs have labels.
- [ ] Buttons have accessible names.
- [ ] Icon-only buttons have aria labels or titles.
- [ ] Focus states are visible.
- [ ] Forms can be navigated by keyboard.
- [ ] Sidebar navigation can be used by keyboard.
- [ ] Text does not clip in buttons.
- [ ] Text does not clip in badges.
- [ ] Tables or lists remain readable on narrow screens.
- [ ] No incoherent UI overlap is visible.

## MVP Completion

- [ ] Work log CRUD works end to end.
- [ ] Tags can be created and reused.
- [ ] Dashboard stats use real data.
- [ ] Weekly reviews can be created and prefilled.
- [ ] CV bullets can be generated offline.
- [ ] Saved bullets can be edited and reused.
- [ ] Markdown export works.
- [ ] Empty states, validation errors, and loading states are handled.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.

## Deployment Readiness

- [x] `.github/workflows/ci.yml` exists.
- [x] CI workflow runs on pull requests to `main`.
- [x] CI workflow runs on pushes to `main`.
- [x] CI workflow uses `npm ci`.
- [x] CI workflow runs `npm run lint`.
- [x] CI workflow runs `npm run build`.
- [x] `docs/DEPLOYMENT.md` exists.
- [x] `docs/CI-CD.md` exists.
- [x] `.env.example` documents required variables without secrets.
- [x] Vercel project settings are documented.
- [x] Root route can be smoke-tested locally.
- [x] Supabase database strategy is documented before implementing CRUD features.
- [x] SQLite is not used for Work2CV persistence.
- [x] Local PostgreSQL is not required for Work2CV persistence.
- [x] Supabase is documented as the database for local, preview, and production.
- [x] `.env` exists locally with Supabase placeholders or real local values.
- [x] Vercel has matching Supabase environment variables before deploy.
- [x] No Vercel token is committed.
- [x] No database credential is committed.
- [x] No GitHub token is committed.



