"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { InputWithPaste } from "@/components/custom/InputWithPaste";
import { LoadingComponent } from "@/components/custom/Loading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useHandleError } from "@/hooks/useHandleError";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
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

  return (
    <div className='space-y-8 w-fit mx-auto min-w-[400px]'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          <FormField
            control={form.control}
            name='connectionString'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.connectionString.label")}</FormLabel>
                <FormControl>
                  <InputWithPaste
                    placeholder={t("form.connectionString.placeholder")}
                    autoComplete='off'
                    onPasteClick={(value) => field.onChange(value)}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("form.connectionString.description")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit' className='self-end'>
            {t("form.submit")}
          </Button>
        </form>
      </Form>

      {isLoading ? (
        <LoadingComponent />
      ) : result ? (
        <div>
          <Alert variant='default' className='flex justify-center mb-4'>
            <CheckCircle2Icon />
            <AlertDescription>{t("validCredentials")}</AlertDescription>
          </Alert>

          <Accordion type='single' collapsible className='overflow-y-hidden'>
            <AccordionItem value='databases-list'>
              <AccordionTrigger>Databases ({result.databasesCount} found)</AccordionTrigger>
              <AccordionContent>
                <div className='space-y-2'>
                  {result.databases.length > 0 ? (
                    <div className='space-y-1'>
                      {result.databases.map((db) => (
                        <div key={db} className='p-2 border rounded-md'>
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
                        <div key={col} className='p-2 border rounded-md'>
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
      ) : (
        !firstRender && (
          <Alert variant='destructive' className='flex justify-center'>
            <AlertCircleIcon />
            <AlertDescription>{t("invalidCredentials")}</AlertDescription>
          </Alert>
        )
      )}
    </div>
  );
};

export { FormClient };
