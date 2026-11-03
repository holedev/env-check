import Image from "next/image";
import { cn } from "@/lib/utils";

type ToolIconProps = {
  /** simpleicons.org slug, e.g. "mongodb" */
  icon: string;
  size: number;
  alt?: string;
  className?: string;
};

/**
 * Brand icon loaded straight from cdn.simpleicons.org. SVGs gain nothing from
 * the Image Optimization API, so it is bypassed (`unoptimized`): no
 * dangerouslyAllowSVG, no /_next/image round-trip, no optimizer quota.
 * The origin must stay in img-src (utils/csp.ts).
 */
const ToolIcon = ({ icon, size, alt = "", className }: ToolIconProps) => (
  <Image
    alt={alt}
    className={cn("dark:invert", className)}
    height={size}
    src={`https://cdn.simpleicons.org/${icon}`}
    unoptimized
    width={size}
  />
);

export { ToolIcon };
