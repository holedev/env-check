import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import type { locale } from "@/types/global";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
// import { Roboto } from "next/font/google";
import type { ReactNode } from "react";
import { ThemeProvider } from "../theme-provider";
import { TooltipProvider } from "../ui/tooltip";
import { Header } from "./Header";

// const roboto = Roboto({ subsets: ["latin"], weight: ["300", "400", "500", "700"], style: ["italic", "normal"] });

type BaseLayoutType = { children: ReactNode; locale: locale };

export async function BaseLayout({ children, locale }: BaseLayoutType) {
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className='w-full h-screen font-sans'>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
          <TooltipProvider>
            <NextIntlClientProvider messages={messages}>
              {/* <SidebarProvider defaultOpen={true}> */}
              {/* <AppSidebar /> */}
              <div className='w-full'>
                <Header />
                <main className='p-4'>{children}</main>
              </div>
              {/* </SidebarProvider> */}
            </NextIntlClientProvider>
          </TooltipProvider>
          <Toaster position='bottom-right' richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
