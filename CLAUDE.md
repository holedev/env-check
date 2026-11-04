# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

env-check is a Next.js web app for validating API keys across multiple services. All validation runs as Next.js Server Actions — API keys never leave the user's browser session to a third-party server.

## Commands

```bash
mise install      # Install pinned Node + pnpm (versions in mise.toml)
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

### Layouts

The app has two UIs (see `CONTEXT.md`: **Landing** and **Workspace**), sharing only the root layout:

- `app/layout.tsx` → `BaseLayout`: `<html>`, theme, i18n provider, toaster. No chrome.
- `app/(landing)/layout.tsx`: the Landing at `/` (`components/custom/Landing/`).
- `app/tools/layout.tsx`: the Workspace for everything under `/tools` — `AppSidebar` + `WorkspaceHeader` (`components/custom/Workspace/`). The sidebar and the `/tools` index are built from `_TOOL_GROUP_LIST`, so a new tool needs no layout changes.

Static security headers (HSTS, `X-Frame-Options`, etc.) are set in `next.config.ts`. The Content-Security-Policy is nonce-based and built per request in `proxy.ts` (`utils/csp.ts`): never add an inline `<script>` without the nonce from the `x-nonce` request header, and add any new asset origin a tool needs to `utils/csp.ts`.

### Tool system

Tools are organized by category: `app/tools/[category]/[service-path]/`. Each tool consists of:

- `page.tsx` — server component, renders `<ToolHeader>` + form
- `actions.ts` — `"use server"` file with the validation logic
- `form.client.tsx` — optional client component for form state

All server actions wrap their logic in `handleErrorServerNoAuth` from `utils/handleErrorServer.ts`, which normalizes responses to `ResponseType` (`{ data, error }`).

### Adding a new tool

1. Register in `constants/tool.ts` — add to `_TOOL_LIST` with `path`, `progress`, `probe` (`{ method, target }`: the single read-only request, shown to users before they paste), optional `icon` and `libInfo`. Add the path to the relevant group in `_TOOL_GROUP_LIST`.
2. Create `app/tools/[category]/[service-path]/page.tsx` and `actions.ts`.
3. Add i18n keys to `configs/messages/en.json` and `configs/messages/vi.json` under `tools.items.<service-path>`: name, description, form fields, the three outcome messages, `summary.*` labels (these double as the "Shown to you" list), `never` (a list of what the tool never returns) and optional `probeNote`.
4. Write tests (see below). `progress: "completed"` requires both page and actions tests.

Icons come from simpleicons.org — use the icon slug as the `icon` value.

### ValidationForm (preferred for new tools)

New tools don't hand-write their form. `form.client.tsx` declares a zod schema and field list and renders `<ValidationForm>` (`components/custom/Tools/ValidationForm.client.tsx`), which handles inputs, loading and the three outcomes. The Server Action returns a `ValidationResult` built with `valid()` / `restricted()` / `summarize()` from `lib/validation.ts`, and throws for an invalid credential. HTTP probes use `requestService()` (timeout, no URL in errors); driver errors go through `redact()` so secrets never reach the browser or logs. See `CONTEXT.md` for Validation, Restricted and Validation summary.

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

### User-supplied hosts

Any tool that connects to a host the user types (connection string, SMTP host, custom endpoint) must call `assertPublicConnectionString` / `assertPublicHost` from `utils/network-guard.ts` before connecting. Mock `@/utils/network-guard` in that tool's `actions.test.ts`.

### Sensitive inputs

Use the `InputWithPaste` component for all API key / token fields. It defaults to `hidden={true}` (password masking with toggle).

## Commit convention

Conventional Commits enforced via commitlint + Husky. Format: `type(scope): message`.
