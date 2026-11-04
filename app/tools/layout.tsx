import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { AppSidebar } from "@/components/custom/Workspace/AppSidebar.client";
import { WorkspaceHeader } from "@/components/custom/Workspace/WorkspaceHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type WorkspaceLayoutProps = { children: ReactNode };

export default async function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  // Same cookie the sidebar writes when toggled, so the state survives reloads.
  const sidebarState = (await cookies()).get("sidebar_state")?.value;

  return (
    <SidebarProvider defaultOpen={sidebarState !== "false"}>
      <AppSidebar />
      <SidebarInset>
        <WorkspaceHeader />
        <div className='mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
