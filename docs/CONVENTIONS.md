# Work2CV Conventions

## Purpose

This file defines implementation conventions for Work2CV. Agents should follow this file unless a task explicitly updates the convention.

## Architecture

- Use Next.js App Router.
- Use server-side route handlers for API routes under `src/app/api`.
- Use Prisma for all database access.
- Use Supabase hosted database for persistence in local, preview, and production environments.
- Use Zod for runtime validation.
- Use TypeScript types derived from shared constants where possible.
- Keep business logic in `src/lib` or `src/features`, not directly inside UI components when it can be reused.

Recommended folders:

```text
src/app
src/app/api
src/components
src/constants
src/features
src/lib
src/validation
```

## Naming

- React components: `PascalCase`.
- Utility functions: `camelCase`.
- Constants: `UPPER_SNAKE_CASE` for fixed arrays or config maps.
- TypeScript types and interfaces: `PascalCase`.
- Route folders: lowercase and kebab-case where needed.
- API route params: `[id]`.
- File names for components: `PascalCase.tsx`.
- File names for utilities: `camelCase.ts`.

## TypeScript

- Avoid `any`.
- Prefer explicit return types for exported utilities.
- Keep shared union types derived from constants.
- Validate unknown external input with Zod before using it.
- Do not duplicate enum-like strings across files; import from shared constants.

## API Response Format

Use a consistent JSON shape.

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

Recommended error codes:

- `VALIDATION_ERROR`
- `NOT_FOUND`
- `CONFLICT`
- `DATABASE_ERROR`
- `INTERNAL_ERROR`

Recommended status codes:

- `200` for successful reads and updates
- `201` for successful creates
- `204` for successful deletes with no response body, or `200` with deleted ID if easier for UI
- `400` for validation errors
- `404` for unknown IDs
- `409` for duplicate conflicts
- `500` for unexpected server errors

## Validation

- Validate every API request body with Zod.
- Validate route params before querying.
- Trim text input before saving.
- Required fields must reject empty strings.
- Long text fields should be allowed but must not break UI.
- URLs should be stored as user-provided links after basic validation or treated as plain text if validation is intentionally relaxed.

## Database

- Use Prisma Client through a shared helper.
- Keep migrations committed.
- Do not commit `.env` files or Supabase credentials.
- Use relations for tags and work logs.
- Preserve records unless the user explicitly deletes them.
- Use cascade cleanup for join rows when deleting work logs.

## UI

- Build the actual dashboard experience, not a landing page.
- Keep layout compact, practical, and scan-friendly.
- Use cards only for individual widgets or repeated items.
- Avoid nested cards.
- Use Lucide React icons for navigation and icon buttons.
- Icon-only buttons must have accessible labels.
- Use clear loading, empty, error, success, and validation states.
- Form fields must have labels.
- Text must not overflow buttons, badges, tables, or cards.
- Keep border radius at 8px or less unless a shared component requires otherwise.

## Forms

- Show validation messages near the field.
- Disable submit or show pending state while submitting.
- Preserve user input after validation failure.
- Confirm destructive actions such as delete.
- Default work log date to today.
- Reuse task type, impact level, and tag category constants.

## CV Bullet Generator

- The v1 generator is offline and deterministic.
- Do not call external AI APIs in MVP.
- Use only data from selected work logs.
- Do not invent technologies, metrics, impact, or achievements.
- Generate at least these variants:
  - concise CV bullet
  - detailed CV bullet
  - internship report style sentence
- If impact is unclear, use softer wording such as "Contributed to..." instead of overstating.

## Markdown Export

- Export readable Markdown.
- Omit empty optional fields.
- Include dates, task types, impact levels, tags, and links where useful.
- Keep output portable and easy to paste into reports or CV drafts.

## Testing

- Run `npm run lint` after code changes when available.
- Run `npm run build` for release-level or broad changes.
- Run Prisma validation after schema changes.
- Test API routes for success, validation error, not found, duplicate, and empty data cases.
- Test UI flows for default, loading, empty, error, valid submit, invalid submit, edit, delete, and responsive layout.


