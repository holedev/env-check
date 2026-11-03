import type { ReactNode } from "react";
import { LandingFooter } from "@/components/custom/Landing/LandingFooter";
import { LandingHeader } from "@/components/custom/Landing/LandingHeader";

type LandingLayoutProps = { children: ReactNode };

export default function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className='flex min-h-svh flex-col'>
      <LandingHeader />
      <main className='flex-1'>{children}</main>
      <LandingFooter />
    </div>
  );
}
