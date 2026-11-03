import { useTranslations } from "next-intl";
import { _TOOL_GROUP_LIST } from "@/constants/tool";
import { getGroupTools } from "@/lib/tool";
import type { ToolGroupCategory } from "@/types/tool";
import { ToolCard } from "./ToolCard";

type Props = {
  groupPath: ToolGroupCategory;
};

const ToolList = ({ groupPath }: Props) => {
  const t = useTranslations();

  const toolGroup = _TOOL_GROUP_LIST.find((group) => group.path === groupPath);

  if (!toolGroup) {
    throw new Error(`Tool group with path "${groupPath}" not found!`);
  }

  const tools = getGroupTools(toolGroup);

  return (
    <div className='mx-auto w-full max-w-7xl'>
      <h1 className='mb-2 font-bold text-2xl'>{t(`tools.groups.${groupPath}.name`)}</h1>
      <p className='mb-8 text-muted-foreground'>{t(`tools.groups.${groupPath}.description`)}</p>

      {tools.length === 0 ? (
        <p className='rounded-lg border border-dashed p-8 text-center text-muted-foreground'>
          {t("workspace.emptyGroup")}
        </p>
      ) : (
        <section className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {tools.map((tool) => (
            <ToolCard groupPath={toolGroup.path} key={tool.path} tool={tool} />
          ))}
        </section>
      )}
    </div>
  );
};

export { ToolList };
