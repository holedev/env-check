import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ClipboardPasteIcon,
  CodeIcon,
  DatabaseIcon,
  ListChecksIcon,
  MousePointerClickIcon,
  ServerIcon,
  XCircleIcon
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { _LOCALES } from "@/constants/lang";
import { _REPO_URL } from "@/constants/site";
import { _TOOL_GROUP_LIST, _TOOL_LIST } from "@/constants/tool";
import type { ToolPath } from "@/types/tool";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("landing.meta");
  const locale = await getLocale();
  const title = t("title");
  const description = t("description");

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: "/",
      siteName: "ENV Check",
      title,
      description,
      locale: locale === "vi" ? "vi_VN" : "en_US"
    },
    twitter: { card: "summary", title, description }
  };
}

const _PREVIEW_ROWS: { tool: ToolPath; icon: string; valid: boolean }[] = [
  { tool: "github", icon: "github", valid: true },
  { tool: "postgresql", icon: "postgresql", valid: true },
  { tool: "cloudflare", icon: "cloudflare", valid: false }
];

const _SECURITY_POINTS = [
  { key: "serverAction", Icon: ServerIcon },
  { key: "noStorage", Icon: DatabaseIcon },
  { key: "openSource", Icon: CodeIcon }
] as const;

const _STEPS = [
  { key: "pick", Icon: MousePointerClickIcon },
  { key: "paste", Icon: ClipboardPasteIcon },
  { key: "result", Icon: ListChecksIcon }
] as const;

export default function Page() {
  const t = useTranslations();
  const groups = _TOOL_GROUP_LIST.filter((group) => group.tools.length > 0);

  return (
    <>
      {/* Hero */}
      <section className='relative overflow-hidden border-b'>
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0'
          style={{
            backgroundImage:
              "radial-gradient(60% 50% at 50% 0%, color-mix(in oklch, var(--brand) 18%, transparent), transparent)"
          }}
        />
        <div className='relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-2'>
          <div className='space-y-6 text-center lg:text-left'>
            <Badge className='border-brand/30 bg-brand/10 text-brand' variant='outline'>
              {t("landing.hero.badge")}
            </Badge>
            <h1 className='text-balance font-extrabold text-4xl tracking-tight sm:text-5xl'>
              {t("landing.hero.title")}
            </h1>
            <p className='mx-auto max-w-xl text-pretty text-lg text-muted-foreground lg:mx-0'>
              {t("landing.hero.description")}
            </p>
            <div className='flex flex-col justify-center gap-3 sm:flex-row lg:justify-start'>
              <Button asChild className='bg-brand text-brand-foreground hover:bg-brand/90' size='lg'>
                <Link href='/tools'>
                  {t("landing.hero.primary")}
                  <ArrowRightIcon />
                </Link>
              </Button>
              <Button asChild size='lg' variant='outline'>
                <a href={_REPO_URL} rel='noopener noreferrer' target='_blank'>
                  {t("landing.hero.secondary")}
                </a>
              </Button>
            </div>
          </div>

          <Card aria-hidden className='mx-auto w-full max-w-md shadow-lg'>
            <CardHeader className='border-b'>
              <div className='flex items-center gap-1.5'>
                <span className='size-2.5 rounded-full bg-red-400' />
                <span className='size-2.5 rounded-full bg-yellow-400' />
                <span className='size-2.5 rounded-full bg-green-400' />
                <span className='ml-2 text-muted-foreground text-xs'>{t("landing.preview.title")}</span>
              </div>
            </CardHeader>
            <CardContent className='space-y-3 pt-2'>
              {_PREVIEW_ROWS.map(({ tool, icon, valid }) => (
                <div className='flex items-center justify-between rounded-lg border px-3 py-2.5' key={tool}>
                  <div className='flex items-center gap-3'>
                    <Image
                      alt=''
                      className='dark:invert'
                      height={20}
                      src={`https://cdn.simpleicons.org/${icon}`}
                      width={20}
                    />
                    <span className='font-medium text-sm'>{t(`tools.items.${tool}.name`)}</span>
                    <span className='font-mono text-muted-foreground text-xs'>••••••••</span>
                  </div>
                  {valid ? (
                    <span className='flex items-center gap-1 font-medium text-brand text-xs'>
                      <CheckCircle2Icon className='size-4' />
                      {t("landing.preview.valid")}
                    </span>
                  ) : (
                    <span className='flex items-center gap-1 font-medium text-destructive text-xs'>
                      <XCircleIcon className='size-4' />
                      {t("landing.preview.invalid")}
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <dl className='relative mx-auto grid max-w-6xl grid-cols-3 gap-4 px-4 pb-12 text-center'>
          {[
            { value: _TOOL_LIST.length, label: t("landing.stats.tools") },
            { value: groups.length, label: t("landing.stats.groups") },
            { value: _LOCALES.length, label: t("landing.stats.locales") }
          ].map(({ value, label }) => (
            <div key={label}>
              <dt className='sr-only'>{label}</dt>
              <dd className='font-bold text-3xl'>{value}</dd>
              <dd className='text-muted-foreground text-sm'>{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Security */}
      <section className='mx-auto max-w-6xl space-y-10 px-4 py-16 md:py-20'>
        <div className='mx-auto max-w-2xl space-y-3 text-center'>
          <h2 className='font-bold text-3xl tracking-tight'>{t("landing.security.title")}</h2>
          <p className='text-muted-foreground'>{t("landing.security.description")}</p>
        </div>
        <div className='grid gap-6 md:grid-cols-3'>
          {_SECURITY_POINTS.map(({ key, Icon }) => (
            <Card key={key}>
              <CardHeader className='space-y-3'>
                <span className='flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand'>
                  <Icon className='size-5' />
                </span>
                <CardTitle>{t(`landing.security.${key}.title`)}</CardTitle>
                <CardDescription className='leading-relaxed'>
                  {t(`landing.security.${key}.description`)}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className='border-y bg-muted/40'>
        <div className='mx-auto max-w-6xl space-y-10 px-4 py-16 md:py-20'>
          <h2 className='text-center font-bold text-3xl tracking-tight'>{t("landing.steps.title")}</h2>
          <ol className='grid gap-8 md:grid-cols-3'>
            {_STEPS.map(({ key, Icon }, index) => (
              <li className='flex gap-4' key={key}>
                <span className='flex size-10 shrink-0 items-center justify-center rounded-full border bg-background font-semibold'>
                  {index + 1}
                </span>
                <div className='space-y-1'>
                  <h3 className='flex items-center gap-2 font-semibold'>
                    <Icon className='size-4 text-brand' />
                    {t(`landing.steps.${key}.title`)}
                  </h3>
                  <p className='text-muted-foreground text-sm'>{t(`landing.steps.${key}.description`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Tool groups */}
      <section className='mx-auto max-w-6xl space-y-10 px-4 py-16 md:py-20'>
        <div className='mx-auto max-w-2xl space-y-3 text-center'>
          <h2 className='font-bold text-3xl tracking-tight'>{t("landing.groups.title")}</h2>
          <p className='text-muted-foreground'>{t("landing.groups.description")}</p>
        </div>
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {groups.map((group) => (
            <Link className='group' href={`/tools/${group.path}`} key={group.path}>
              <Card className='h-full transition-all group-hover:border-brand/50 group-hover:shadow-md'>
                <CardHeader>
                  <CardTitle className='flex items-center justify-between gap-2'>
                    {t(`tools.groups.${group.path}.name`)}
                    <ArrowRightIcon className='size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand' />
                  </CardTitle>
                  <CardDescription>{t(`tools.groups.${group.path}.description`)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant='secondary'>{t("landing.groups.count", { count: group.tools.length })}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className='mx-auto max-w-6xl px-4 pb-20'>
        <div className='flex flex-col items-center gap-4 rounded-2xl border bg-brand/5 px-6 py-12 text-center'>
          <h2 className='font-bold text-2xl tracking-tight sm:text-3xl'>{t("landing.cta.title")}</h2>
          <p className='text-muted-foreground'>{t("landing.cta.description")}</p>
          <Button asChild className='bg-brand text-brand-foreground hover:bg-brand/90' size='lg'>
            <Link href='/tools'>
              {t("landing.cta.button")}
              <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
