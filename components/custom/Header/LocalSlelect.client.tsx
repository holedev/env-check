"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { _NEXT_COOKIE_LOCALE } from "@/constants/lang";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

const LocaleSelect = () => {
  const t = useTranslations("common.locale");
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();

  const handleChangeLocale = (newLocale: string) => {
    startTransition(() => {
      document.cookie = `${_NEXT_COOKIE_LOCALE}=${newLocale}; path=/`;
      router.refresh();
    });
  };

  if (isPending) {
    return <Skeleton className='h-10 w-[180px] border-2' />;
  }

  return (
    <Select onValueChange={handleChangeLocale} defaultValue={locale}>
      <SelectTrigger className='w-[180px]'>
        <SelectValue placeholder='Select' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='en'>{t("en")}</SelectItem>
        <SelectItem value='vi'>{t("vi")}</SelectItem>
      </SelectContent>
    </Select>
  );
};

export { LocaleSelect };
