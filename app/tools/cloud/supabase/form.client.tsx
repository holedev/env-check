"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InputWithPaste } from "@/components/custom/InputWithPaste";
import { LoadingComponent } from "@/components/custom/Loading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useHandleError } from "@/hooks/use-handle-error";
import { checkSupabaseCredentials } from "./actions";

const formSchema = z.object({
  projectUrl: z.string().url(),
  serviceRoleKey: z.string().min(1)
});

type SupabaseResult = {
  success: boolean;
  userCount: number;
};

const FormClient = () => {
  const t = useTranslations("tools.items.supabase");
  const [result, setResult] = useState<SupabaseResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [firstRender, setFirstRender] = useState(true);
  const { handleErrorClient } = useHandleError();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectUrl: "",
      serviceRoleKey: ""
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setFirstRender(false);

    await handleErrorClient({
      cb: async () => checkSupabaseCredentials(values),
      withSuccessNotify: true,
      postOnSuccess({ data }) {
        setResult(data.payload as SupabaseResult);
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
        <div>
          <Alert className='mb-4 flex justify-center' variant='default'>
            <CheckCircle2Icon />
            <AlertDescription>{t("validCredentials")}</AlertDescription>
          </Alert>

          <Accordion collapsible type='single'>
            <AccordionItem value='project-details'>
              <AccordionTrigger>{t("details")}</AccordionTrigger>
              <AccordionContent>
                <div className='space-y-2'>
                  <p>
                    <strong>Users (first page):</strong> {result.userCount}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
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
            name='projectUrl'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t("form.projectUrl.label")}</FormLabel>
                <FormControl>
                  <InputWithPaste
                    autoComplete='off'
                    hidden={false}
                    onPasteClick={(value) => field.onChange(value)}
                    placeholder={t("form.projectUrl.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("form.projectUrl.description")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='serviceRoleKey'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t("form.serviceRoleKey.label")}</FormLabel>
                <FormControl>
                  <InputWithPaste
                    autoComplete='off'
                    hidden
                    onPasteClick={(value) => field.onChange(value)}
                    placeholder={t("form.serviceRoleKey.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("form.serviceRoleKey.description")}</FormDescription>
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
