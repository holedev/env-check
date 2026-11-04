"use server";

import { enumFact, redact, requestService, summarize, valid } from "@/lib/validation";
import type { SummaryItem } from "@/types/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type NotionConfig = { token: string };

type NotionBotUser = {
  object?: string;
  name?: string;
  bot?: { owner?: { type?: string }; workspace_name?: string };
  message?: string;
};

const _NOTION_ME_URL = "https://api.notion.com/v1/users/me";
const _NOTION_VERSION = "2022-06-28";
const _OWNER_TYPES = new Set(["workspace", "user"]);

/** Probe: the integration's own bot user (GET /v1/users/me). */
const checkNotionToken = async ({ token }: NotionConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const res = await requestService<NotionBotUser>("Notion", _NOTION_ME_URL, {
        headers: { Authorization: `Bearer ${token}`, "Notion-Version": _NOTION_VERSION }
      });

      if (!(res.ok && res.body?.object === "user")) {
        throw new Error(redact(res.body?.message ?? `Notion returned HTTP ${res.status}`, [token]));
      }

      const owner = res.body.bot?.owner?.type;
      const ownerType: SummaryItem[] =
        owner && _OWNER_TYPES.has(owner) ? [enumFact("ownerType", "ownerTypes", owner)] : [];

      return valid([...summarize({ name: res.body.name, workspace: res.body.bot?.workspace_name }), ...ownerType]);
    }
  });

export { checkNotionToken };
