"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
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
import { useHandleError } from "@/hooks/use-handle-error";
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

  function renderResult() {
    if (isLoading) {
      return <LoadingComponent />;
    }
    if (models) {
      return (
        <div>
          <Alert className='flex justify-center' variant='default'>
            <CheckCircle2Icon />
            <AlertDescription>{t("validKey")}</AlertDescription>
          </Alert>
          <Accordion className='overflow-y-hidden' collapsible type='single'>
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
      );
    }
    if (!firstRender) {
      return (
        <Alert className='flex justify-center' variant='destructive'>
          <AlertCircleIcon />
          <AlertDescription>{t("invalidApiKey")}</AlertDescription>
        </Alert>
      );
    }
    return null;
  }

  return (
    <div className='mx-auto w-fit space-y-8'>
      <Form {...form}>
        <form className='flex flex-col items-end gap-4' onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name='apiKey'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.apiKey.label")}</FormLabel>
                <FormControl>
                  <InputWithPaste
                    autoComplete='off'
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
          <Button type='submit'>{t("form.submit")}</Button>
        </form>
      </Form>

      {renderResult()}
    </div>
  );
};

export { FormClient };
