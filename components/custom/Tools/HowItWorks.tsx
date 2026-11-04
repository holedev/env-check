import { useTranslations } from "next-intl";
import { _TOOL_LIST } from "@/constants/tool";
import type { ToolPath } from "@/types/tool";

type HowItWorksProps = { toolPath: ToolPath };

/**
 * "How it is checked": the Tool's Probe, what the Validation summary may show
 * (its summary labels) and what it never returns. Shown before the user pastes
 * anything, so they know what will happen to their credential.
 */
const HowItWorks = ({ toolPath }: HowItWorksProps) => {
  const t = useTranslations();
  const key = (suffix: string) => `tools.items.${toolPath}.${suffix}` as Parameters<typeof t>[0];
  const probe = _TOOL_LIST.find((item) => item.path === toolPath)?.probe;
  const shows = t.has(key("summary")) ? Object.values(t.raw(key("summary")) as Record<string, string>) : [];
  const never = t.has(key("never")) ? (t.raw(key("never")) as string[]) : [];
  const note = t.has(key("probeNote")) ? t(key("probeNote")) : null;

  return (
    <section aria-labelledby='how-it-works' className='space-y-5 rounded-lg border p-6'>
      <h2 className='font-medium font-mono text-muted-foreground text-xs uppercase tracking-wider' id='how-it-works'>
        {t("workspace.howItWorks.title")}
      </h2>

      {probe && (
        <div className='space-y-2'>
          <p className='text-muted-foreground text-sm'>{t("workspace.howItWorks.probe")}</p>
          <code className='wrap-anywhere flex flex-wrap items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm'>
            <span className='rounded bg-raised px-1.5 py-0.5 font-medium text-xs'>{probe.method}</span>
            {probe.target}
          </code>
          {note && <p className='text-muted-foreground text-sm'>{note}</p>}
        </div>
      )}

      {shows.length > 0 && (
        <div className='space-y-2'>
          <p className='text-muted-foreground text-sm'>{t("workspace.howItWorks.shows")}</p>
          <ul className='space-y-1 text-sm'>
            {shows.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </div>
      )}

      <div className='space-y-2'>
        <p className='text-muted-foreground text-sm'>{t("workspace.howItWorks.never")}</p>
        <ul className='space-y-1 text-muted-foreground text-sm'>
          <li>{t("workspace.howItWorks.credential")}</li>
          {never.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <p className='border-t pt-4 text-muted-foreground text-xs'>{t("workspace.howItWorks.footer")}</p>
    </section>
  );
};

export { HowItWorks };
