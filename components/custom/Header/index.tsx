import { SidebarTrigger } from "@/components/ui/sidebar";
import { LocaleSelect } from "./LocalSlelect.client";
import { ThemeToggle } from "./ThemeToggle.client";

const Header = () => {
  return (
    <header className='shadow-md border-b-2'>
      <div className='mx-auto px-4 py-4 flex justify-between items-center flex-col gap-4 md:flex-row'>
        <SidebarTrigger />
        <div className='flex gap-2 items-center'>
          <LocaleSelect />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export { Header };
