import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { _TOOL_GROUP_LIST, _TOOL_LIST } from "@/constants/tool";
import type { ToolGroupCategory, ToolWithProgressType } from "@/types/tool";
import { ToolProgress } from "./ToolProgress";

type Props = {
  groupPath: ToolGroupCategory;
};

const ToolList = ({ groupPath }: Props) => {
  const t = useTranslations();

  const toolGroup = _TOOL_GROUP_LIST.find((group) => group.path === groupPath);

  if (!toolGroup) {
    throw new Error(`Tool group with path "${groupPath}" not found!`);
  }

  return (
    <div className='flex h-full w-full flex-col items-center justify-center'>
      <h1 className='mb-2 font-bold text-2xl'>{t(`tools.groups.${groupPath}.name`)}</h1>
      <p className='mb-8 text-md'>{t(`tools.groups.${groupPath}.description`)}</p>

      <section className='grid w-full max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {toolGroup.tools.map((tool) => {
          const toolItem = _TOOL_LIST.find((t) => t.path === tool) as ToolWithProgressType;
          if (!toolItem) {
            return null;
          }

          const toolName = t(`tools.items.${tool}.name`);
          const toolDesc = t(`tools.items.${tool}.description`);

          return (
            <Card key={toolItem.path}>
              <Link href={`/tools/${toolGroup.path}/${toolItem.path}`}>
                <CardHeader>
                  <div className='flex items-center gap-3'>
                    {toolItem.icon && (
                      <Image
                        alt={toolName}
                        className='rounded dark:invert'
                        height={32}
                        src={`https://cdn.simpleicons.org/${toolItem.icon}`}
                        width={32}
                      />
                    )}
                    <CardTitle>{toolName}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{toolDesc}</CardDescription>
                </CardContent>
                <CardFooter>
                  <ToolProgress className='mt-4' progress={toolItem?.progress || "notStarted"} />
                </CardFooter>
              </Link>
            </Card>
          );
        })}
      </section>
    </div>
  );
};

export { ToolList };
