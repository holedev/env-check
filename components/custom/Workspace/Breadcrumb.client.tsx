"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Mono path breadcrumb for the Workspace header: tools / payment / stripe. */
const Breadcrumb = () => {
  const segments = usePathname().split("/").filter(Boolean);

  return (
    <nav aria-label='Breadcrumb' className='hidden min-w-0 truncate font-mono text-muted-foreground text-xs sm:block'>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        return (
          <span key={href}>
            {index > 0 && <span aria-hidden> / </span>}
            {isLast ? (
              <span aria-current='page' className='text-foreground'>
                {segment}
              </span>
            ) : (
              <Link className='hover:text-foreground' href={href}>
                {segment}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export { Breadcrumb };
