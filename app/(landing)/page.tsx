import { ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { SearchCommand } from "@/components/custom/Header/SearchCommand.client";
import { ToolIcon } from "@/components/custom/Tools/ToolIcon";
import { Button } from "@/components/ui/button";
import { _REPO_URL } from "@/constants/site";
import { _TOOL_GROUP_LIST, _TOOL_LIST } from "@/constants/tool";
import type { ToolItem } from "@/types/tool";

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
      siteName: "env-check",
      title,
      description,
      locale: locale === "vi" ? "vi_VN" : "en_US"
    },
    twitter: { card: "summary", title, description }
  };
}

/** probe.log lines, staggered by CSS (.probe-line); `tone` picks the outcome colour. */
const _TERMINAL = [
  { text: "$ env-check stripe", tone: "muted" },
  { text: "→ GET api.stripe.com/v1/balance", tone: "plain" },
  { key: "valid", tone: "ok" },
  { text: "$ env-check slack", tone: "muted" },
  { text: "→ POST slack.com/api/auth.test", tone: "plain" },
  { key: "restricted", tone: "warn" },
  { text: "$ env-check redis", tone: "muted" },
  { text: "→ redis://127.0.0.1:6379", tone: "plain" },
  { key: "blocked", tone: "bad" }
] as const;

const _TONE_CLASS = {
  muted: "text-muted-foreground",
  plain: "",
  ok: "text-ok",
  warn: "text-warn",
  bad: "text-bad"
} as const;

const _PILLARS = [
  { key: "probe", code: "GET api.stripe.com/v1/balance" },
  { key: "redact", code: "Incorrect API key provided: ***" },
  { key: "guard", code: "127.0.0.1 · 10.0.0.0/8 · 169.254.169.254" }
] as const;

const _STEPS = ["pick", "paste", "result"] as const;

const _DOTENV_EXAMPLE = `OPENAI_API_KEY=sk-proj-••••••••
STRIPE_SECRET_KEY=sk_test_••••••••
DATABASE_URL=postgresql://app:••••@db/app
SLACK_BOT_TOKEN=xoxb-••••••••`;

export default function Page() {
  const t = useTranslations();
  const tools = _TOOL_LIST as readonly ToolItem[];
  const groupCount = _TOOL_GROUP_LIST.filter((group) => group.tools.length > 0).length;

  return (
    <>
      {/* Hero */}
      <section className='mx-auto grid max-w-6xl items-center gap-14 px-4 pt-20 pb-16 md:pt-28 lg:grid-cols-2'>
        <div className='flex flex-col gap-6'>
          <span className='inline-flex items-center gap-2 self-start rounded-full border px-3 py-1.5 font-mono text-muted-foreground text-xs'>
            <span aria-hidden className='size-1.5 rounded-full bg-ok' />
            {t("landing.hero.badge", { count: tools.length })}
          </span>
          <h1 className='text-balance font-semibold text-5xl leading-[1.05] tracking-tight sm:text-6xl'>
            {t("landing.hero.title")}
          </h1>
          <p className='max-w-xl text-pretty text-lg text-muted-foreground leading-relaxed'>
            {t("landing.hero.description")}
          </p>
          <div className='max-w-xl'>
            <SearchCommand heroHint={t("landing.hero.searchHint")} variant='hero' />
          </div>
          <div className='flex flex-wrap gap-3'>
            <Button asChild size='lg'>
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

        <figure aria-label={t("landing.terminal.title")} className='overflow-hidden rounded-lg border bg-card'>
          <div className='flex items-center gap-2 border-b px-4 py-3'>
            <span aria-hidden className='size-2.5 rounded-full border' />
            <span aria-hidden className='size-2.5 rounded-full border' />
            <span aria-hidden className='size-2.5 rounded-full border' />
            <span className='ml-2 font-mono text-muted-foreground text-xs'>{t("landing.terminal.title")}</span>
          </div>
          <div className='flex flex-col px-5 pt-5 pb-6 font-mono text-sm leading-8'>
            {_TERMINAL.map((line, index) => (
              <div
                className={`probe-line ${_TONE_CLASS[line.tone]}`}
                key={"key" in line ? line.key : line.text}
                style={{ animationDelay: `${index * 0.6}s` }}
              >
                {"key" in line ? t(`landing.terminal.${line.key}`) : line.text}
              </div>
            ))}
            <div className='probe-line text-muted-foreground' style={{ animationDelay: `${_TERMINAL.length * 0.6}s` }}>
              $ <span aria-hidden className='probe-caret inline-block h-4 w-2 bg-foreground align-[-2px]' />
            </div>
          </div>
        </figure>
      </section>

      {/* Services */}
      <section aria-labelledby='services' className='border-y bg-card'>
        <div className='mx-auto flex max-w-6xl flex-col gap-5 px-4 py-10'>
          <h2 className='font-mono text-muted-foreground text-xs uppercase tracking-wider' id='services'>
            {t("landing.services.title", { count: tools.length, groups: groupCount })}
          </h2>
          <ul className='flex flex-wrap gap-2'>
            {tools.map((tool) => {
              const name = t(`tools.items.${tool.path}.name`);
              return (
                <li
                  className='inline-flex items-center gap-2 rounded-md border bg-background py-1.5 pr-3 pl-2 text-sm'
                  key={tool.path}
                >
                  <ToolIcon decorative icon={tool.icon} name={name} size={16} />
                  {name}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Security */}
      <section aria-labelledby='security' className='mx-auto flex max-w-6xl flex-col gap-10 px-4 py-24'>
        <div className='flex max-w-2xl flex-col gap-3'>
          <h2 className='font-semibold text-4xl tracking-tight' id='security'>
            {t("landing.security.title")}
          </h2>
          <p className='text-lg text-muted-foreground leading-relaxed'>{t("landing.security.description")}</p>
        </div>
        <div className='grid gap-4 md:grid-cols-3'>
          {_PILLARS.map(({ key, code }) => (
            <article className='flex flex-col gap-3 rounded-lg border bg-card p-6' key={key}>
              <span className='font-mono text-muted-foreground text-xs'>{t(`landing.security.${key}.tag`)}</span>
              <h3 className='font-semibold text-lg'>{t(`landing.security.${key}.title`)}</h3>
              <p className='text-muted-foreground text-sm leading-relaxed'>{t(`landing.security.${key}.body`)}</p>
              <code className='wrap-anywhere mt-auto rounded-md border bg-background px-3 py-2 text-[13px]'>
                {code}
              </code>
            </article>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section aria-labelledby='steps' className='border-t'>
        <div className='mx-auto grid max-w-6xl gap-8 px-4 py-20 md:grid-cols-4'>
          <h2 className='font-semibold text-2xl tracking-tight' id='steps'>
            {t("landing.steps.title")}
          </h2>
          {_STEPS.map((step, index) => (
            <div className='flex flex-col gap-2' key={step}>
              <span className='font-mono text-muted-foreground text-sm'>{String(index + 1).padStart(2, "0")}</span>
              <h3 className='font-semibold'>{t(`landing.steps.${step}.title`)}</h3>
              <p className='text-muted-foreground text-sm leading-relaxed'>{t(`landing.steps.${step}.description`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* .env, coming soon */}
      <section aria-labelledby='dotenv' className='mx-auto max-w-6xl px-4 pb-24'>
        <div className='grid items-center gap-8 rounded-lg border border-dashed p-8 md:grid-cols-2'>
          <div className='flex flex-col gap-3'>
            <span className='self-start rounded-full border px-2.5 py-1 font-mono text-muted-foreground text-xs'>
              {t("landing.dotenv.badge")}
            </span>
            <h2 className='font-semibold text-2xl' id='dotenv'>
              {t("landing.dotenv.title")}
            </h2>
            <p className='text-muted-foreground leading-relaxed'>{t("landing.dotenv.description")}</p>
          </div>
          <pre className='overflow-x-auto rounded-md border bg-card p-4 text-[13px] text-muted-foreground leading-7'>
            {_DOTENV_EXAMPLE}
          </pre>
        </div>
      </section>
    </>
  );
}
