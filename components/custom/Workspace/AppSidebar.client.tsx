"use client";

import { ChevronRightIcon, LayoutGridIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ToolIcon } from "@/components/custom/Tools/ToolIcon";
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
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar";
import { _TOOL_GROUP_LIST, _TOOL_LIST } from "@/constants/tool";
import { getGroupTools } from "@/lib/tool";

const AppSidebar = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  // On mobile the sidebar is a Sheet: close it once the user picks a page.
  const closeOnMobile = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Link className='flex items-center gap-2 px-2 py-3' href='/' onClick={closeOnMobile}>
          <span className='size-2.5 rounded-full bg-brand' />
          <span className='font-extrabold text-lg uppercase tracking-tight'>{t("common.site.logoText")}</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/tools"}>
                <Link href='/tools' onClick={closeOnMobile}>
                  <LayoutGridIcon />
                  <span>{t("workspace.sidebar.allTools")}</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuBadge>{_TOOL_LIST.length}</SidebarMenuBadge>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{t("workspace.sidebar.groups")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {_TOOL_GROUP_LIST.map((group) => {
                const groupHref = `/tools/${group.path}`;
                const isGroupActive = pathname === groupHref;
                const isInGroup = pathname.startsWith(`${groupHref}/`) || isGroupActive;
                const groupName = t(`tools.groups.${group.path}.name`);

                if (group.tools.length === 0) {
                  return (
                    <SidebarMenuItem key={group.path}>
                      <SidebarMenuButton asChild isActive={isGroupActive}>
                        <Link href={groupHref} onClick={closeOnMobile}>
                          <span>{groupName}</span>
                        </Link>
                      </SidebarMenuButton>
                      <SidebarMenuBadge>0</SidebarMenuBadge>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <Collapsible asChild defaultOpen={isInGroup} key={group.path}>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={isGroupActive}>
                        <Link href={groupHref} onClick={closeOnMobile}>
                          <span>{groupName}</span>
                        </Link>
                      </SidebarMenuButton>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuAction
                          aria-label={t("workspace.sidebar.toggleGroup", { group: groupName })}
                          className='data-[state=open]:rotate-90'
                        >
                          <ChevronRightIcon />
                        </SidebarMenuAction>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {getGroupTools(group).map((tool) => {
                            const toolHref = `${groupHref}/${tool.path}`;
                            const toolName = t(`tools.items.${tool.path}.name`);

                            return (
                              <SidebarMenuSubItem key={tool.path}>
                                <SidebarMenuSubButton asChild isActive={pathname === toolHref}>
                                  <Link href={toolHref} onClick={closeOnMobile}>
                                    <ToolIcon decorative icon={tool.icon} name={toolName} size={16} />
                                    <span>{toolName}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <p className='px-2 text-muted-foreground text-xs'>
          &copy; {new Date().getFullYear()} ·{" "}
          <a
            className='hover:text-foreground'
            href='https://github.com/holedev/env-check'
            rel='noopener noreferrer'
            target='_blank'
          >
            holedev/env-check
          </a>
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export { AppSidebar };
