import "@/app/globals.css";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { BaseLayout } from "@/components/custom/BaseLayout";
import type { locale } from "@/types/global";

export const metadata: Metadata = {
  title: {
    template: "%s | ENV Check",
    default: "ENV Check"
  },
  description: "ENV Check"
};

type RootLayoutProps = { children: ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
  const localeStr = await getLocale();
  return <BaseLayout locale={localeStr as locale}>{children}</BaseLayout>;
}
