"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InputWithPaste } from "@/components/custom/InputWithPaste";
import { LoadingComponent } from "@/components/custom/Loading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHandleError } from "@/hooks/use-handle-error";
import { checkSMTPConnection } from "./actions";

const formSchema = z.object({
  host: z.string().min(1),
  port: z.coerce.number().min(1).max(65_535),
  username: z.string().email(),
  password: z.string().min(1),
  secure: z.boolean(),
  testType: z.enum(["verify", "sendEmail"])
});

type ConnectionResult = {
  success: boolean;
  testType: "verify" | "sendEmail";
  messageId: string | null;
  connectionDetails: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
  };
};

const FormClient = () => {
  const t = useTranslations("tools.items.gmail-smtp");
  const [result, setResult] = useState<ConnectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [firstRender, setFirstRender] = useState(true);
  const { handleErrorClient } = useHandleError();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      host: "smtp.gmail.com",
      port: 465,
      username: "",
      password: "",
      secure: true,
      testType: "verify" as const
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setFirstRender(false);

    await handleErrorClient({
      cb: async () => checkSMTPConnection(values),
      withSuccessNotify: true,
      postOnSuccess({ data }) {
        setResult(data.payload as ConnectionResult);
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

          {result.testType === "sendEmail" && result.messageId && (
            <Alert className='mb-4' variant='default'>
              <CheckCircle2Icon />
              <AlertDescription>{t("testEmailSent")}</AlertDescription>
            </Alert>
          )}

          <Accordion className='overflow-y-hidden' collapsible type='single'>
            <AccordionItem value='item-1'>
              <AccordionTrigger>{t("connectionDetails")}</AccordionTrigger>
              <AccordionContent>
                <div className='space-y-2'>
                  <p>
                    <strong>Host:</strong> {result.connectionDetails.host}
                  </p>
                  <p>
                    <strong>Port:</strong> {result.connectionDetails.port}
                  </p>
                  <p>
                    <strong>Username:</strong> {result.connectionDetails.username}
                  </p>
                  <p>
                    <strong>Secure:</strong> {result.connectionDetails.secure ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Test Type:</strong>{" "}
                    {result.testType === "verify"
                      ? t("form.testType.options.verify")
                      : t("form.testType.options.sendEmail")}
                  </p>
                  {result.messageId && (
                    <p>
                      <strong>Message ID:</strong> {result.messageId}
                    </p>
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
    <div className='mx-auto w-fit space-y-8'>
      <Form {...form}>
        <form className='flex flex-col gap-4' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='host'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.host.label")}</FormLabel>
                  <FormControl>
                    <Input autoComplete='off' placeholder={t("form.host.placeholder")} {...field} />
                  </FormControl>
                  <FormDescription>{t("form.host.description")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='port'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.port.label")}</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete='off'
                      placeholder={t("form.port.placeholder")}
                      type='number'
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>{t("form.port.description")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.username.label")}</FormLabel>
                <FormControl>
                  <InputWithPaste
                    autoComplete='email'
                    onPasteClick={(value) => field.onChange(value)}
                    placeholder={t("form.username.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("form.username.description")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.password.label")}</FormLabel>
                <FormControl>
                  <InputWithPaste
                    autoComplete='off'
                    onPasteClick={(value) => field.onChange(value)}
                    placeholder={t("form.password.placeholder")}
                    type='password'
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("form.password.description")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex items-center space-x-2'>
            <FormField
              control={form.control}
              name='secure'
              render={({ field }) => (
                <FormItem className='flex items-center space-x-2'>
                  <FormControl>
                    <input checked={field.value} className='h-4 w-4' onChange={field.onChange} type='checkbox' />
                  </FormControl>
                  <FormLabel className='font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                    {t("form.secure.label")}
                  </FormLabel>
                  <FormDescription className='text-muted-foreground text-xs'>
                    {t("form.secure.description")}
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='testType'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.testType.label")}</FormLabel>
                <Select defaultValue={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select test type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='verify'>{t("form.testType.options.verify")}</SelectItem>
                    <SelectItem value='sendEmail'>{t("form.testType.options.sendEmail")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>{t("form.testType.description")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className='self-end' type='submit'>
            {t("form.submit")}
          </Button>
        </form>
      </Form>

      {renderResult()}
    </div>
  );
};

export { FormClient };
