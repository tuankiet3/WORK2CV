# Work2CV Data Model

## Purpose

This document defines the intended data model for Work2CV. Prisma schema, Zod schemas, API routes, UI forms, seed data, and exports should stay aligned with this file.

## Enums and Constant Values

### TaskType

- `onboarding`
- `feature`
- `bugfix`
- `testing`
- `refactor`
- `code_review`
- `documentation`
- `meeting`
- `research`
- `support`

### ImpactLevel

- `learned`
- `assisted`
- `implemented`
- `reviewed`
- `fixed`
- `improved`

### TagCategory

- `tech`
- `domain`
- `skill`
- `tool`

### CvTone

- `concise_cv`
- `detailed_cv`
- `internship_report`

### ExportType

- `logs`
- `weekly_review`
- `cv_bullets`
- `full_summary`

## Entity: WorkLog

Represents one daily or task-level internship work entry.

Fields:

- `id`: unique identifier
- `date`: date of the work
- `title`: short summary
- `description`: detailed task description
- `taskType`: enum-like value from TaskType
- `impactLevel`: enum-like value from ImpactLevel
- `problem`: issue, blocker, bug, or challenge encountered
- `solution`: fix, workaround, or approach used
- `learning`: lesson learned or technical takeaway
- `links`: list of related URLs or references
- `createdAt`: creation timestamp
- `updatedAt`: update timestamp

Required fields:

- `date`
- `title`
- `taskType`
- `impactLevel`

Optional fields:

- `description`
- `problem`
- `solution`
- `learning`
- `links`

Relations:

- Many-to-many with `Tag` through `WorkLogTag`.

Behavior:

- Logs are sorted newest first by default.
- Logs with `problem` or `solution` content count as problem-solution notes.
- Logs with impact `implemented`, `reviewed`, `fixed`, or `improved` are candidates for highlights.

## Entity: Tag

Represents a reusable label for work logs.

Fields:

- `id`: unique identifier
- `name`: display name
- `category`: enum-like value from TagCategory
- `createdAt`: creation timestamp

Required fields:

- `name`
- `category`

Constraints:

- Tag name must not be empty.
- Tag category must be valid.
- Tag name should be unique within the same category.
- Tag names should be trimmed before saving.

Relations:

- Many-to-many with `WorkLog` through `WorkLogTag`.

## Entity: WorkLogTag

Join table between `WorkLog` and `Tag`.

Fields:

- `workLogId`
- `tagId`

Constraints:

- Pair of `workLogId` and `tagId` should be unique.
- Deleting a work log should remove related join rows.
- Deleting a tag should be considered carefully; MVP does not require tag deletion.

## Entity: WeeklyReview

Represents one weekly reflection.

Fields:

- `id`: unique identifier
- `weekStart`: first date of selected week
- `weekEnd`: last date of selected week
- `shipped`: what was completed
- `blockers`: blockers or difficulties
- `learned`: technical lessons
- `collaboration`: mentor/team/code-review notes
- `nextFocus`: focus for next week
- `createdAt`: creation timestamp
- `updatedAt`: update timestamp

Required fields:

- `weekStart`
- `weekEnd`

Optional text fields:

- `shipped`
- `blockers`
- `learned`
- `collaboration`
- `nextFocus`

Constraints:

- `weekStart` must not be after `weekEnd`.
- One review should exist per week range.

Behavior:

- Weekly review can be prefilled from logs in the selected week.
- Prefill should be editable before save.
- Prefill must not silently overwrite an existing saved review.

## Entity: CvBullet

Represents a generated or manually edited CV bullet.

Fields:

- `id`: unique identifier
- `sourceLogIds`: IDs of work logs used as source
- `content`: bullet text
- `tone`: enum-like value from CvTone
- `createdAt`: creation timestamp
- `updatedAt`: update timestamp

Required fields:

- `content`
- `tone`
- `sourceLogIds`

Behavior:

- A bullet can reference one or more logs.
- Bullet content can be edited after generation.
- Bullet can be deleted.
- Generator must only use source log data.

## Derived Concepts

### High-Value Log

A log is high-value when one or more of these are true:

- impact is `implemented`
- impact is `fixed`
- impact is `improved`
- impact is `reviewed`
- problem and solution are present
- links are present
- multiple technology tags are attached

### Problem-Solution Note

A log is a problem-solution note when:

- `problem` is not empty, or
- `solution` is not empty

### Weekly Log Group

A weekly log group contains logs where:

- `date >= weekStart`
- `date <= weekEnd`

## Seed Data Requirements

Seed data should include:

- at least 8 work logs
- at least 5 task types
- technology tags
- tool tags
- skill tags
- domain tags
- at least one weekly review
- at least two saved CV bullets

Seed data should be realistic for a developer internship.


