import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { _REPO_URL } from "@/constants/site";
import { LocaleSelect } from "../Header/LocalSlelect.client";
import { ThemeToggle } from "../Header/ThemeToggle.client";
import { Logo } from "../Logo";

const LandingHeader = () => {
  const t = useTranslations();

  return (
    <header className='sticky top-0 z-20 border-b bg-background/80 backdrop-blur'>
      <div className='mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4'>
        <Link aria-label='env-check' href='/'>
          <Logo />
        </Link>
        <nav aria-label='Main' className='flex items-center gap-2'>
          <a
            className='hidden px-3 py-2 text-muted-foreground text-sm hover:text-foreground sm:inline'
            href={_REPO_URL}
            rel='noopener noreferrer'
            target='_blank'
          >
            GitHub
          </a>
          <div className='hidden sm:block'>
            <LocaleSelect />
          </div>
          <ThemeToggle />
          <Button asChild>
            <Link href='/tools'>
              {t("landing.header.openWorkspace")}
              <ArrowRightIcon />
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export { LandingHeader };
