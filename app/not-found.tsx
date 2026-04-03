import { AlertTriangleIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("defaultPage.notFound");

  return (
    <div className='flex flex-col items-center justify-center bg-linear-to-b px-4 py-12 text-center'>
      <AlertTriangleIcon className='mx-auto mb-4 h-12 w-12 text-red-500' />
      <p className='mb-6 font-semibold text-2xl text-gray-600 md:text-3xl dark:text-gray-300'>{t("title")}</p>
      <p className='mb-8 max-w-md text-gray-500 text-lg md:text-xl dark:text-gray-400'>{t("description")}</p>
      <Link href='/' passHref prefetch={true}>
        <Button className='flex items-center gap-2' size='lg' variant='outline'>
          <ArrowLeft className='h-4 w-4' />
          {t("redirect")}
        </Button>
      </Link>
    </div>
  );
}
