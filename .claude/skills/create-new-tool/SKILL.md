---
name: create-new-tool
description: Create a new tool in the env-check project. Use this skill whenever the user wants to add a new service/API validation tool to env-check — whether they say "add a new tool", "create a tool for X", "implement X integration", or describe wanting to validate credentials for any service (Stripe, Slack, Redis, OpenAI, etc.). Also use this when they show you a service API key and ask you to build a checker for it.
---

# Creating a New Tool in env-check

env-check is a Next.js app where each "tool" validates API credentials for a specific service. Every tool follows a strict, consistent pattern — this skill walks you through the complete implementation.

## Step 1: Gather Requirements

Before writing any code, clarify:

1. **Service name and path** — e.g., "Stripe" with path `stripe` (always kebab-case)
2. **Category/group** — which group does it belong to: `ai`, `cloud`, `database`, `payment`, `messaging`, `analytics`, or `others`?
3. **What to validate** — what credentials does the user provide (API key, connection string, token, host+port+user+password, etc.)?
4. **What to check** — what API call or connection test proves the credentials work? (e.g., list available models, list buckets, send a test ping, query a table)
5. **npm package** — does the official SDK exist on npm? Check if it's already installed (`pnpm list <package>`). If not, you'll need to install it.
6. **Progress status** — `inProgress` (just page + basic form, no deep validation) or `completed` (full validation with tests)

## Step 2: Install the Package (if needed)

```bash
pnpm add <package-name>
# For TypeScript types if needed:
pnpm add -D @types/<package-name>
```

Note the exact version after installing — you'll need it for `libInfo`.

## Step 3: Register the Tool

Edit [constants/tool.ts](constants/tool.ts):

**In `_TOOL_LIST`**, add an entry:
```ts
{
  icon: "<simpleicons-slug>",  // from simpleicons.org
  path: "<service-path>",
  progress: "completed",       // or "inProgress"
  libInfo: {                   // omit if using only fetch/built-ins
    packageName: "<npm-package>",
    url: "https://www.npmjs.com/package/<npm-package>",
    version: "<exact-version>"  // must match package.json exactly
  }
}
```

**In `_TOOL_GROUP_LIST`**, add the path to the right group's `tools` array.

## Step 4: Add i18n Translations

Both files follow the same structure. Add under `tools.items.<service-path>` in [configs/messages/en.json](configs/messages/en.json) and [configs/messages/vi.json](configs/messages/vi.json):

```json
"<service-path>": {
  "name": "<Display Name>",
  "description": "<One-line description of what this tool validates>",
  "form": {
    "<fieldName>": {
      "label": "<Field Label>",
      "placeholder": "<example value>",
      "description": "<Help text explaining where to find this value>"
    },
    "submit": "<Button label>"
  },
  "validCredentials": "<Success message>",
  "invalidCredentials": "<Failure message>"
}
```

Add extra keys as needed for result display (e.g., `"availableModels"`, `"details"`, `"connectionDetails"`).

Vietnamese translation should be natural — don't just transliterate English. Keep technical terms (API Key, Token, etc.) in English.

## Step 5: Create the Tool Files

Create directory: `app/tools/<category>/<service-path>/`

### page.tsx

```tsx
import { ToolHeader } from "@/components/custom/Tools/ToolHeader";
import type { ToolPath } from "@/types/tool";
import { FormClient } from "./form.client";

const _TOOL_PATH: ToolPath = "<service-path>";

export default function Page() {
  return (
    <div>
      <ToolHeader toolPath={_TOOL_PATH} />
      <FormClient />
    </div>
  );
}
```

### actions.ts

```ts
"use server";

import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type <Service>Config = {
  // fields matching the form
};

const check<Service>Connection = async (config: <Service>Config) =>
  handleErrorServerNoAuth({
    cb: async () => {
      // Perform the actual validation here.
      // THROW on failure — handleErrorServerNoAuth catches it.
      // RETURN a plain object on success.
      const result = await someApiCall(config);
      return { success: true, ...relevantData };
    }
  });

export { check<Service>Connection };
```

Key rules for `actions.ts`:
- Always `"use server"` at the top
- Wrap everything in `handleErrorServerNoAuth`
- Throw errors with descriptive messages on failure
- Return a plain object (not a class instance) on success
- Clean up resources in `finally` blocks (e.g., `client.end()`)

### form.client.tsx

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InputWithPaste } from "@/components/custom/InputWithPaste";
import { LoadingComponent } from "@/components/custom/Loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useHandleError } from "@/hooks/use-handle-error";
import { check<Service>Connection } from "./actions";

const formSchema = z.object({
  // one field per credential input
  apiKey: z.string().min(1),
});

type <Service>Result = {
  // shape of the object returned from actions.ts
};

const FormClient = () => {
  const t = useTranslations("tools.items.<service-path>");
  const [result, setResult] = useState<<Service>Result | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [firstRender, setFirstRender] = useState(true);
  const { handleErrorClient } = useHandleError();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { apiKey: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setFirstRender(false);

    await handleErrorClient({
      cb: async () => check<Service>Connection(values),
      withSuccessNotify: true,
      postOnSuccess({ data }) {
        setResult(data.payload as <Service>Result);
      },
      postOnError() {
        setResult(null);
      },
    });
    setIsLoading(false);
  }

  function renderResult() {
    if (isLoading) return <LoadingComponent />;
    if (result) {
      return (
        <Alert className="mb-4 flex justify-center" variant="default">
          <CheckCircle2Icon />
          <AlertDescription>{t("validCredentials")}</AlertDescription>
        </Alert>
        // Add Accordion sections for extra data (tables, models, etc.)
      );
    }
    if (!firstRender) {
      return (
        <Alert className="flex justify-center" variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>{t("invalidCredentials")}</AlertDescription>
        </Alert>
      );
    }
    return null;
  }

  return (
    <div className="mx-auto w-fit min-w-100 space-y-8">
      <Form {...form}>
        <form className="flex flex-col items-end gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("form.apiKey.label")}</FormLabel>
                <FormControl>
                  <InputWithPaste
                    autoComplete="off"
                    hidden
                    onPasteClick={(value) => field.onChange(value)}
                    placeholder={t("form.apiKey.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("form.apiKey.description")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">{t("form.submit")}</Button>
        </form>
      </Form>
      {renderResult()}
    </div>
  );
};

export { FormClient };
```

Important form rules:
- Use `InputWithPaste` with `hidden` prop for all API keys, tokens, passwords, and connection strings — never plain `<Input>` for sensitive fields
- Use `hidden={false}` (or omit `hidden`) for non-sensitive fields like host, port, username
- `useHandleError` handles toast notifications automatically

## Step 6: Write Tests

Create `app/tools/<category>/<service-path>/__tests__/`

### page.test.tsx (required for both inProgress and completed)

```tsx
import { render, screen } from "@testing-library/react";
import type { ToolHeaderProps } from "@/components/custom/Tools/ToolHeader";
import Page from "../page";

jest.mock("@/components/custom/Tools/ToolHeader", () => ({
  ToolHeader: ({ toolPath }: ToolHeaderProps) => <div data-testid="tool-header">{toolPath}</div>
}));

jest.mock("../form.client", () => ({
  FormClient: () => <div data-testid="form-client">Form Client <ServiceName></div>
}));

test("Page renders ToolHeader and FormClient", () => {
  render(<Page />);
  expect(screen.getByTestId("tool-header")).toBeInTheDocument();
  expect(screen.getByTestId("form-client")).toHaveTextContent("Form Client <ServiceName>");
});
```

### actions.test.ts (required for completed only)

Mock the SDK and `handleErrorServerNoAuth`, then test:
1. **Success case** — valid credentials return expected data shape
2. **Auth failure** — wrong credentials throw and return `{ error, data: null }`
3. **Network failure** — unreachable host throws and returns error
4. **Config passed correctly** — the SDK was called with the right arguments

```ts
import { check<Service>Connection } from "../actions";

jest.mock("<npm-package>", () => ({
  // mock the SDK class/function
}));

jest.mock("@/utils/handle-error-server", () => ({
  handleErrorServerNoAuth: jest.fn()
}));

describe("<Service> Actions", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe("check<Service>Connection", () => {
    it("should return success with data when credentials are valid", async () => {
      // 1. Mock SDK to return good data
      // 2. Mock handleErrorServerNoAuth to call cb() and return { error: null, data: { payload: result } }
      // 3. Assert result shape
    });

    it("should return error when credentials are invalid", async () => {
      // 1. Mock SDK to throw an auth error
      // 2. Mock handleErrorServerNoAuth to catch and return { error: { message }, data: null }
      // 3. Assert error message
    });

    // ... more cases as needed
  });
});
```

The `handleErrorServerNoAuth` mock pattern:
```ts
const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");

// For success:
handleErrorServerNoAuth.mockImplementation(async ({ cb }) => {
  const result = await cb();
  return { error: null, data: { payload: result } };
});

// For failure:
handleErrorServerNoAuth.mockImplementation(async ({ cb }) => {
  try {
    await cb();
  } catch (error) {
    return { error: { message: error instanceof Error ? error.message : "Unknown error" }, data: null };
  }
});
```

## Step 7: Run Checks

```bash
pnpm lint:fix                                    # Format and lint
pnpm test -- app/tools/<category>/<service-path> # Run just this tool's tests
```

Fix any issues before declaring done.

## Checklist

- [ ] Package installed (if needed), exact version noted
- [ ] Entry added to `_TOOL_LIST` in constants/tool.ts
- [ ] Path added to correct group in `_TOOL_GROUP_LIST`
- [ ] i18n keys added to en.json
- [ ] i18n keys added to vi.json
- [ ] `page.tsx` created
- [ ] `actions.ts` created with `"use server"` and `handleErrorServerNoAuth`
- [ ] `form.client.tsx` created with `InputWithPaste` for sensitive fields
- [ ] `page.test.tsx` created
- [ ] `actions.test.ts` created (if `progress: "completed"`)
- [ ] `pnpm lint:fix` passes
- [ ] Tests pass
