import Link from "next/link";
import { useTranslations } from "next-intl";
import type React from "react";
import { _TOOL_LIST } from "@/constants/tool";
import type { ToolPath, ToolWithProgressType } from "@/types/tool";
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
    <div className='mb-4 space-y-1 text-center'>
      <h1 className='font-bold text-2xl'>{t(`tools.items.${toolPath}.name`)}</h1>
      <p className='text-muted-foreground text-sm'>{t(`tools.items.${toolPath}.description`)}</p>
      {tool.libInfo && (
        <p className='text-muted-foreground text-sm'>
          Library:{" "}
          <Link
            className='font-semibold'
            href={isFetchLib ? _DEFAULT_FETCH_URL : `${tool.libInfo.url}/v/${tool.libInfo.version}`}
            rel='noopener noreferrer'
            target='_blank'
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
