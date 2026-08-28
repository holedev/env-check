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
import { checkGoogleAnalyticsCredentials } from "./actions";

const formSchema = z.object({
  measurementId: z.string().regex(/^G-[A-Z0-9]+$/, "Must look like G-XXXXXXX"),
  apiSecret: z.string().min(1)
});

type GoogleAnalyticsResult = {
  valid: boolean;
};

const FormClient = () => {
  const t = useTranslations("tools.items.google-analytics");
  const [result, setResult] = useState<GoogleAnalyticsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [firstRender, setFirstRender] = useState(true);
  const { handleErrorClient } = useHandleError();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      measurementId: "",
      apiSecret: ""
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setFirstRender(false);

    await handleErrorClient({
      cb: async () => checkGoogleAnalyticsCredentials(values),
      withSuccessNotify: true,
      postOnSuccess({ data }) {
        setResult(data.payload as GoogleAnalyticsResult);
      },
      postOnError() {
        setResult(null);
      }
    });
    setIsLoading(false);
  }

  function renderResult() {
    if (isLoading) {
      return <LoadingComponent />;
    }
    if (result) {
      return (
        <Alert className='flex justify-center' variant='default'>
          <CheckCircle2Icon />
          <AlertDescription>{t("validCredentials")}</AlertDescription>
        </Alert>
      );
    }
    if (!firstRender) {
      return (
        <Alert className='flex justify-center' variant='destructive'>
          <AlertCircleIcon />
          <AlertDescription>{t("invalidCredentials")}</AlertDescription>
        </Alert>
      );
    }
    return null;
  }

  return (
    <div className='mx-auto w-fit min-w-[400px] space-y-8'>
      <Form {...form}>
        <form className='flex flex-col items-end gap-4' onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name='measurementId'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t("form.measurementId.label")}</FormLabel>
                <FormControl>
                  <InputWithPaste
                    autoComplete='off'
                    hidden={false}
                    onPasteClick={(value) => field.onChange(value)}
                    placeholder={t("form.measurementId.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("form.measurementId.description")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='apiSecret'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t("form.apiSecret.label")}</FormLabel>
                <FormControl>
                  <InputWithPaste
                    autoComplete='off'
                    hidden
                    onPasteClick={(value) => field.onChange(value)}
                    placeholder={t("form.apiSecret.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("form.apiSecret.description")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit'>{t("form.submit")}</Button>
        </form>
      </Form>

      {renderResult()}
    </div>
  );
};

export { FormClient };
