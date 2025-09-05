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
    <div className='flex flex-col items-center justify-center w-full h-full'>
      <h1 className='text-2xl font-bold mb-2'>{t(`tools.groups.${groupPath}.name`)}</h1>
      <p className='text-md mb-8'>{t(`tools.groups.${groupPath}.description`)}</p>

      <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl'>
        {toolGroup.tools.map((tool) => {
          const toolItem = _TOOL_LIST.find((t) => t.path === tool) as ToolWithProgressType;
          if (!toolItem) return null;

          const toolName = t(`tools.items.${tool}.name`);
          const toolDesc = t(`tools.items.${tool}.description`);

          return (
            <Card key={toolItem.path}>
              <Link href={`/tools/${toolGroup.path}/${toolItem.path}`}>
                <CardHeader>
                  <div className='flex items-center gap-3'>
                    {toolItem.icon && (
                      <Image
                        width={32}
                        height={32}
                        src={`https://cdn.simpleicons.org/${toolItem.icon}`}
                        alt={toolName}
                        className='rounded dark:invert'
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
