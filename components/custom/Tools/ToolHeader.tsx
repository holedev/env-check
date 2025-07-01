import { _TOOL_LIST } from "@/constants/tool";
import type { ToolPath, ToolWithProgressType } from "@/types/tool";
import { useTranslations } from "next-intl";
import Link from "next/link";
import type React from "react";
import { ToolProgress } from "./ToolProgress";

export type ToolHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  toolPath: ToolPath;
};

const ToolHeader = ({ toolPath }: ToolHeaderProps) => {
  const t = useTranslations();
  const tool = _TOOL_LIST.find((item) => item.path === toolPath) as ToolWithProgressType;

  return (
    <div className='mb-4 text-center space-y-1'>
      <h1 className='text-2xl font-bold'>{t(`tools.items.${toolPath}.name`)}</h1>
      <p className='text-sm text-muted-foreground'>{t(`tools.items.${toolPath}.description`)}</p>
      {tool.libInfo && (
        <p className='text-sm text-muted-foreground'>
          Library:{" "}
          <Link
            className='font-semibold'
            href={`${tool.libInfo.url}/v/${tool.libInfo.version}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            {tool.libInfo.packageName}@{tool.libInfo.version}
          </Link>
        </p>
      )}
      <ToolProgress progress={tool?.progress || "notStarted"} />
    </div>
  );
};

export { ToolHeader };
