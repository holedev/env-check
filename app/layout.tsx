import "@/app/globals.css";
import { BaseLayout } from "@/components/custom/BaseLayout";
import type { locale } from "@/types/global";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    template: "%s | ENV Check",
    default: "ENV Check"
  },
  description: "ENV Check"
};

type LocaleLayoutType = { children: ReactNode; params: Promise<{ locale: locale }> };

export default async function RootLayout({ children, params }: LocaleLayoutType) {
  const { locale } = await params;
  return <BaseLayout locale={locale}>{children}</BaseLayout>;
}
