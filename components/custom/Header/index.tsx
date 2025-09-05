import Link from "next/link";
import { useTranslations } from "next-intl";
import { LocaleSelect } from "./LocalSlelect.client";
import { SearchCommand } from "./SearchCommand.client";
import { ThemeToggle } from "./ThemeToggle.client";

const Header = () => {
  const t = useTranslations();

  return (
    <header className='shadow-md border-b-2'>
      <div className='mx-auto px-4 py-4 flex justify-between items-center flex-col gap-4 md:flex-row'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center justify-center py-4'>
            <Link href='/' className='flex items-center gap-2'>
              <h1 className='scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-2xl uppercase'>
                {t("common.site.logoText")}
              </h1>
            </Link>
          </div>
          {/* <SidebarTrigger /> */}
        </div>
        <div className='flex gap-2 items-center'>
          <SearchCommand />
          <LocaleSelect />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export { Header };
