"use client";
import { AlertTriangleIcon, HomeIcon, RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

type ErrorType = { error: Error & { digest?: string }; reset: () => void };

export default function ErrorGlobal({ error, reset }: ErrorType) {
  const t = useTranslations("defaultPage.error");
  const isProd = process.env.NODE_ENV === "production";

  return (
    <div className='flex min-h-full items-center justify-center py-6'>
      <div className='w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md'>
        <AlertTriangleIcon className='mx-auto mb-4 h-12 w-12 text-red-500' />
        <h1 className='mb-4 font-bold text-2xl text-gray-800'>{t("title")}</h1>
        <p className='mb-6 text-gray-600'>{isProd ? t("description") : error.message}</p>
        <div className='mb-6 rounded-md bg-gray-100 p-4'>
          <p className='text-gray-600 text-sm'>{t("reminder")}</p>
        </div>
        <div className='flex flex-col space-y-3'>
          <Button className='w-full' onClick={() => reset()}>
            <RefreshCwIcon className='mr-2 h-4 w-4' />
            {t("tryAgain")}
          </Button>
          <Link href='/' passHref>
            <Button className='w-full' variant='outline'>
              <HomeIcon className='mr-2 h-4 w-4' />
              {t("redirect")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
