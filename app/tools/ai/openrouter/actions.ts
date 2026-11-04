"use server";

import { enumFact, redact, requestService, summarize, valid } from "@/lib/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type OpenRouterConfig = { apiKey: string };

type OpenRouterKey = {
  data?: {
    label?: string;
    usage?: number;
    limit?: number | null;
    limit_remaining?: number | null;
    is_free_tier?: boolean;
  };
  error?: { message?: string };
};

const _OPENROUTER_KEY_URL = "https://openrouter.ai/api/v1/key";

const usd = (amount: number | null | undefined) => (typeof amount === "number" ? `$${amount.toFixed(2)}` : undefined);

/** Probe: the key's own info (label, credit limit, usage). Read-only. */
const checkOpenRouterKey = async ({ apiKey }: OpenRouterConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const res = await requestService<OpenRouterKey>("OpenRouter", _OPENROUTER_KEY_URL, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });

      if (!(res.ok && res.body?.data)) {
        throw new Error(redact(res.body?.error?.message ?? `OpenRouter returned HTTP ${res.status}`, [apiKey]));
      }

      const key = res.body.data;
      const hasLimit = typeof key.limit === "number";
      return valid([
        ...summarize({ label: key.label, usage: usd(key.usage) }),
        hasLimit ? { key: "limit", value: usd(key.limit) ?? "" } : enumFact("limit", "limits", "unlimited"),
        ...summarize({ limitRemaining: hasLimit ? usd(key.limit_remaining) : undefined, freeTier: key.is_free_tier })
      ]);
    }
  });

export { checkOpenRouterKey };
