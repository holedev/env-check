/*
Icon brand by https://simpleicons.org/.
Example: https://cdn.simpleicons.org/mongodb => icon: "mongodb"
----
Before create new tools, remember internationalization (i18n)
1. The i18n key format is:
tools.items.<tool_name>.name
tools.items.<tool_name>.description
2. The i18n key format for group is:
tools.groups.<group_name>.name
tools.groups.<group_name>.description
*/

import { defineToolList } from "@/types/tool";
import type { ToolGroupType } from "@/types/tool";

export const _TOOL_LIST = defineToolList([
  {
    nameKey: "tools.items.aws.name",
    descriptionKey: "tools.items.aws.description",
    icon: "awslambda",
    path: "aws"
  },
  {
    nameKey: "tools.items.gcp.name",
    descriptionKey: "tools.items.gcp.description",
    icon: "googlecloud",
    path: "google-cloud"
  },
  {
    nameKey: "tools.items.cloudflare.name",
    descriptionKey: "tools.items.cloudflare.description",
    icon: "cloudflare",
    path: "cloudflare"
  },
  {
    nameKey: "tools.items.digitalocean.name",
    descriptionKey: "tools.items.digitalocean.description",
    icon: "digitalocean",
    path: "digital-ocean"
  },
  {
    nameKey: "tools.items.supabase.name",
    descriptionKey: "tools.items.supabase.description",
    icon: "supabase",
    path: "supabase"
  },
  {
    nameKey: "tools.items.firebase.name",
    descriptionKey: "tools.items.firebase.description",
    icon: "firebase",
    path: "firebase"
  },
  {
    nameKey: "tools.items.mongodb.name",
    descriptionKey: "tools.items.mongodb.description",
    icon: "mongodb",
    path: "mongodb"
  },
  {
    nameKey: "tools.items.faunadb.name",
    descriptionKey: "tools.items.faunadb.description",
    icon: "faunadb",
    path: "faunadb"
  },
  {
    nameKey: "tools.items.openai.name",
    descriptionKey: "tools.items.openai.description",
    icon: "openai",
    path: "openai"
  },
  {
    nameKey: "tools.items.anthropic.name",
    descriptionKey: "tools.items.anthropic.description",
    icon: "anthropic",
    path: "anthropic"
  },
  {
    nameKey: "tools.items.gemini.name",
    descriptionKey: "tools.items.gemini.description",
    icon: "googlegemini",
    path: "google-gemini"
  },
  {
    nameKey: "tools.items.huggingface.name",
    descriptionKey: "tools.items.huggingface.description",
    icon: "huggingface",
    path: "hugging-face"
  },
  {
    nameKey: "tools.items.stripe.name",
    descriptionKey: "tools.items.stripe.description",
    icon: "stripe",
    path: "stripe"
  },
  {
    nameKey: "tools.items.paypal.name",
    descriptionKey: "tools.items.paypal.description",
    icon: "paypal",
    path: "paypal"
  },
  {
    nameKey: "tools.items.twilio.name",
    descriptionKey: "tools.items.twilio.description",
    icon: "twilio",
    path: "twilio"
  },
  {
    nameKey: "tools.items.sendgrid.name",
    descriptionKey: "tools.items.sendgrid.description",
    icon: "sendgrid",
    path: "sendgrid"
  },
  {
    nameKey: "tools.items.mailgun.name",
    descriptionKey: "tools.items.mailgun.description",
    icon: "mailgun",
    path: "mailgun"
  },
  {
    nameKey: "tools.items.smtp.name",
    descriptionKey: "tools.items.smtp.description",
    icon: "gmail",
    path: "gmail-smtp"
  },
  {
    nameKey: "tools.items.slack.name",
    descriptionKey: "tools.items.slack.description",
    icon: "slack",
    path: "slack"
  },
  {
    nameKey: "tools.items.discord.name",
    descriptionKey: "tools.items.discord.description",
    icon: "discord",
    path: "discord"
  },
  {
    nameKey: "tools.items.google_analytics.name",
    descriptionKey: "tools.items.google_analytics.description",
    icon: "googleanalytics",
    path: "google-analytics"
  },
  {
    nameKey: "tools.items.datadog.name",
    descriptionKey: "tools.items.datadog.description",
    icon: "datadog",
    path: "datadog"
  },
  {
    nameKey: "tools.items.sentry.name",
    descriptionKey: "tools.items.sentry.description",
    icon: "sentry",
    path: "sentry"
  },
  {
    nameKey: "tools.items.github.name",
    descriptionKey: "tools.items.github.description",
    icon: "github",
    path: "github"
  },
  {
    nameKey: "tools.items.vercel.name",
    descriptionKey: "tools.items.vercel.description",
    icon: "vercel",
    path: "vercel"
  },
  {
    nameKey: "tools.items.postgresql.name",
    descriptionKey: "tools.items.postgresql.description",
    icon: "postgresql",
    path: "postgresql"
  },
  {
    nameKey: "tools.items.mysql.name",
    descriptionKey: "tools.items.mysql.description",
    icon: "mysql",
    path: "mysql"
  }
] as const);

export const _TOOL_GROUP_LIST: ToolGroupType[] = [
  {
    path: "database",
    nameKey: "tools.groups.database.name",
    descriptionKey: "tools.groups.database.description",
    tools: ["mongodb", "postgresql", "mysql", "faunadb"]
  },
  {
    path: "ai",
    nameKey: "tools.groups.ai.name",
    descriptionKey: "tools.groups.ai.description",
    tools: ["openai", "anthropic", "google-gemini", "hugging-face"]
  },
  {
    path: "cloud",
    nameKey: "tools.groups.cloud.name",
    descriptionKey: "tools.groups.cloud.description",
    tools: ["google-cloud", "aws", "cloudflare", "digital-ocean", "supabase", "firebase", "github", "vercel"]
  },
  {
    path: "payment",
    nameKey: "tools.groups.payment.name",
    descriptionKey: "tools.groups.payment.description",
    tools: ["stripe", "paypal"]
  },
  {
    path: "messaging",
    nameKey: "tools.groups.messaging.name",
    descriptionKey: "tools.groups.messaging.description",
    tools: ["twilio", "sendgrid", "gmail-smtp", "mailgun", "slack", "discord"]
  },
  {
    path: "analytics",
    nameKey: "tools.groups.analytics.name",
    descriptionKey: "tools.groups.analytics.description",
    tools: ["google-analytics", "sentry", "datadog"]
  },
  {
    path: "others",
    nameKey: "tools.groups.others.name",
    descriptionKey: "tools.groups.others.description",
    tools: []
  }
];
