"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ToolIconProps = {
  /** simpleicons.org slug, e.g. "mongodb". Omit for brands simpleicons doesn't carry. */
  icon?: string;
  /** Display name: the letter tile's initial and the image's accessible name. */
  name: string;
  size: number;
  /** Pass when the name is already shown as text next to the icon. */
  decorative?: boolean;
  className?: string;
};

/**
 * Brand icon loaded straight from cdn.simpleicons.org. SVGs gain nothing from
 * the Image Optimization API, so it is bypassed (`unoptimized`). The origin must
 * stay in img-src (utils/csp.ts). Falls back to a letter tile when the tool has
 * no slug or the CDN request fails.
 */
const ToolIcon = ({ icon, name, size, decorative = false, className }: ToolIconProps) => {
  const [failed, setFailed] = useState(false);

  if (!icon || failed) {
    const tileClass = cn(
      "inline-flex shrink-0 select-none items-center justify-center rounded-md bg-muted font-semibold text-muted-foreground uppercase",
      className
    );
    const tileStyle = { width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.5)) };
    const initial = name.trim().charAt(0);

    return decorative ? (
      <span aria-hidden className={tileClass} style={tileStyle}>
        {initial}
      </span>
    ) : (
      <span aria-label={name} className={tileClass} role='img' style={tileStyle}>
        {initial}
      </span>
    );
  }

  return (
    <Image
      alt={decorative ? "" : name}
      className={cn("dark:invert", className)}
      height={size}
      onError={() => setFailed(true)}
      src={`https://cdn.simpleicons.org/${icon}`}
      unoptimized
      width={size}
    />
  );
};

export { ToolIcon };
