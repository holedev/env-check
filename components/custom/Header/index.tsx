import Link from "next/link";
import { useTranslations } from "next-intl";
import { LocaleSelect } from "./LocalSlelect.client";
import { SearchCommand } from "./SearchCommand.client";
import { ThemeToggle } from "./ThemeToggle.client";

const Header = () => {
  const t = useTranslations();

  return (
    <header className='border-b-2 shadow-md'>
      <div className='mx-auto flex flex-col items-center justify-between gap-4 px-4 py-4 md:flex-row'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center justify-center py-4'>
            <Link className='flex items-center gap-2' href='/'>
              <h1 className='scroll-m-20 font-extrabold text-2xl uppercase tracking-tight lg:text-2xl'>
                {t("common.site.logoText")}
              </h1>
            </Link>
          </div>
          {/* <SidebarTrigger /> */}
        </div>
        <div className='flex items-center gap-2'>
          <SearchCommand />
          <LocaleSelect />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export { Header };
