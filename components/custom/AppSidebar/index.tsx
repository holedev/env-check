import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { _TOOL_GROUP_LIST, _TOOL_LIST } from "@/constants/tool";
import { ChevronDownIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

const AppSidebar = () => {
  const t = useTranslations();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className='flex items-center justify-center py-4'>
          <Link href='/' className='flex items-center gap-2'>
            <h1 className='scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-2xl uppercase'>
              {t("common.site.logoText")}
            </h1>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {_TOOL_GROUP_LIST.map((group) => {
          return (
            <Collapsible key={group.path} defaultOpen={false} className='group/collapsible'>
              <SidebarGroup key={group.path}>
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className='cursor-pointer'>
                    {t(`tools.groups.${group.path}.name`)}
                    <ChevronDownIcon className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180' />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.tools.map((toolPath) => {
                        const tool = _TOOL_LIST.find((t) => t.path === toolPath);
                        if (!tool) return null;

                        const toolName = t(`tools.items.${tool.path}.name`);

                        return (
                          <SidebarMenuItem key={tool.path} className='py-1'>
                            <SidebarMenuButton asChild>
                              <Link href={`/tools/${group.path}/${tool.path}`}>
                                {tool.icon && (
                                  <Image
                                    width={24}
                                    height={24}
                                    src={`https://cdn.simpleicons.org/${tool.icon}`}
                                    alt={toolName}
                                    className='dark:invert'
                                  />
                                )}
                                <span>{toolName}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>
      <SidebarFooter>
        <div className='text-center'>&copy; {new Date().getFullYear()} - @holedev</div>
      </SidebarFooter>
    </Sidebar>
  );
};

export { AppSidebar };
