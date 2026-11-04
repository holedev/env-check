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
    probe: { method: "S3", target: "ListBuckets · your endpoint or AWS" },
    progress: "completed",
    libInfo: {
      packageName: "@aws-sdk/client-s3",
      url: "https://www.npmjs.com/package/@aws-sdk/client-s3",
      version: "3.1161.0"
    }
  },
  {
    icon: "cloudflare",
    path: "cloudflare",
    probe: { method: "GET", target: "api.cloudflare.com/client/v4/user/tokens/verify" },
    progress: "completed",
    libInfo: {
      packageName: "fetch"
    }
  },
  {
    icon: "supabase",
    path: "supabase",
    probe: { method: "GET", target: "<project>/auth/v1/admin/users?per_page=1" },
    progress: "completed",
    libInfo: {
      packageName: "@supabase/supabase-js",
      url: "https://www.npmjs.com/package/@supabase/supabase-js",
      version: "2.118.0"
    }
  },
  {
    icon: "firebase",
    path: "firebase",
    probe: { method: "SDK", target: "Auth · listUsers(1)" },
    progress: "completed",
    libInfo: {
      packageName: "firebase-admin",
      url: "https://www.npmjs.com/package/firebase-admin",
      version: "14.5.0"
    }
  },
  {
    icon: "mongodb",
    path: "mongodb",
    probe: { method: "MONGO", target: "listCollections · listDatabases" },
    progress: "completed",
    libInfo: {
      packageName: "mongodb",
      url: "https://www.npmjs.com/package/mongodb",
      version: "7.8.0"
    }
  },
  {
    icon: "postgresql",
    path: "postgresql",
    probe: { method: "SQL", target: "SELECT table_name FROM information_schema.tables" },
    progress: "completed",
    libInfo: {
      packageName: "pg",
      url: "https://www.npmjs.com/package/pg",
      version: "8.23.1"
    }
  },
  {
    icon: "googlegemini",
    path: "google-gemini",
    probe: { method: "GET", target: "generativelanguage.googleapis.com/v1beta/openai/models" },
    progress: "completed",
    libInfo: {
      packageName: "fetch"
    }
  },
  {
    icon: "gmail",
    path: "gmail-smtp",
    probe: { method: "SMTP", target: "AUTH on <host>:465 / 587" },
    progress: "completed",
    libInfo: {
      packageName: "nodemailer",
      url: "https://www.npmjs.com/package/nodemailer",
      version: "10.3.1"
    }
  },
  {
    icon: "discord",
    path: "discord",
    probe: { method: "GET", target: "discord.com/api/v10/users/@me" },
    progress: "completed",
    libInfo: {
      packageName: "fetch"
    }
  },
  {
    icon: "googleanalytics",
    path: "google-analytics",
    probe: { method: "POST", target: "www.google-analytics.com/debug/mp/collect" },
    progress: "completed",
    libInfo: {
      packageName: "fetch"
    }
  },
  {
    icon: "github",
    path: "github",
    probe: { method: "GET", target: "api.github.com/user" },
    progress: "completed",
    libInfo: {
      packageName: "@octokit/rest",
      url: "https://www.npmjs.com/package/@octokit/rest",
      version: "22.0.1"
    }
  },
  {
    path: "openai",
    probe: { method: "GET", target: "api.openai.com/v1/models" },
    progress: "completed",
    libInfo: {
      packageName: "fetch"
    }
  },
  {
    icon: "anthropic",
    path: "anthropic",
    probe: { method: "GET", target: "api.anthropic.com/v1/models" },
    progress: "completed",
    libInfo: {
      packageName: "fetch"
    }
  },
  {
    icon: "stripe",
    path: "stripe",
    probe: { method: "GET", target: "api.stripe.com/v1/balance" },
    progress: "completed",
    libInfo: {
      packageName: "fetch"
    }
  },
  {
    path: "slack",
    probe: { method: "POST", target: "slack.com/api/auth.test" },
    progress: "completed",
    libInfo: {
      packageName: "fetch"
    }
  },
  {
    icon: "telegram",
    path: "telegram",
    probe: { method: "GET", target: "api.telegram.org/bot<token>/getMe" },
    progress: "completed",
    libInfo: {
      packageName: "fetch"
    }
  },
  {
    icon: "resend",
    path: "resend",
    probe: { method: "GET", target: "api.resend.com/domains" },
    progress: "completed",
    libInfo: {
      packageName: "fetch"
    }
  },
  {
    icon: "vercel",
    path: "vercel",
    probe: { method: "GET", target: "api.vercel.com/v2/user" },
    progress: "completed",
    libInfo: {
      packageName: "fetch"
    }
  },
  {
    icon: "sentry",
    path: "sentry",
    probe: { method: "GET", target: "sentry.io/api/0/ · de.sentry.io/api/0/" },
    progress: "completed",
    libInfo: {
      packageName: "fetch"
    }
  },
  {
    icon: "mysql",
    path: "mysql",
    probe: { method: "SQL", target: "SELECT VERSION(), DATABASE(), CURRENT_USER()" },
    progress: "completed",
    libInfo: {
      packageName: "mysql2",
      url: "https://www.npmjs.com/package/mysql2",
      version: "3.24.6"
    }
  },
  {
    icon: "redis",
    path: "redis",
    probe: { method: "REDIS", target: "PING · INFO server" },
    progress: "completed",
    libInfo: {
      packageName: "redis",
      url: "https://www.npmjs.com/package/redis",
      version: "6.3.1"
    }
  },
  {
    path: "groq",
    probe: { method: "GET", target: "api.groq.com/openai/v1/models" },
    progress: "completed",
    libInfo: {
      packageName: "fetch"
    }
  },
  {
    icon: "deepseek",
    path: "deepseek",
    probe: { method: "GET", target: "api.deepseek.com/models" },
    progress: "completed",
    libInfo: {
      packageName: "fetch"
    }
  },
  {
    icon: "mistralai",
    path: "mistral",
    probe: { method: "GET", target: "api.mistral.ai/v1/models" },
    progress: "completed",
    libInfo: {
      packageName: "fetch"
    }
  },
  {
    icon: "openrouter",
    path: "openrouter",
    probe: { method: "GET", target: "openrouter.ai/api/v1/key" },
    progress: "completed",
    libInfo: {
      packageName: "fetch"
    }
  },
  {
    icon: "huggingface",
    path: "huggingface",
    probe: { method: "GET", target: "huggingface.co/api/whoami-v2" },
    progress: "completed",
    libInfo: {
      packageName: "fetch"
    }
  },
  {
    path: "sendgrid",
    probe: { method: "GET", target: "api.sendgrid.com/v3/scopes · api.eu.sendgrid.com" },
    progress: "completed",
    libInfo: {
      packageName: "fetch"
    }
  },
  {
    path: "twilio",
    probe: { method: "GET", target: "api.twilio.com/2010-04-01/Accounts/{SID}.json" },
    progress: "completed",
    libInfo: {
      packageName: "fetch"
    }
  },
  {
    icon: "netlify",
    path: "netlify",
    probe: { method: "GET", target: "api.netlify.com/api/v1/user" },
    progress: "completed",
    libInfo: {
      packageName: "fetch"
    }
  },
  {
    icon: "digitalocean",
    path: "digitalocean",
    probe: { method: "GET", target: "api.digitalocean.com/v2/account" },
    progress: "completed",
    libInfo: {
      packageName: "fetch"
    }
  },
  {
    icon: "notion",
    path: "notion",
    probe: { method: "GET", target: "api.notion.com/v1/users/me" },
    progress: "completed",
    libInfo: {
      packageName: "fetch"
    }
  }
] as const);

export const _TOOL_GROUP_LIST: ToolGroupType[] = [
  {
    path: "ai",
    tools: ["google-gemini", "openai", "anthropic", "groq", "deepseek", "mistral", "openrouter", "huggingface"]
  },
  {
    path: "cloud",
    tools: ["s3-compatible", "cloudflare", "supabase", "firebase", "github", "vercel", "netlify", "digitalocean"]
  },
  {
    path: "database",
    tools: ["mongodb", "postgresql", "mysql", "redis"]
  },
  {
    path: "payment",
    tools: ["stripe"]
  },
  {
    path: "messaging",
    tools: ["gmail-smtp", "discord", "slack", "telegram", "resend", "sendgrid", "twilio"]
  },
  {
    path: "analytics",
    tools: ["google-analytics", "sentry"]
  },
  {
    path: "others",
    tools: ["notion"]
  }
];
