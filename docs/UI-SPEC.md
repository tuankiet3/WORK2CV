# Work2CV UI Spec

## Purpose

This file defines the intended UI behavior for the Work2CV MVP. Implementers should keep pages practical, compact, and useful for repeated daily use.

## Overall UI Direction

- Build the product experience directly, not a marketing landing page.
- Prioritize scanning, filtering, editing, and exporting.
- Use a restrained productivity dashboard style.
- Avoid decorative hero sections.
- Avoid nested cards.
- Use cards for dashboard widgets, repeated items, and contained tools only.
- Use Lucide React icons where icons are needed.
- Keep border radius at 8px or less.
- Text must not clip or overlap.

## App Shell

The app shell should include:

- sidebar navigation
- main content region
- page title area
- responsive behavior for narrower screens

Navigation items:

- Dashboard: `/`
- Logs: `/logs`
- New Log: `/logs/new`
- Weekly Review: `/weekly`
- CV Builder: `/cv-builder`
- Export: `/export`

Behavior:

- Active route is highlighted.
- Navigation works on refresh.
- Keyboard focus is visible.
- Icon-only controls include accessible labels.

## Page: Dashboard `/`

Purpose:

Show internship progress at a glance.

Required sections:

- summary cards
- tech ranking
- task type distribution
- recent highlights
- latest CV bullet suggestions if available

Required states:

- loading
- empty database
- partial data
- error loading stats

Important behavior:

- Empty dashboard should guide user to create a first work log.
- Dashboard data must come from real logs.
- Long tag names must not break cards.

## Page: Work Logs `/logs`

Purpose:

Browse, search, and filter all internship logs.

Required controls:

- text search
- date range filter
- task type filter
- impact level filter
- tag filter
- problem-solution only filter
- clear filters button
- create log button

Required list fields:

- date
- title
- task type
- impact level
- tags
- link count

Required states:

- loading
- no logs
- no filter matches
- API error

Responsive behavior:

- Desktop can use table or dense list.
- Narrow widths should collapse into readable cards.

## Page: New Work Log `/logs/new`

Purpose:

Create a structured daily work log.

Required fields:

- date
- title
- description
- task type
- impact level
- tags
- problem
- solution
- learning
- links

Required behavior:

- Date defaults to today.
- Required fields are visually indicated.
- Task type and impact level use selects, segmented controls, or equivalent structured controls.
- Existing tags can be selected.
- New tags can be created.
- Multiple links can be added and removed.
- Save creates the log and redirects to detail or list.
- Validation errors appear near fields.

Required states:

- initial
- submitting
- validation error
- API error
- success

## Page: Work Log Detail `/logs/[id]`

Purpose:

Review, edit, and delete an existing log.

Required sections:

- summary header
- task details
- tags
- links
- problem-solution-learning section
- edit controls
- delete control

Required behavior:

- Unknown ID shows friendly not found state.
- Edit mode allows updating all fields.
- Delete requires confirmation.
- Deleted log redirects to list or shows clear completion state.

## Page: Weekly Review `/weekly`

Purpose:

Summarize work by week.

Required controls:

- week selector
- prefill from logs button
- save review button

Required sections:

- selected week summary
- logs in selected week
- review form

Review fields:

- shipped
- blockers
- learned
- collaboration
- next focus

Required states:

- week with logs
- week without logs
- existing review
- unsaved review
- save error

Important behavior:

- Prefill is an explicit action.
- Prefill must not silently overwrite a saved review.

## Page: CV Builder `/cv-builder`

Purpose:

Generate CV-ready bullets from real work logs.

Required sections:

- candidate log selector
- selected log summary
- tone or output style selector
- generated variants
- saved bullets

Required behavior:

- User can select one or multiple logs.
- User can filter candidate logs by impact and tag.
- High-value logs are highlighted.
- Generation with no selected logs is blocked or shows clear error.
- Generated bullets are editable before saving.
- Saved bullets can be edited and deleted.
- Copy-to-clipboard should be included when practical.

Generator output variants:

- concise CV
- detailed CV
- internship report

## Page: Export `/export`

Purpose:

Export logs, weekly reviews, CV bullets, or full summary as Markdown.

Required controls:

- export type selector
- item selector when needed
- generate preview button
- copy Markdown button
- download `.md` button

Required states:

- no export type selected
- no items selected
- preview ready
- copy success
- copy failure
- download ready
- API error

## Shared Components

Recommended shared components:

- `AppShell`
- `Sidebar`
- `PageHeader`
- `SummaryCard`
- `TaskTypeBadge`
- `ImpactBadge`
- `TagBadge`
- `EmptyState`
- `LoadingState`
- `ErrorState`
- `ConfirmDialog`
- `TagPicker`
- `MarkdownPreview`
- `DateRangeFilter`

## Accessibility Requirements

- Every input has a visible label or accessible label.
- Buttons use clear text or accessible labels.
- Icon-only buttons include `aria-label` or `title`.
- Focus states are visible.
- Forms are keyboard navigable.
- Error messages are associated with fields where practical.

## Responsive Requirements

Test at minimum:

- desktop width
- tablet or medium width
- narrow mobile-like width if practical

Required behavior:

- Sidebar remains usable or collapses.
- Tables become cards or remain horizontally manageable.
- Badges wrap cleanly.
- Long words and long links do not break layout.
- Buttons remain readable.

