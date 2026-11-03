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
import { checkMongoDbConnection } from "./actions";

const formSchema = z.object({
  connectionString: z.string().min(1)
});

type MongoDbResult = {
  success: boolean;
  collections: string[];
  databases: string[];
  collectionsCount: number;
  databasesCount: number;
};

const FormClient = () => {
  const t = useTranslations("tools.items.mongodb");
  const [result, setResult] = useState<MongoDbResult | null>(null);
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
      cb: async () => checkMongoDbConnection(values),
      withSuccessNotify: true,
      postOnSuccess({ data }) {
        setResult(data.payload as MongoDbResult);
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
            <AccordionItem value='databases-list'>
              <AccordionTrigger>Databases ({result.databasesCount} found)</AccordionTrigger>
              <AccordionContent>
                <div className='space-y-2'>
                  {result.databases.length > 0 ? (
                    <div className='space-y-1'>
                      {result.databases.map((db) => (
                        <div className='rounded-md border p-2' key={db}>
                          <p className='font-medium'>{db}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-muted-foreground'>No databases found</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value='collections-list'>
              <AccordionTrigger>Collections ({result.collectionsCount} found)</AccordionTrigger>
              <AccordionContent>
                <div className='space-y-2'>
                  {result.collections.length > 0 ? (
                    <div className='space-y-1'>
                      {result.collections.map((col) => (
                        <div className='rounded-md border p-2' key={col}>
                          <p className='font-medium'>{col}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-muted-foreground'>No collections found</p>
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
    <div className='mx-auto w-full space-y-8 sm:w-fit sm:min-w-[400px]'>
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
