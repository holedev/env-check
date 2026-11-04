import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Monochrome wordmark: a check tile plus "env-check" in mono. */
const Logo = ({ className }: { className?: string }) => (
  <span className={cn("flex items-center gap-2.5 font-mono font-semibold text-[15px]", className)}>
    <span aria-hidden className='flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground'>
      <CheckIcon className='size-3.5' strokeWidth={3} />
    </span>
    env-check
  </span>
);

export { Logo };
