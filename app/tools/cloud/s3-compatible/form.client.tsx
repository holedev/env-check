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
import { useHandleError } from "@/hooks/useHandleError";
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

  return (
    <div className='space-y-8 w-fit mx-auto min-w-[400px]'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          <FormField
            control={form.control}
            name='endpoint'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.endpoint.label")}</FormLabel>
                <FormControl>
                  <InputWithPaste
                    placeholder={t("form.endpoint.placeholder")}
                    autoComplete='off'
                    onPasteClick={(value) => field.onChange(value)}
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
                  <Input placeholder={t("form.region.placeholder")} autoComplete='off' {...field} />
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
                    placeholder={t("form.accessKey.placeholder")}
                    autoComplete='off'
                    onPasteClick={(value) => field.onChange(value)}
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
                    type='password'
                    placeholder={t("form.secretKey.placeholder")}
                    autoComplete='off'
                    onPasteClick={(value) => field.onChange(value)}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("form.secretKey.description")}</FormDescription>
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
                        <div key={bucket.name} className='p-2 border rounded-md'>
                          <p className='font-medium'>{bucket.name}</p>
                          {bucket.creationDate && (
                            <p className='text-sm text-muted-foreground'>
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
