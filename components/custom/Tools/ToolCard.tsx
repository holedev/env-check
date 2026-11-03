import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { ToolGroupCategory, ToolItem } from "@/types/tool";
import { ToolIcon } from "./ToolIcon";
import { ToolProgress } from "./ToolProgress";

type Props = {
  groupPath: ToolGroupCategory;
  tool: ToolItem;
};

const ToolCard = ({ groupPath, tool }: Props) => {
  const t = useTranslations();
  const toolName = t(`tools.items.${tool.path}.name`);

  return (
    <Card className='h-full transition-all hover:border-brand/50 hover:shadow-md'>
      <Link className='flex h-full flex-col' href={`/tools/${groupPath}/${tool.path}`}>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <ToolIcon className='rounded' icon={tool.icon} size={32} />
            <CardTitle>{toolName}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className='flex-1'>
          <CardDescription>{t(`tools.items.${tool.path}.description`)}</CardDescription>
        </CardContent>
        <CardFooter>
          <ToolProgress className='mt-4' progress={tool.progress || "notStarted"} />
        </CardFooter>
      </Link>
    </Card>
  );
};

export { ToolCard };
