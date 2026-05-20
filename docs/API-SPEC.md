# Work2CV API Spec

## Purpose

This file defines the intended API contract for Work2CV MVP. Implementers should keep API routes consistent with this spec unless a task explicitly updates it.

## Base Rules

- All API routes return JSON.
- All request bodies must be validated with Zod.
- All route params must be validated before database queries.
- API routes must not expose raw stack traces.
- API routes must use Prisma for database access.

## Response Format

Success:

```json
{
  "data": {}
}
```

List success:

```json
{
  "data": []
}
```

Error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed.",
    "details": []
  }
}
```

## Common Error Codes

- `VALIDATION_ERROR`: invalid request body, query, or route param
- `NOT_FOUND`: requested record does not exist
- `CONFLICT`: duplicate record or state conflict
- `DATABASE_ERROR`: database operation failed
- `INTERNAL_ERROR`: unexpected server error

## Work Logs

### GET `/api/logs`

Returns work logs with tags.

Query params may include:

- `q`
- `from`
- `to`
- `taskType`
- `impactLevel`
- `tagId`
- `problemSolutionOnly`

Success:

```json
{
  "data": [
    {
      "id": "log_id",
      "date": "2026-05-20",
      "title": "Implemented dashboard filters",
      "description": "Built task type and impact filters.",
      "taskType": "feature",
      "impactLevel": "implemented",
      "problem": "",
      "solution": "",
      "learning": "Learned URL state handling.",
      "links": ["https://example.com/pr/1"],
      "tags": [],
      "createdAt": "2026-05-20T00:00:00.000Z",
      "updatedAt": "2026-05-20T00:00:00.000Z"
    }
  ]
}
```

### POST `/api/logs`

Creates a work log.

Request:

```json
{
  "date": "2026-05-20",
  "title": "Implemented dashboard filters",
  "description": "Built task type and impact filters.",
  "taskType": "feature",
  "impactLevel": "implemented",
  "problem": "",
  "solution": "",
  "learning": "Learned URL state handling.",
  "links": ["https://example.com/pr/1"],
  "tagIds": ["tag_id"]
}
```

Required:

- `date`
- `title`
- `taskType`
- `impactLevel`

Validation:

- `title` must not be empty.
- `date` must be a valid date.
- `taskType` must be a known task type.
- `impactLevel` must be a known impact level.
- `tagIds` must reference existing tags if provided.

### GET `/api/logs/[id]`

Returns one work log with tags.

Errors:

- `404 NOT_FOUND` when ID does not exist
- `400 VALIDATION_ERROR` when ID is malformed

### PATCH `/api/logs/[id]`

Partially updates a work log. Supports updating tag relations.

Request may include any fields from create payload.

Errors:

- `400 VALIDATION_ERROR`
- `404 NOT_FOUND`

### DELETE `/api/logs/[id]`

Deletes a work log and its join rows.

Success may return:

```json
{
  "data": {
    "id": "deleted_log_id"
  }
}
```

## Tags

### GET `/api/tags`

Returns all tags.

Success:

```json
{
  "data": [
    {
      "id": "tag_id",
      "name": "React",
      "category": "tech",
      "createdAt": "2026-05-20T00:00:00.000Z"
    }
  ]
}
```

### POST `/api/tags`

Creates or reuses a tag.

Request:

```json
{
  "name": "React",
  "category": "tech"
}
```

Required:

- `name`
- `category`

Validation:

- `name` must not be empty.
- `category` must be one of `tech`, `domain`, `skill`, `tool`.
- Duplicate name/category must be handled predictably.

## Weekly Reviews

### GET `/api/weekly-reviews`

Returns saved weekly reviews.

Query params may include:

- `weekStart`
- `weekEnd`

### POST `/api/weekly-reviews`

Creates a weekly review.

Request:

```json
{
  "weekStart": "2026-05-18",
  "weekEnd": "2026-05-24",
  "shipped": "Implemented log filters.",
  "blockers": "Needed to clarify API response format.",
  "learned": "Learned Prisma relation modeling.",
  "collaboration": "Reviewed mentor feedback.",
  "nextFocus": "Build CV generator."
}
```

Validation:

- `weekStart` and `weekEnd` must be valid dates.
- `weekStart` must not be after `weekEnd`.
- Duplicate week review must be prevented or updated predictably.

### PATCH `/api/weekly-reviews/[id]`

Partially updates a weekly review.

### DELETE `/api/weekly-reviews/[id]`

Deletes a weekly review.

## CV Bullets

### GET `/api/cv-bullets`

Returns saved CV bullets.

### POST `/api/cv-bullets/generate`

Generates offline CV bullet variants from selected logs.

Request:

```json
{
  "logIds": ["log_id"],
  "tone": "concise_cv"
}
```

Success:

```json
{
  "data": {
    "variants": [
      {
        "tone": "concise_cv",
        "content": "Implemented dashboard filters using React and TypeScript."
      }
    ]
  }
}
```

Validation:

- `logIds` must not be empty.
- Every log ID must exist.
- `tone` must be known if provided.
- Generator must not call external AI APIs in MVP.

### PATCH `/api/cv-bullets/[id]`

Updates saved CV bullet content.

Request:

```json
{
  "content": "Implemented dashboard filters using React and TypeScript."
}
```

### DELETE `/api/cv-bullets/[id]`

Deletes a saved CV bullet.

## Export

### POST `/api/export/markdown`

Returns Markdown output for selected data.

Request:

```json
{
  "type": "logs",
  "ids": ["log_id"]
}
```

Supported `type` values:

- `logs`
- `weekly_review`
- `cv_bullets`
- `full_summary`

Success:

```json
{
  "data": {
    "markdown": "# Work2CV Export\n\n..."
  }
}
```

Validation:

- `type` must be supported.
- `ids` must be valid when required by the export type.
- Invalid IDs must return a clear error.
- Empty selections must return a clear error or a useful empty output according to the UI flow.

## Required API Exception Tests

For every API route, test relevant cases:

- valid request
- missing required field
- invalid enum
- invalid ID
- unknown ID
- empty database
- duplicate creation
- invalid date range
- relation cleanup after delete
- database failure where practical


