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
import { Input } from "@/components/ui/input";
import { useHandleError } from "@/hooks/use-handle-error";
import { checkS3Connection } from "./actions";

const formSchema = z.object({
  endpoint: z.string().optional(),
  region: z.string().min(1),
  accessKeyId: z.string().min(1),
  secretAccessKey: z.string().min(1)
});

type S3Result = {
  success: boolean;
  connectionDetails: {
    endpoint: string;
    region: string;
    accessKeyId: string;
  };
  buckets: Array<{
    name: string;
    creationDate: string | null;
  }>;
  bucketsCount: number;
};

const FormClient = () => {
  const t = useTranslations("tools.items.s3-compatible");
  const [result, setResult] = useState<S3Result | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [firstRender, setFirstRender] = useState(true);
  const { handleErrorClient } = useHandleError();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      endpoint: "",
      region: "us-east-1",
      accessKeyId: "",
      secretAccessKey: ""
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setFirstRender(false);

    await handleErrorClient({
      cb: async () => checkS3Connection(values),
      withSuccessNotify: true,
      postOnSuccess({ data }) {
        setResult(data.payload as S3Result);
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
            <AccordionItem value='connection-details'>
              <AccordionTrigger>{t("connectionDetails")}</AccordionTrigger>
              <AccordionContent>
                <div className='space-y-2'>
                  <p>
                    <strong>Endpoint:</strong> {result.connectionDetails.endpoint}
                  </p>
                  <p>
                    <strong>Region:</strong> {result.connectionDetails.region}
                  </p>
                  <p>
                    <strong>Access Key ID:</strong> {result.connectionDetails.accessKeyId}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value='buckets-list'>
              <AccordionTrigger>Buckets ({result.bucketsCount} found)</AccordionTrigger>
              <AccordionContent>
                <div className='space-y-2'>
                  {result.buckets.length > 0 ? (
                    <div className='space-y-1'>
                      {result.buckets.map((bucket) => (
                        <div className='rounded-md border p-2' key={bucket.name}>
                          <p className='font-medium'>{bucket.name}</p>
                          {bucket.creationDate && (
                            <p className='text-muted-foreground text-sm'>
                              Created: {new Date(bucket.creationDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-muted-foreground'>No buckets found</p>
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
        <form className='flex flex-col gap-4' onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name='endpoint'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.endpoint.label")}</FormLabel>
                <FormControl>
                  <InputWithPaste
                    autoComplete='off'
                    onPasteClick={(value) => field.onChange(value)}
                    placeholder={t("form.endpoint.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("form.endpoint.description")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='region'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.region.label")}</FormLabel>
                <FormControl>
                  <Input autoComplete='off' placeholder={t("form.region.placeholder")} {...field} />
                </FormControl>
                <FormDescription>{t("form.region.description")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='accessKeyId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.accessKey.label")}</FormLabel>
                <FormControl>
                  <InputWithPaste
                    autoComplete='off'
                    onPasteClick={(value) => field.onChange(value)}
                    placeholder={t("form.accessKey.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("form.accessKey.description")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='secretAccessKey'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.secretKey.label")}</FormLabel>
                <FormControl>
                  <InputWithPaste
                    autoComplete='off'
                    onPasteClick={(value) => field.onChange(value)}
                    placeholder={t("form.secretKey.placeholder")}
                    type='password'
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("form.secretKey.description")}</FormDescription>
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
