"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { InputWithPaste } from "@/components/custom/InputWithPaste";
import { LoadingComponent } from "@/components/custom/Loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useHandleError } from "@/hooks/useHandleError";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
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

  return (
    <div className='space-y-4 w-fit mx-auto min-w-[400px]'>
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
                    {...field}
                    autoComplete='off'
                    onPasteClick={(value) => field.onChange(value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit' disabled={isLoading}>
            {t("form.submit")}
          </Button>
        </form>
      </Form>

      {isLoading ? (
        <LoadingComponent />
      ) : (
        <>
          {result ? (
            <>
              <Alert variant='default' className='flex justify-center mb-4'>
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
          ) : (
            !firstRender && (
              <Alert variant='destructive' className='flex justify-center'>
                <AlertCircleIcon />
                <AlertDescription>{t("invalidApiKey")}</AlertDescription>
              </Alert>
            )
          )}
        </>
      )}
    </div>
  );
}
