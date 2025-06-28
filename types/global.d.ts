import type { formats } from "@/configs/i18n/request";
import type globalMessages from "@/configs/messages/en.json";
// import type zodMessages from "@/configs/messages/zod/en.json";

declare module "next-intl" {
  interface AppConfig {
    Messages: typeof globalMessages;
    Formats: typeof formats;
  }
}

export type locale = "en" | "vi";
