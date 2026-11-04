import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ToolGroupCategory, ToolItem } from "@/types/tool";
import { ToolIcon } from "./ToolIcon";
import { ToolProgress } from "./ToolProgress";

type Props = {
  groupPath: ToolGroupCategory;
  tool: ToolItem;
};

/** One row in a tool list: icon, name and the tool's Probe. */
const ToolCard = ({ groupPath, tool }: Props) => {
  const t = useTranslations();
  const toolName = t(`tools.items.${tool.path}.name`);
  const progress = tool.progress ?? "notStarted";

  return (
    <Link
      className='group flex min-h-16 items-center gap-3 rounded-lg border bg-card px-3 py-2.5 transition-colors hover:border-foreground/25 hover:bg-accent'
      href={`/tools/${groupPath}/${tool.path}`}
    >
      <span className='flex size-9 shrink-0 items-center justify-center rounded-md border bg-background'>
        <ToolIcon decorative icon={tool.icon} name={toolName} size={18} />
      </span>
      <span className='flex min-w-0 flex-col'>
        <span className='font-medium text-sm'>{toolName}</span>
        <span className='truncate font-mono text-muted-foreground text-xs'>
          {tool.probe.method} {tool.probe.target}
        </span>
      </span>
      {progress !== "completed" && <ToolProgress className='ml-auto shrink-0' progress={progress} />}
    </Link>
  );
};

export { ToolCard };
