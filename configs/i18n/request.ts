import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { _DEFAULT_LOCALE, _NEXT_COOKIE_LOCALE } from "@/constants/lang";
import type { locale } from "@/types/global";

export default getRequestConfig(async () => {
  const locale = (await cookies()).get(_NEXT_COOKIE_LOCALE)?.value || (_DEFAULT_LOCALE as locale);

  return {
    locale,
    timeZone: "Asia/Ho_Chi_Minh",
    now: new Date(),
    messages: {
      ...(await import(`../messages/${locale}.json`)).default
    }
  };
});
