"use client";

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
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
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
    if (!searchValue.trim()) return sortedTools;

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
        const index = Number.parseInt(e.key) - 1;

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
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`${t("common.search.placeholder")} (${_TOOL_LIST.length}) • Ctrl + 1-9`}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>{t("common.search.empty")}</CommandEmpty>
            <CommandGroup>
              {filteredTools.map((tool, index) => (
                <CommandItem
                  key={tool.path}
                  value={t(`tools.items.${tool.path}.name`)}
                  onSelect={() => runCommand(tool.path)}
                  className='flex items-center gap-2 justify-between'
                >
                  <div className='flex gap-2 items-center'>
                    {index < 9 && (
                      <span className='text-xs text-muted-foreground font-mono bg-muted px-1 py-0.5 rounded text-[10px] min-w-[16px] text-center'>
                        {index + 1}
                      </span>
                    )}
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
        </Command>
      </CommandDialog>
    </>
  );
};

export { SearchCommand };
