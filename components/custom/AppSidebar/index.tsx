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
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

const AppSidebar = () => {
  const t = useTranslations();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className='flex items-center justify-center py-4'>
          <h1 className='scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-2xl uppercase'>
            {t("common.site.logoText")}
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {_TOOL_GROUP_LIST.map((group) => {
          return (
            <SidebarGroup key={group.path}>
              <SidebarGroupLabel>{t(group.nameKey)}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.tools.map((toolPath) => {
                    const tool = _TOOL_LIST.find((t) => t.path === toolPath);
                    if (!tool) return null;

                    return (
                      <SidebarMenuItem key={tool.path}>
                        <Link href={`/tools/${tool.path}`} passHref>
                          <SidebarMenuButton>
                            {tool.icon && (
                              <Image
                                width={24}
                                height={24}
                                src={`https://cdn.simpleicons.org/${tool.icon}`}
                                alt={tool.nameKey}
                              />
                            )}
                            <span>{t(tool.nameKey)}</span>
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter>
        <div className='text-center'>&copy; {new Date().getFullYear()} - @SPTeam</div>
      </SidebarFooter>
    </Sidebar>
  );
};

export { AppSidebar };
