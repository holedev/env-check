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
import { useHandleError } from "@/hooks/useHandleError";
import { checkDiscordConnection } from "./actions";

const formSchema = z.object({
  token: z.string().min(1)
});

type DiscordResult = {
  id: string;
  username: string;
  discriminator: string;
  bot: boolean;
};

const FormClient = () => {
  const t = useTranslations("tools.items.discord");
  const [result, setResult] = useState<DiscordResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [firstRender, setFirstRender] = useState(true);
  const { handleErrorClient } = useHandleError();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: ""
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setFirstRender(false);

    await handleErrorClient({
      cb: async () => checkDiscordConnection(values),
      withSuccessNotify: true,
      postOnSuccess({ data }) {
        console.info("[form.client.tsx:55] ", data);
        setResult(data.payload as DiscordResult);
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
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col items-end gap-4'>
          <FormField
            control={form.control}
            name='token'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t("form.token.label")}</FormLabel>
                <FormControl>
                  <InputWithPaste
                    hidden
                    placeholder={t("form.token.placeholder")}
                    autoComplete='off'
                    onPasteClick={(value) => field.onChange(value)}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("form.token.description")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit'>{t("form.submit")}</Button>
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

          <Accordion type='single' collapsible>
            <AccordionItem value='databases-list'>
              <AccordionTrigger>{t("details")}</AccordionTrigger>
              <AccordionContent>
                <div className='space-y-2'>
                  <p>
                    <strong>ID:</strong> {result.id}
                  </p>
                  <p>
                    <strong>Username:</strong> {result.username}#{result.discriminator}
                  </p>
                  <p>
                    <strong>Bot:</strong> {result.bot ? "Yes" : "No"}
                  </p>
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
