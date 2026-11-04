"use server";

import { probeOpenAiCompatible } from "@/lib/openai-compatible";
import { enumFact } from "@/lib/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type OpenAiConfig = { apiKey: string };

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
    cb: async () =>
      probeOpenAiCompatible({
        service: "OpenAI",
        modelsUrl: _OPENAI_MODELS_URL,
        apiKey,
        facts: [enumFact("keyType", "keyTypes", keyType(apiKey))]
      })
  });

export { checkOpenAiKey };
