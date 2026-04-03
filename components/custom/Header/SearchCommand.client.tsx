"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
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
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();
  const t = useTranslations();

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

  const sortedTools = useMemo(() => {
    return [..._TOOL_LIST].sort((a, b) => {
      const progressOrder = { completed: 0, inProgress: 1, notStarted: 2 };
      const aProgress = (a as ToolWithProgressType).progress || "notStarted";
      const bProgress = (b as ToolWithProgressType).progress || "notStarted";
      return progressOrder[aProgress] - progressOrder[bProgress];
    });
  }, []);

  const filteredTools = useMemo(() => {
    if (!searchValue.trim()) {
      return sortedTools;
    }

    const query = searchValue.toLowerCase();
    return sortedTools.filter((tool) => {
      const toolName = t(`tools.items.${tool.path}.name`).toLowerCase();
      return toolName.includes(query);
    });
  }, [sortedTools, searchValue, t]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }

      if (open && (e.metaKey || e.ctrlKey) && !Number.isNaN(Number(e.key)) && e.key !== "0") {
        e.preventDefault();
        const index = Number.parseInt(e.key, 10) - 1;

        if (index >= 0 && index < filteredTools.length && index < 9) {
          runCommand(filteredTools[index].path);
        }
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, runCommand, filteredTools]);

  useEffect(() => {
    if (!open) {
      setSearchValue("");
    }
  }, [open]);

  return (
    <>
      <Button
        className='relative w-full justify-start text-muted-foreground text-sm sm:pr-12 md:w-40 lg:w-64'
        onClick={() => setOpen(true)}
        variant='outline'
      >
        <span className='hidden lg:inline-flex'>{t("common.search.placeholder")}</span>
        <span className='inline-flex lg:hidden'>{t("common.search.filter")}</span>
        <span className='pointer-events-none absolute top-1/2 right-1.5 hidden h-5 -translate-y-1/2 transform select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-[10px] opacity-100 sm:flex'>
          <span className='text-xs'>Ctrl + K</span>
        </span>
      </Button>
      <CommandDialog onOpenChange={setOpen} open={open}>
        <Command shouldFilter={false}>
          <CommandInput
            onValueChange={setSearchValue}
            placeholder={`${t("common.search.placeholder")} (${_TOOL_LIST.length}) • Ctrl + 1-9`}
            value={searchValue}
          />
          <CommandList>
            <CommandEmpty>{t("common.search.empty")}</CommandEmpty>
            <CommandGroup>
              {filteredTools.map((tool, index) => (
                <CommandItem
                  className='flex items-center justify-between gap-2'
                  key={tool.path}
                  onSelect={() => runCommand(tool.path)}
                  value={t(`tools.items.${tool.path}.name`)}
                >
                  <div className='flex items-center gap-2'>
                    {index < 9 && (
                      <span className='min-w-[16px] rounded bg-muted px-1 py-0.5 text-center font-mono text-[10px] text-muted-foreground text-xs'>
                        {index + 1}
                      </span>
                    )}
                    <Image
                      alt={tool.path}
                      className='dark:invert'
                      height={18}
                      src={`https://cdn.simpleicons.org/${tool.icon}`}
                      width={18}
                    />
                    <span>{t(`tools.items.${tool.path}.name`)}</span>
                  </div>
                  <ToolProgress progress={(tool as ToolWithProgressType).progress || "notStarted"} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
};

export { SearchCommand };
