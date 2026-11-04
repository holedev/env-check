import { useTranslations } from "next-intl";
import type React from "react";
import { _TOOL_LIST } from "@/constants/tool";
import type { ToolItem, ToolPath } from "@/types/tool";
import { ToolIcon } from "./ToolIcon";
import { ToolProgress } from "./ToolProgress";

export type ToolHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  toolPath: ToolPath;
};

/** Compact header atop every tool page. The progress badge only shows while a tool is unfinished. */
const ToolHeader = ({ toolPath }: ToolHeaderProps) => {
  const t = useTranslations();
  const tool = _TOOL_LIST.find((item) => item.path === toolPath) as ToolItem;
  const name = t(`tools.items.${toolPath}.name`);
  const progress = tool.progress ?? "notStarted";

  return (
    <div className='mb-8 flex items-center gap-4'>
      <span className='flex size-14 shrink-0 items-center justify-center rounded-lg border bg-card'>
        <ToolIcon decorative icon={tool.icon} name={name} size={28} />
      </span>
      <div className='min-w-0 space-y-1'>
        <h1 className='font-semibold text-2xl tracking-tight'>{name}</h1>
        <p className='text-muted-foreground text-sm'>{t(`tools.items.${toolPath}.description`)}</p>
      </div>
      {progress !== "completed" && <ToolProgress className='ml-auto' progress={progress} />}
    </div>
  );
};

export { ToolHeader };
