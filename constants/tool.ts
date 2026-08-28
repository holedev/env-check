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

import type { ToolGroupType } from "@/types/tool";
import { defineToolList } from "@/types/tool";

export const _TOOL_LIST = defineToolList([
  {
    icon: "minio",
    path: "s3-compatible",
    progress: "completed",
    libInfo: {
      packageName: "@aws-sdk/client-s3",
      url: "https://www.npmjs.com/package/@aws-sdk/client-s3",
      version: "3.1120.0"
    }
  },
  {
    icon: "cloudflare",
    path: "cloudflare",
    progress: "completed",
    libInfo: {
      packageName: "fetch"
    }
  },
  {
    icon: "supabase",
    path: "supabase",
    progress: "completed",
    libInfo: {
      packageName: "@supabase/supabase-js",
      url: "https://www.npmjs.com/package/@supabase/supabase-js",
      version: "2.112.4"
    }
  },
  {
    icon: "firebase",
    path: "firebase",
    progress: "completed",
    libInfo: {
      packageName: "firebase-admin",
      url: "https://www.npmjs.com/package/firebase-admin",
      version: "14.3.0"
    }
  },
  {
    icon: "mongodb",
    path: "mongodb",
    progress: "completed",
    libInfo: {
      packageName: "mongodb",
      url: "https://www.npmjs.com/package/mongodb",
      version: "7.6.0"
    }
  },
  {
    icon: "postgresql",
    path: "postgresql",
    progress: "completed",
    libInfo: {
      packageName: "pg",
      url: "https://www.npmjs.com/package/pg",
      version: "8.23.0"
    }
  },
  {
    icon: "googlegemini",
    path: "google-gemini",
    progress: "completed",
    libInfo: {
      packageName: "openai",
      url: "https://www.npmjs.com/package/openai",
      version: "7.8.0"
    }
  },
  {
    icon: "gmail",
    path: "gmail-smtp",
    progress: "completed",
    libInfo: {
      packageName: "nodemailer",
      url: "https://www.npmjs.com/package/nodemailer",
      version: "9.0.6"
    }
  },
  {
    icon: "discord",
    path: "discord",
    progress: "completed",
    libInfo: {
      packageName: "fetch"
    }
  },
  {
    icon: "googleanalytics",
    path: "google-analytics"
  },
  {
    icon: "github",
    path: "github",
    progress: "completed",
    libInfo: {
      packageName: "@octokit/rest",
      url: "https://www.npmjs.com/package/@octokit/rest",
      version: "22.0.1"
    }
  }
] as const);

export const _TOOL_GROUP_LIST: ToolGroupType[] = [
  {
    path: "ai",
    tools: ["google-gemini"]
  },
  {
    path: "cloud",
    tools: ["s3-compatible", "cloudflare", "supabase", "firebase", "github"]
  },
  {
    path: "database",
    tools: ["mongodb", "postgresql"]
  },
  {
    path: "payment",
    tools: []
  },
  {
    path: "messaging",
    tools: ["gmail-smtp", "discord"]
  },
  {
    path: "analytics",
    tools: ["google-analytics"]
  },
  {
    path: "others",
    tools: []
  }
];
