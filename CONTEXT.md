# env-check

A web app for validating third-party API credentials. Every check runs as a Next.js Server Action so credentials never travel to a third-party server on the user's behalf beyond the service being validated.

## Language

### Tools

**Tool**:
A single service's credential validator, living at `app/tools/<category>/<path>/`. Registered in `_TOOL_LIST` (`constants/tool.ts`) with an `icon`, `path`, `progress`, and optional `libInfo`.
_Avoid_: checker, integration, plugin

**Tool Group**:
A category that buckets tools in the navigation: one of `ai`, `cloud`, `database`, `payment`, `messaging`, `analytics`, `others`. Defined in `_TOOL_GROUP_LIST`.
_Avoid_: section, module

**Progress state**:
A tool's build status, shown as a coloured badge by `ToolHeader`. One of `notStarted` (registered, no page), `inProgress` (page exists, not test-complete), `completed` (page + actions + full tests).
_Avoid_: status, stage, planned, coming-soon

**libInfo**:
The metadata on a tool describing what performs the validation — `packageName` (an npm package, or the literal `"fetch"` when it's a raw REST call), plus optional `url` and `version`.

**Validation**:
The act of proving a pasted credential works, by making one real authenticated call to the service and reporting success or the service's error. The call is read-only: it identifies or lists, and never sends, charges or writes anything.
_Avoid_: verification, testing

**Restricted**:
The third Validation outcome, besides valid and invalid: the service authenticated the credential but refused the probe for lack of permission (a scoped or restricted key). The credential works; it just cannot do what the probe asks.
_Avoid_: partial, forbidden, limited

**Validation summary**:
The small, hand-picked set of facts a Tool shows after a successful Validation (account or workspace name, scopes, live/test mode, model count). Never the service's raw response.
_Avoid_: payload, details, raw response

### Request handling

**Server Action**:
The `"use server"` function in a tool's `actions.ts` that performs the validation. Never runs in the browser.

**`handleErrorServerNoAuth`**:
The wrapper (`utils/handle-error-server.ts`) every Server Action's logic passes through. Its `cb` throws on failure and returns a plain object on success; the wrapper normalises both into a `ResponseType`.

**`ResponseType`**:
The single shape every Server Action returns: `{ data, error }`, exactly one of which is non-null. Built by `SuccessResponse` (`data.payload` carries the result) or `ErrorResponse` (`error.message`, `error.status`).
_Avoid_: result, ApiResponse

**`useHandleError` / `handleErrorClient`**:
The client-side counterpart hook (`hooks/use-handle-error.tsx`) that unwraps a `ResponseType`, fires a toast, and calls `postOnSuccess` / `postOnError`.

### UI

**Landing**:
The public marketing page at `/` that introduces the app, explains why credentials stay safe, and sends visitors into the Workspace. Has no tool navigation of its own.
_Avoid_: home, homepage, marketing site

**Workspace**:
The app shell wrapping every Tool and Tool Group page under `/tools`: a sidebar listing Tool Groups and their Tools, plus a header with search, locale and theme controls.
_Avoid_: tool UI, dashboard, app

**`ToolHeader`**:
The server component atop every tool page. Given a `toolPath`, it renders the tool's name, description, `libInfo` link, and progress badge from the constants.

**`InputWithPaste`**:
The input component (`components/custom/InputWithPaste.tsx`) used for every credential field. `hidden` (default `true`) masks the value with a show/hide toggle; a paste-from-clipboard button is always present.
_Avoid_: SecretInput, PasswordInput

### Localisation

**locale**:
One of the two supported languages, `en` or `vi`. Every user-visible string has a key in both `configs/messages/en.json` and `configs/messages/vi.json` under `tools.items.<path>`.
