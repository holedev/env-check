"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon, CircleCheckIcon, CircleXIcon, LoaderCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { type DefaultValues, type Path, useForm } from "react-hook-form";
import type { z } from "zod";
import { InputWithPaste } from "@/components/custom/InputWithPaste";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { _TOOL_LIST } from "@/constants/tool";
import { useHandleError } from "@/hooks/use-handle-error";
import { cn } from "@/lib/utils";
import type { ResponseType } from "@/types/response";
import type { ToolPath } from "@/types/tool";
import type { SummaryItem, ValidationResult } from "@/types/validation";
import { HowItWorks } from "./HowItWorks";

type Values = Record<string, string>;

export type ValidationField<V extends Values> = {
  name: Path<V> & keyof V & string;
  /** secret (default): masked InputWithPaste. text: visible InputWithPaste. select: fixed options. */
  kind?: "secret" | "text" | "select";
  /** For select: option values; labels are `form.<name>.options.<value>`. */
  options?: readonly string[];
};

type ValidationFormProps<V extends Values> = {
  toolPath: ToolPath;
  schema: z.ZodType<V, V>;
  fields: ValidationField<V>[];
  defaultValues: V;
  action: (values: V) => Promise<ResponseType>;
};

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; result: ValidationResult }
  | { kind: "failed"; message: string };

const _MAX_LIST_ITEMS = 10;

type Outcome = ValidationResult["outcome"] | "invalid";

/** Colour is reserved for outcomes; each also differs by icon and title, never by hue alone. */
const _TONES: Record<Outcome, { box: string; head: string; Icon: typeof CircleCheckIcon }> = {
  valid: { box: "border-ok/40", head: "bg-ok-soft text-ok", Icon: CircleCheckIcon },
  restricted: { box: "border-warn/40", head: "bg-warn-soft text-warn", Icon: CircleAlertIcon },
  invalid: { box: "border-bad/40", head: "bg-bad-soft text-bad", Icon: CircleXIcon }
};

/**
 * The whole form for a Tool: renders its fields, calls its Server Action and
 * shows one of the three Validation outcomes with the Validation summary.
 * Two columns on large screens: the form, then a panel that shows "How it is
 * checked" (HowItWorks) until the first result replaces it.
 * i18n keys live under `tools.items.<toolPath>`: form.<field>.{label,placeholder,description},
 * form.submit, validCredentials, restrictedCredentials, invalidCredentials, summary.<key>.
 * Schema error messages: "required", or "errors.<key>" → form.<field>.errors.<key>.
 */
const ValidationForm = <V extends Values>({
  toolPath,
  schema,
  fields,
  defaultValues,
  action
}: ValidationFormProps<V>) => {
  const t = useTranslations();
  const tool = (key: string) => t(`tools.items.${toolPath}.${key}` as Parameters<typeof t>[0]);
  const [state, setState] = useState<State>({ kind: "idle" });
  const { handleErrorClient, toast } = useHandleError();

  const form = useForm<V>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<V>
  });

  async function onSubmit(values: V) {
    setState({ kind: "loading" });
    await handleErrorClient({
      cb: () => action(values),
      withSuccessNotify: false,
      postOnSuccess({ data }) {
        const result = data.payload as ValidationResult;
        setState({ kind: "done", result });
        if (result.outcome === "restricted") {
          toast.warning(t("common.validation.restricted"), { description: tool("restrictedCredentials") });
        } else {
          toast.success(t("common.validation.valid"), { description: tool("validCredentials") });
        }
      },
      postOnError({ error }) {
        setState({ kind: "failed", message: error.message ?? "" });
      }
    });
  }

  // Schema messages are i18n keys: "required" → common, "errors.x" → form.<field>.errors.x.
  const translateError = (field: string, message: string) => {
    if (message === "required") {
      return t("common.validation.required");
    }
    return message.startsWith("errors.") ? tool(`form.${field}.${message}`) : message;
  };

  const formatValue = (value: SummaryItem["value"]) => {
    if (typeof value === "boolean") {
      return value ? t("common.validation.yes") : t("common.validation.no");
    }
    if (typeof value === "number") {
      return value.toLocaleString();
    }
    if (Array.isArray(value)) {
      const shown = value.slice(0, _MAX_LIST_ITEMS).join(", ");
      const hidden = value.length - _MAX_LIST_ITEMS;
      return hidden > 0 ? `${shown} ${t("common.validation.more", { count: hidden })}` : shown;
    }
    return value;
  };

  const probe = _TOOL_LIST.find((item) => item.path === toolPath)?.probe;

  const renderResult = (outcome: Outcome, title: string, reason: string | undefined, summary: SummaryItem[]) => {
    const tone = _TONES[outcome];
    return (
      <section
        aria-label={title}
        className={cn("overflow-hidden rounded-lg border bg-card", tone.box)}
        data-outcome={outcome}
      >
        <div className={cn("flex items-center gap-3 border-b px-5 py-3", tone.head, tone.box)}>
          <tone.Icon aria-hidden className='size-5 shrink-0' />
          <h2 className='font-semibold'>{title}</h2>
          <span className='ml-auto font-mono text-xs'>{t(`common.validation.${outcome}`)}</span>
        </div>
        <div className='space-y-4 p-5'>
          {reason && (
            <code className='wrap-anywhere block rounded-md border bg-background px-3 py-2 text-[13px] text-muted-foreground'>
              {reason}
            </code>
          )}
          {summary.length > 0 && (
            <dl className='grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm'>
              {summary.map((item) => (
                <div className='contents' key={item.key}>
                  <dt className='text-muted-foreground'>{tool(`summary.${item.key}`)}</dt>
                  <dd className='wrap-anywhere font-medium font-mono'>
                    {item.enumKey ? tool(`${item.enumKey}.${String(item.value)}`) : formatValue(item.value)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {probe && (
            <p className='wrap-anywhere border-t pt-4 font-mono text-muted-foreground text-xs'>
              {probe.method} {probe.target}
            </p>
          )}
        </div>
      </section>
    );
  };

  const renderPanel = () => {
    switch (state.kind) {
      case "loading":
        return (
          <section className='flex min-h-48 items-center justify-center gap-3 rounded-lg border p-6 text-muted-foreground text-sm'>
            <LoaderCircleIcon aria-hidden className='size-5 animate-spin' />
            {t("common.validation.checking")}
          </section>
        );
      case "failed":
        return renderResult("invalid", tool("invalidCredentials"), state.message, []);
      case "done":
        return renderResult(
          state.result.outcome,
          tool(state.result.outcome === "restricted" ? "restrictedCredentials" : "validCredentials"),
          state.result.reason,
          state.result.summary
        );
      default:
        return <HowItWorks toolPath={toolPath} />;
    }
  };

  return (
    <div className='grid items-start gap-6 lg:grid-cols-2'>
      <Form {...form}>
        <form className='flex flex-col gap-5 rounded-lg border bg-card p-6' onSubmit={form.handleSubmit(onSubmit)}>
          {fields.map(({ name, kind = "secret", options = [] }) => (
            <FormField
              control={form.control}
              key={name}
              name={name}
              render={({ field, fieldState }) => (
                <FormItem className='w-full'>
                  <FormLabel>{tool(`form.${name}.label`)}</FormLabel>
                  {kind === "select" ? (
                    <Select defaultValue={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {tool(`form.${name}.options.${option}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <FormControl>
                      <InputWithPaste
                        autoComplete='off'
                        hidden={kind === "secret"}
                        inputClassName='font-mono'
                        onPasteClick={(value) => field.onChange(value)}
                        placeholder={tool(`form.${name}.placeholder`)}
                        spellCheck={false}
                        {...field}
                      />
                    </FormControl>
                  )}
                  <FormDescription>{tool(`form.${name}.description`)}</FormDescription>
                  {fieldState.error?.message && (
                    <p className='text-destructive text-sm' role='alert'>
                      {translateError(name, fieldState.error.message)}
                    </p>
                  )}
                </FormItem>
              )}
            />
          ))}

          <Button className='self-start' disabled={state.kind === "loading"} size='lg' type='submit'>
            {tool("form.submit")}
          </Button>
        </form>
      </Form>

      <div aria-live='polite'>{renderPanel()}</div>
    </div>
  );
};

export { ValidationForm };
