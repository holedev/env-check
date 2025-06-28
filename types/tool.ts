import type { _TOOL_LIST } from "@/constants/tool";

export type ToolProgressCategory = "notStarted" | "inProgress" | "completed";

export type ToolType = {
  path: string;
  icon: string;
};

export type ToolWithProgressType = ToolType & {
  progress?: ToolProgressCategory;
};

export function defineToolList<T extends readonly ToolType[]>(tools: T) {
  return tools;
}

export type ToolPath = (typeof _TOOL_LIST)[number]["path"];

export type ToolGroupCategory = "ai" | "cloud" | "database" | "payment" | "messaging" | "analytics" | "others";

export type ToolGroupType = {
  path: ToolGroupCategory;
  tools: ToolPath[];
};
