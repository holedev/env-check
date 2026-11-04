"use server";

import { redact, requestService, restricted, summarize, valid } from "@/lib/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type AnthropicConfig = { apiKey: string };

type AnthropicModels = {
  data?: { id: string }[];
  error?: { type?: string; message?: string };
};

const _ANTHROPIC_MODELS_URL = "https://api.anthropic.com/v1/models?limit=1000";
const _ANTHROPIC_VERSION = "2023-06-01";

/** Probe: list models. authentication_error = bad key, permission_error = Restricted. */
const checkAnthropicKey = async ({ apiKey }: AnthropicConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const res = await requestService<AnthropicModels>("Anthropic", _ANTHROPIC_MODELS_URL, {
        headers: { "x-api-key": apiKey, "anthropic-version": _ANTHROPIC_VERSION }
      });
      const message = redact(res.body?.error?.message ?? `Anthropic returned HTTP ${res.status}`, [apiKey]);

      if (res.status === 403 || res.body?.error?.type === "permission_error") {
        return restricted(message);
      }
      if (!res.ok) {
        throw new Error(message);
      }

      const models = (res.body?.data ?? []).map((model) => model.id);
      return valid(summarize({ modelsCount: models.length, models }));
    }
  });

export { checkAnthropicKey };
