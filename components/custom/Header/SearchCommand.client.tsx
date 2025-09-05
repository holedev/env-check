"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { _TOOL_GROUP_LIST, _TOOL_LIST } from "@/constants/tool";
import type { ToolPath, ToolWithProgressType } from "@/types/tool";
import { ToolProgress } from "../Tools/ToolProgress";

const SearchCommand = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const getToolGroup = useCallback((toolPath: ToolPath) => {
    return _TOOL_GROUP_LIST.find((group) => group.tools.includes(toolPath))?.path;
  }, []);

  const runCommand = useCallback(
    (path: ToolPath) => {
      setOpen(false);
      const groupPath = getToolGroup(path);
      if (groupPath) {
        router.push(`/tools/${groupPath}/${path}`);
      }
    },
    [router, getToolGroup]
  );

  return (
    <>
      <Button
        variant='outline'
        className='relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64'
        onClick={() => setOpen(true)}
      >
        <span className='hidden lg:inline-flex'>{t("common.search.placeholder")}</span>
        <span className='inline-flex lg:hidden'>{t("common.search.filter")}</span>
        <span className='pointer-events-none absolute top-1/2 right-1.5 transform -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex'>
          <span className='text-xs'>Ctrl + K</span>
        </span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={`${t("common.search.placeholder")} (${_TOOL_LIST.length})`} />
        <CommandList>
          <CommandEmpty>{t("common.search.empty")}</CommandEmpty>
          <CommandGroup>
            {[..._TOOL_LIST]
              .sort((a, b) => {
                const progressOrder = { completed: 0, inProgress: 1, notStarted: 2 };
                const aProgress = (a as ToolWithProgressType).progress || "notStarted";
                const bProgress = (b as ToolWithProgressType).progress || "notStarted";
                return progressOrder[aProgress] - progressOrder[bProgress];
              })
              .map((tool) => (
                <CommandItem
                  key={tool.path}
                  value={t(`tools.items.${tool.path}.name`)}
                  onSelect={() => runCommand(tool.path)}
                  className='flex items-center gap-2 justify-between'
                >
                  <div className='flex gap-2'>
                    <Image
                      src={`https://cdn.simpleicons.org/${tool.icon}`}
                      alt={tool.path}
                      width={18}
                      height={18}
                      className='dark:invert'
                    />
                    <span>{t(`tools.items.${tool.path}.name`)}</span>
                  </div>
                  <ToolProgress progress={(tool as ToolWithProgressType).progress || "notStarted"} />
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export { SearchCommand };
