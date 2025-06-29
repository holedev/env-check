/*
Icon brand by https://simpleicons.org/.
Example: https://cdn.simpleicons.org/mongodb => icon: "mongodb"
----
Before create new tools, remember internationalization (i18n)
1. The i18n key format is:
tools.items.<tool_path>.name
tools.items.<tool_path>.description
2. The i18n key format for group is:
tools.groups.<group_path>.name
tools.groups.<group_path>.description
----
Tool progress:
- notStarted (default): Not started yet
- inProgress: In progress
- completed: Completed
*/

import { defineToolList } from "@/types/tool";
import type { ToolGroupType } from "@/types/tool";

export const _TOOL_LIST = defineToolList([
  {
    icon: "awslambda",
    path: "aws"
  },
  {
    icon: "minio",
    path: "s3-compatible",
    progress: "completed"
  },
  {
    icon: "googlecloud",
    path: "google-cloud"
  },
  {
    icon: "cloudflare",
    path: "cloudflare"
  },
  {
    icon: "digitalocean",
    path: "digital-ocean"
  },
  {
    icon: "supabase",
    path: "supabase"
  },
  {
    icon: "firebase",
    path: "firebase"
  },
  {
    icon: "mongodb",
    path: "mongodb",
    progress: "inProgress"
  },
  {
    icon: "googlegemini",
    path: "google-gemini",
    progress: "completed"
  },
  {
    icon: "stripe",
    path: "stripe"
  },
  {
    icon: "gmail",
    path: "gmail-smtp",
    progress: "completed"
  },
  {
    icon: "slack",
    path: "slack"
  },
  {
    icon: "discord",
    path: "discord"
  },
  {
    icon: "googleanalytics",
    path: "google-analytics"
  },
  {
    icon: "sentry",
    path: "sentry"
  },
  {
    icon: "github",
    path: "github"
  },
  {
    icon: "vercel",
    path: "vercel"
  },
  {
    icon: "postgresql",
    path: "postgresql"
  },
  {
    icon: "mysql",
    path: "mysql"
  }
] as const);

export const _TOOL_GROUP_LIST: ToolGroupType[] = [
  {
    path: "ai",
    tools: ["google-gemini"]
  },
  {
    path: "cloud",
    tools: [
      "google-cloud",
      "aws",
      "s3-compatible",
      "cloudflare",
      "digital-ocean",
      "supabase",
      "firebase",
      "github",
      "vercel"
    ]
  },
  {
    path: "database",
    tools: ["mongodb", "postgresql", "mysql"]
  },
  {
    path: "payment",
    tools: ["stripe"]
  },
  {
    path: "messaging",
    tools: ["gmail-smtp", "slack", "discord"]
  },
  {
    path: "analytics",
    tools: ["google-analytics", "sentry"]
  },
  {
    path: "others",
    tools: []
  }
];
