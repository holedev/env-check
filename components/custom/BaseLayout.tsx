import "@/app/globals.css";
import { cn } from "@/lib/utils";
import type { locale } from "@/types/global";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Roboto } from "next/font/google";
import type { ReactNode } from "react";
import { ThemeProvider } from "../theme-provider";
import { SidebarProvider } from "../ui/sidebar";
import { Toaster } from "../ui/sonner";
import { TooltipProvider } from "../ui/tooltip";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";

const roboto = Roboto({ subsets: ["latin"], weight: ["300", "400", "500", "700"], style: ["italic", "normal"] });

type BaseLayoutType = { children: ReactNode; locale: locale };

export async function BaseLayout({ children, locale }: BaseLayoutType) {
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn(roboto.className, "w-screen h-screen")}>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
          <TooltipProvider>
            <NextIntlClientProvider messages={messages}>
              <SidebarProvider>
                <AppSidebar />
                <div className='w-full'>
                  <Header />
                  <main className='p-4'>{children}</main>
                </div>
              </SidebarProvider>
            </NextIntlClientProvider>
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
