"use server";

import { enumFact, redact, requestService, restricted, summarize, valid } from "@/lib/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type OpenAiConfig = { apiKey: string };

type OpenAiModels = { data?: { id: string }[]; error?: { message?: string } };

const _OPENAI_MODELS_URL = "https://api.openai.com/v1/models";

const keyType = (apiKey: string) => {
  if (apiKey.startsWith("sk-proj-")) {
    return "project";
  }
  if (apiKey.startsWith("sk-svcacct-")) {
    return "serviceAccount";
  }
  if (apiKey.startsWith("sk-admin-")) {
    return "admin";
  }
  return "user";
};

/** Probe: list models. 401 = bad key, 403 = restricted key without model read. */
const checkOpenAiKey = async ({ apiKey }: OpenAiConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const res = await requestService<OpenAiModels>("OpenAI", _OPENAI_MODELS_URL, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      const message = redact(res.body?.error?.message ?? `OpenAI returned HTTP ${res.status}`, [apiKey]);
      const type = enumFact("keyType", "keyTypes", keyType(apiKey));

      if (res.status === 403) {
        return restricted(message, [type]);
      }
      if (!res.ok) {
        throw new Error(message);
      }

      const models = (res.body?.data ?? []).map((model) => model.id).sort();
      return valid([type, ...summarize({ modelsCount: models.length, models })]);
    }
  });

export { checkOpenAiKey };
