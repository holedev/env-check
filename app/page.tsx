import Link from "next/link";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { _TOOL_GROUP_LIST } from "@/constants/tool";

export default function Home() {
  const t = useTranslations();

  return (
    <div className='space-y-2'>
      <div className='text-center space-y-2'>
        <h1 className='text-4xl font-bold'>{t("common.site.logoText")}</h1>
        <p className='text-muted-foreground'>{t("common.site.slogan")}</p>
      </div>

      <div className='flex flex-row flex-wrap'>
        {_TOOL_GROUP_LIST.map((group) => (
          <div key={group.path} className='w-1/3 p-2'>
            <Link key={group.path} href={`/tools/${group.path}`}>
              <Card className='h-full transition-all hover:shadow-md hover:bg-muted/50'>
                <CardHeader>
                  <div className='flex items-center gap-2'>
                    <CardTitle>{t(`tools.groups.${group.path}.name`)}</CardTitle>
                  </div>
                  <CardDescription>{t(`tools.groups.${group.path}.description`)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant='secondary'>
                    {group.tools.length} {group.tools.length === 1 ? "tool" : "tools"}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
