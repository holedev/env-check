import "@/app/globals.css";
import { Roboto } from "next/font/google";
import { headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import type { locale } from "@/types/global";
import { ThemeProvider } from "../theme-provider";
import { TooltipProvider } from "../ui/tooltip";

const roboto = Roboto({ subsets: ["latin"], weight: ["300", "400", "500", "700"], style: ["italic", "normal"] });

type BaseLayoutType = { children: ReactNode; locale: locale };

export async function BaseLayout({ children, locale }: BaseLayoutType) {
  const messages = await getMessages();
  // Set by proxy.ts; next-themes needs it for its inline anti-flash script.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn(roboto.className, "min-h-svh w-full antialiased")}>
        <ThemeProvider attribute='class' defaultTheme='system' disableTransitionOnChange enableSystem nonce={nonce}>
          <TooltipProvider>
            <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
          </TooltipProvider>
          <Toaster position='bottom-right' richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
