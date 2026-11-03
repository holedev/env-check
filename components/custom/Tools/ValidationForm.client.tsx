"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, AlertTriangleIcon, CheckCircle2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { type DefaultValues, type Path, useForm } from "react-hook-form";
import type { z } from "zod";
import { InputWithPaste } from "@/components/custom/InputWithPaste";
import { LoadingComponent } from "@/components/custom/Loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHandleError } from "@/hooks/use-handle-error";
import type { ResponseType } from "@/types/response";
import type { ToolPath } from "@/types/tool";
import type { SummaryItem, ValidationResult } from "@/types/validation";

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

/**
 * The whole form for a Tool: renders its fields, calls its Server Action and
 * shows one of the three Validation outcomes with the Validation summary.
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

  const renderSummary = (summary: SummaryItem[]) =>
    summary.length > 0 && (
      <dl className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-lg border p-4 text-sm'>
        {summary.map((item) => (
          <div className='contents' key={item.key}>
            <dt className='text-muted-foreground'>{tool(`summary.${item.key}`)}</dt>
            <dd className='break-all font-medium'>{formatValue(item.value)}</dd>
          </div>
        ))}
      </dl>
    );

  const renderResult = () => {
    switch (state.kind) {
      case "loading":
        return <LoadingComponent />;
      case "failed":
        return (
          <Alert variant='destructive'>
            <AlertCircleIcon />
            <AlertTitle>{tool("invalidCredentials")}</AlertTitle>
            {state.message && <AlertDescription className='break-all'>{state.message}</AlertDescription>}
          </Alert>
        );
      case "done":
        return (
          <div className='space-y-4' data-outcome={state.result.outcome}>
            {state.result.outcome === "restricted" ? (
              <Alert className='border-amber-500/50 text-amber-700 dark:text-amber-400 [&>svg]:text-amber-600'>
                <AlertTriangleIcon />
                <AlertTitle>{tool("restrictedCredentials")}</AlertTitle>
                {state.result.reason && (
                  <AlertDescription className='break-all'>{state.result.reason}</AlertDescription>
                )}
              </Alert>
            ) : (
              <Alert className='border-brand/40 text-brand [&>svg]:text-brand'>
                <CheckCircle2Icon />
                <AlertTitle>{tool("validCredentials")}</AlertTitle>
              </Alert>
            )}
            {renderSummary(state.result.summary)}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className='mx-auto w-full space-y-8 sm:w-fit sm:min-w-[400px] sm:max-w-xl'>
      <Form {...form}>
        <form className='flex flex-col items-end gap-4' onSubmit={form.handleSubmit(onSubmit)}>
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

          <Button disabled={state.kind === "loading"} type='submit'>
            {tool("form.submit")}
          </Button>
        </form>
      </Form>

      {renderResult()}
    </div>
  );
};

export { ValidationForm };
