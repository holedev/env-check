# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

env-check is a Next.js web app for validating API keys across multiple services. All validation runs as Next.js Server Actions — API keys never leave the user's browser session to a third-party server.

## Commands

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm test         # Run Jest tests
pnpm lint:fix     # Biome format + lint (run before committing)
```

Run a single test file:
```bash
pnpm test -- path/to/__tests__/actions.test.ts
```

## Architecture

### Tool system

Tools are organized by category: `app/tools/[category]/[service-path]/`. Each tool consists of:

- `page.tsx` — server component, renders `<ToolHeader>` + form
- `actions.ts` — `"use server"` file with the validation logic
- `form.client.tsx` — optional client component for form state

All server actions wrap their logic in `handleErrorServerNoAuth` from `utils/handleErrorServer.ts`, which normalizes responses to `ResponseType` (`{ data, error }`).

### Adding a new tool

1. Register in `constants/tool.ts` — add to `_TOOL_LIST` with `icon`, `path`, `progress`, and optional `libInfo`. Add the path to the relevant group in `_TOOL_GROUP_LIST`.
2. Create `app/tools/[category]/[service-path]/page.tsx` and `actions.ts`.
3. Add i18n keys to `configs/messages/en.json` and `configs/messages/vi.json` under `tools.items.<service-path>`.
4. Write tests (see below). `progress: "completed"` requires both page and actions tests.

Icons come from simpleicons.org — use the icon slug as the `icon` value.

### Response pattern

```ts
// actions.ts always returns ResponseType
const result = await handleErrorServerNoAuth({
  cb: async () => { /* throw on failure, return data on success */ }
});
```

### Tests

Tests live in `app/tools/[category]/[service-path]/__tests__/`. Jest is configured to discover `**/__tests__/*.test.ts(x)` and `**/test/**/*.test.ts(x)`.

- `progress: "inProgress"` → create `page.test.tsx`
- `progress: "completed"` → create both `page.test.tsx` and `actions.test.ts`

### i18n

`next-intl` with two locales: `en` and `vi`. All user-visible strings go in `configs/messages/en.json` and `configs/messages/vi.json`.

### Sensitive inputs

Use the `InputWithPaste` component for all API key / token fields. It defaults to `hidden={true}` (password masking with toggle).

## Commit convention

Conventional Commits enforced via commitlint + Husky. Format: `type(scope): message`.
