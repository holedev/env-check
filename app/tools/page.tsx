import Link from "next/link";
import { useTranslations } from "next-intl";
import { ToolCard } from "@/components/custom/Tools/ToolCard";
import { _TOOL_GROUP_LIST, _TOOL_LIST } from "@/constants/tool";
import { getGroupTools } from "@/lib/tool";

export default function Page() {
  const t = useTranslations();

  return (
    <div className='space-y-10'>
      <div className='space-y-2'>
        <h1 className='font-semibold text-3xl tracking-tight'>{t("workspace.overview.title")}</h1>
        <p className='text-muted-foreground'>{t("workspace.overview.description", { count: _TOOL_LIST.length })}</p>
      </div>

      {_TOOL_GROUP_LIST.map((group) => {
        const tools = getGroupTools(group);

        if (tools.length === 0) {
          return null;
        }

        return (
          <section aria-labelledby={`group-${group.path}`} className='space-y-3' key={group.path}>
            <div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b pb-2'>
              <h2 className='font-semibold text-base' id={`group-${group.path}`}>
                {t(`tools.groups.${group.path}.name`)}{" "}
                <span className='font-mono font-normal text-muted-foreground text-sm'>· {tools.length}</span>
              </h2>
              <span className='flex items-baseline gap-4 text-muted-foreground text-sm'>
                <span className='hidden sm:inline'>{t(`tools.groups.${group.path}.description`)}</span>
                <Link className='shrink-0 hover:text-foreground' href={`/tools/${group.path}`}>
                  {t("workspace.overview.viewGroup")}
                </Link>
              </span>
            </div>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'>
              {tools.map((tool) => (
                <ToolCard groupPath={group.path} key={tool.path} tool={tool} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
