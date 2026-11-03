import { SidebarTrigger } from "@/components/ui/sidebar";
import { LocaleSelect } from "../Header/LocalSlelect.client";
import { SearchCommand } from "../Header/SearchCommand.client";
import { ThemeToggle } from "../Header/ThemeToggle.client";

const WorkspaceHeader = () => (
  <header className='sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur'>
    <SidebarTrigger className='-ml-1' />
    <div className='flex flex-1 items-center justify-end gap-2'>
      <SearchCommand />
      <LocaleSelect />
      <ThemeToggle />
    </div>
  </header>
);

export { WorkspaceHeader };
