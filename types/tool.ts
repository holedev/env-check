import type { _TOOL_LIST } from "@/constants/tool";

export type ToolProgressCategory = "notStarted" | "inProgress" | "completed";

export type ToolLibInfo = {
  packageName: string | "fetch";
  url?: string;
  version?: string;
};

/** The Tool's single read-only request (see CONTEXT.md: Probe). */
export type ToolProbe = {
  /** HTTP verb, or the protocol for non-HTTP probes (SQL, SMTP, REDIS, MONGO, S3, SDK). */
  method: string;
  /** Host and path, or the command, shown to the user before they paste anything. */
  target: string;
};

export type ToolType = {
  path: string;
  /** simpleicons.org slug; omit when simpleicons has no icon for the brand. */
  icon?: string;
  libInfo?: ToolLibInfo;
  probe: ToolProbe;
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

export type ToolItem = ToolWithProgressType & { path: ToolPath };
