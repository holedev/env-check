import { useTranslations } from "next-intl";
import { LocaleSelect } from "../Header/LocalSlelect.client";

const LandingFooter = () => {
  const t = useTranslations();

  return (
    <footer className='border-t'>
      <div className='mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-1'>
          <p className='font-semibold text-foreground'>{t("common.site.logoText")}</p>
          <p>{t("landing.footer.tagline")}</p>
        </div>
        <div className='flex flex-wrap items-center gap-4'>
          <div className='sm:hidden'>
            <LocaleSelect />
          </div>
          <a
            className='hover:text-foreground'
            href='https://github.com/holedev/env-check'
            rel='noopener noreferrer'
            target='_blank'
          >
            {t("landing.footer.source")}
          </a>
          <span>{t("landing.footer.license")}</span>
          <span>&copy; {new Date().getFullYear()} holedev</span>
        </div>
      </div>
    </footer>
  );
};

export { LandingFooter };
