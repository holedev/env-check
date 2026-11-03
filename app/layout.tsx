import "@/app/globals.css";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { BaseLayout } from "@/components/custom/BaseLayout";
import { _SITE_URL } from "@/constants/site";
import type { locale } from "@/types/global";

export const metadata: Metadata = {
  metadataBase: new URL(_SITE_URL),
  applicationName: "ENV Check",
  title: {
    template: "%s | ENV Check",
    default: "ENV Check"
  },
  description: "Validate API keys and credentials across services, without storing them."
};

type RootLayoutProps = { children: ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
  const localeStr = await getLocale();
  return <BaseLayout locale={localeStr as locale}>{children}</BaseLayout>;
}
