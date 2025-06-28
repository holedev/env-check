"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { OpenAI } from "openai";
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
import { checkAPIKey } from "./actions";

const formSchema = z.object({
  apiKey: z.string().length(39)
});

const FormClient = () => {
  const t = useTranslations("tools.items.google-gemini");
  const [models, setModels] = useState<OpenAI.Models.Model[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [firstRender, setFirstRender] = useState(true);
  const { handleErrorClient } = useHandleError();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: ""
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setModels([]);
    setFirstRender(false);
    await handleErrorClient({
      cb: async () => checkAPIKey(values.apiKey),
      withSuccessNotify: true,
      postOnSuccess({ data }) {
        setModels(data.payload as OpenAI.Models.Model[]);
      },
      postOnError() {
        setModels(null);
      }
    });
    setIsLoading(false);
  }

  return (
    <div className='space-y-8 w-fit mx-auto'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col items-end gap-4'>
          <FormField
            control={form.control}
            name='apiKey'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.apiKey.label")}</FormLabel>
                <FormControl>
                  <InputWithPaste
                    placeholder={t("form.apiKey.placeholder")}
                    autoComplete='off'
                    onPasteClick={(value) => field.onChange(value)}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("form.apiKey.description")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit'>{t("form.submit")}</Button>
        </form>
      </Form>

      {isLoading ? (
        <LoadingComponent />
      ) : models ? (
        <div>
          <Alert variant='default' className='flex justify-center'>
            <CheckCircle2Icon />
            <AlertDescription>{t("validKey")}</AlertDescription>
          </Alert>
          <Accordion type='single' collapsible className='overflow-y-hidden'>
            <AccordionItem value='item-1'>
              <AccordionTrigger>
                {t("availableModels")} ({models.length})
              </AccordionTrigger>
              <AccordionContent>
                {models.length > 0 ? (
                  models.map((model) => <p key={model.id}>{model.id}</p>)
                ) : (
                  <p>{t("noAvailableModels")}</p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ) : (
        !firstRender && (
          <Alert variant='destructive' className='flex justify-center'>
            <AlertCircleIcon />
            <AlertDescription>{t("invalidApiKey")}</AlertDescription>
          </Alert>
        )
      )}
    </div>
  );
};

export { FormClient };
