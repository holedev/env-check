import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LocaleSelect } from "../Header/LocalSlelect.client";
import { ThemeToggle } from "../Header/ThemeToggle.client";

const LandingHeader = () => {
  const t = useTranslations();

  return (
    <header className='sticky top-0 z-20 border-b bg-background/80 backdrop-blur'>
      <div className='mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4'>
        <Link className='flex items-center gap-2' href='/'>
          <span className='size-2.5 rounded-full bg-primary' />
          <span className='font-extrabold text-lg uppercase tracking-tight'>{t("common.site.logoText")}</span>
        </Link>
        <div className='flex items-center gap-2'>
          <div className='hidden sm:block'>
            <LocaleSelect />
          </div>
          <ThemeToggle />
          <Button asChild className='bg-primary text-primary-foreground hover:bg-primary/90'>
            <Link href='/tools'>
              {t("landing.header.openWorkspace")}
              <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export { LandingHeader };
