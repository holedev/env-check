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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useHandleError } from "@/hooks/use-handle-error";
import { checkGithubToken } from "./actions";

const formSchema = z.object({
  token: z.string().min(1)
});

type FormSchema = z.infer<typeof formSchema>;

type GithubResult = { login: string; type: string };

export function GithubForm() {
  const t = useTranslations("tools.items.github");
  const [result, setResult] = useState<GithubResult | null>(null);
  const [firstRender, setFirstRender] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { handleErrorClient } = useHandleError();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: ""
    }
  });

  async function onSubmit(data: FormSchema) {
    setIsLoading(true);
    setResult(null);
    setFirstRender(false);

    await handleErrorClient({
      cb: async () => checkGithubToken(data),
      withSuccessNotify: true,
      postOnSuccess: ({ data }) => {
        setResult(data.payload as GithubResult);
      },
      postOnError: () => {
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
        <>
          <Alert className='mb-4 flex justify-center' variant='default'>
            <CheckCircle2Icon />
            <AlertDescription>{t("validApiKey")}</AlertDescription>
          </Alert>
          <Card>
            <CardHeader>
              <CardTitle>{t("result.title")}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm'>
              <p>
                <strong>Login: </strong> {result.login}
              </p>
              <p>
                <strong>Type: </strong> {result.type}
              </p>
            </CardContent>
          </Card>
        </>
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
    <div className='mx-auto w-fit min-w-[400px] space-y-4'>
      <Form {...form}>
        <form className='flex flex-col items-end gap-4' onSubmit={form.handleSubmit(onSubmit)}>
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
                    {...field}
                    autoComplete='off'
                    onPasteClick={(value) => field.onChange(value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isLoading} type='submit'>
            {t("form.submit")}
          </Button>
        </form>
      </Form>

      {renderResult()}
    </div>
  );
}
