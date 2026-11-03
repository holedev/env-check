import Link from "next/link";
import { useTranslations } from "next-intl";
import { ToolCard } from "@/components/custom/Tools/ToolCard";
import { _TOOL_GROUP_LIST, _TOOL_LIST } from "@/constants/tool";
import { getGroupTools } from "@/lib/tool";

export default function Page() {
  const t = useTranslations();

  return (
    <div className='mx-auto w-full max-w-7xl space-y-10'>
      <div className='space-y-2'>
        <h1 className='font-bold text-3xl'>{t("workspace.overview.title")}</h1>
        <p className='text-muted-foreground'>{t("workspace.overview.description", { count: _TOOL_LIST.length })}</p>
      </div>

      {_TOOL_GROUP_LIST.map((group) => {
        const tools = getGroupTools(group);

        if (tools.length === 0) {
          return null;
        }

        return (
          <section aria-labelledby={`group-${group.path}`} className='space-y-4' key={group.path}>
            <div className='flex items-baseline justify-between gap-4'>
              <div>
                <h2 className='font-semibold text-xl' id={`group-${group.path}`}>
                  {t(`tools.groups.${group.path}.name`)}
                </h2>
                <p className='text-muted-foreground text-sm'>{t(`tools.groups.${group.path}.description`)}</p>
              </div>
              <Link className='shrink-0 text-brand text-sm hover:underline' href={`/tools/${group.path}`}>
                {t("workspace.overview.viewGroup")}
              </Link>
            </div>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
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
