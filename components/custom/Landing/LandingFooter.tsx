import Link from "next/link";
import { useTranslations } from "next-intl";
import { _REPO_URL } from "@/constants/site";
import { LocaleSelect } from "../Header/LocalSlelect.client";
import { Logo } from "../Logo";

const LandingFooter = () => {
  const t = useTranslations();

  return (
    <footer className='border-t'>
      <div className='mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-col gap-2'>
          <Logo className='text-foreground' />
          <p>{t("landing.footer.tagline")}</p>
        </div>
        <div className='flex flex-wrap items-center gap-5'>
          <div className='sm:hidden'>
            <LocaleSelect />
          </div>
          <Link className='hover:text-foreground' href='/tools'>
            Tools
          </Link>
          <a className='hover:text-foreground' href={_REPO_URL} rel='noopener noreferrer' target='_blank'>
            {t("landing.footer.source")}
          </a>
          <span className='font-mono text-xs'>{t("landing.footer.license")}</span>
        </div>
      </div>
    </footer>
  );
};

export { LandingFooter };
