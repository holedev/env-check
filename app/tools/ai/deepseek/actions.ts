"use server";

import { probeOpenAiCompatible } from "@/lib/openai-compatible";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type DeepSeekConfig = { apiKey: string };

const _DEEPSEEK_MODELS_URL = "https://api.deepseek.com/models";

/** Probe: list models via DeepSeek's OpenAI-compatible API. 403 is Restricted. */
const checkDeepSeekKey = async ({ apiKey }: DeepSeekConfig) =>
  handleErrorServerNoAuth({
    cb: async () => probeOpenAiCompatible({ service: "DeepSeek", modelsUrl: _DEEPSEEK_MODELS_URL, apiKey })
  });

export { checkDeepSeekKey };
