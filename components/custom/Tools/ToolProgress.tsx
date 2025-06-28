import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ToolProgressCategory } from "@/types/tool";
import { useTranslations } from "next-intl";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  progress: ToolProgressCategory;
};

const ToolProgress = ({ progress, ...rest }: Props) => {
  const t = useTranslations("tools.progress");

  let variant = "destructive";
  if (progress === "inProgress") variant = "secondary";
  else if (progress === "completed") variant = "outline";

  return (
    <Badge
      className={cn(
        {
          "bg-red-500 text-white": progress === "notStarted",
          "bg-yellow-500 text-white": progress === "inProgress",
          "bg-green-500 text-white": progress === "completed"
        },
        rest.className
      )}
      color={variant}
    >
      {t(`${progress}`)}
    </Badge>
  );
};

export { ToolProgress };
