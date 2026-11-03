import { _TOOL_LIST } from "@/constants/tool";
import type { ToolGroupType, ToolItem } from "@/types/tool";

/** Resolves a Tool Group's tool paths to their registered tools, in group order. */
export const getGroupTools = (group: ToolGroupType): ToolItem[] =>
  group.tools.flatMap((toolPath) => {
    const tool = _TOOL_LIST.find((item) => item.path === toolPath);
    return tool ? [tool as ToolItem] : [];
  });
