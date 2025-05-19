import type { _TOOL_LIST } from "@/constants/tool";

export type ToolType = {
  path: string;
  nameKey: string;
  descriptionKey: string;
  icon: string;
};

export function defineToolList<T extends readonly ToolType[]>(tools: T) {
  return tools;
}

export type ToolPath = (typeof _TOOL_LIST)[number]["path"];

export type ToolGroupType = {
  path: string;
  nameKey: string;
  descriptionKey: string;
  tools: ToolPath[];
};
