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

  const _DEFAULT_FETCH_URL = "https://nodejs.org/en/learn/getting-started/fetch";
  const isFetchLib = tool.libInfo?.packageName === "fetch";

  return (
    <div className='mb-4 text-center space-y-1'>
      <h1 className='text-2xl font-bold'>{t(`tools.items.${toolPath}.name`)}</h1>
      <p className='text-sm text-muted-foreground'>{t(`tools.items.${toolPath}.description`)}</p>
      {tool.libInfo && (
        <p className='text-sm text-muted-foreground'>
          Library:{" "}
          <Link
            className='font-semibold'
            href={isFetchLib ? _DEFAULT_FETCH_URL : `${tool.libInfo.url}/v/${tool.libInfo.version}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            {isFetchLib ? tool.libInfo.packageName : `${tool.libInfo.packageName}@${tool.libInfo.version}`}
          </Link>
        </p>
      )}
      <ToolProgress progress={tool?.progress || "notStarted"} />
    </div>
  );
};

export { ToolHeader };
