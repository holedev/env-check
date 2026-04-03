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
import { checkPostgreSqlConnection } from "./actions";

const formSchema = z.object({
  connectionString: z.string().min(1)
});

type PostgreSqlResult = {
  success: boolean;
  tables: string[];
  tablesCount: number;
};

const FormClient = () => {
  const t = useTranslations("tools.items.postgresql");
  const [result, setResult] = useState<PostgreSqlResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [firstRender, setFirstRender] = useState(true);
  const { handleErrorClient } = useHandleError();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      connectionString: ""
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setFirstRender(false);

    await handleErrorClient({
      cb: async () => checkPostgreSqlConnection(values),
      withSuccessNotify: true,
      postOnSuccess({ data }) {
        setResult(data.payload as PostgreSqlResult);
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

          <Accordion className='overflow-y-hidden' collapsible type='single'>
            <AccordionItem value='tables-list'>
              <AccordionTrigger>Tables ({result.tablesCount} found)</AccordionTrigger>
              <AccordionContent>
                <div className='space-y-2'>
                  {result.tables.length > 0 ? (
                    <div className='space-y-1'>
                      {result.tables.map((table) => (
                        <div className='rounded-md border p-2' key={table}>
                          <p className='font-medium'>{table}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-muted-foreground'>No tables found</p>
                  )}
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
            name='connectionString'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t("form.connectionString.label")}</FormLabel>
                <FormControl>
                  <InputWithPaste
                    autoComplete='off'
                    hidden
                    onPasteClick={(value) => field.onChange(value)}
                    placeholder={t("form.connectionString.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("form.connectionString.description")}</FormDescription>
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
