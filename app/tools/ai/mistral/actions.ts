"use server";

import { probeOpenAiCompatible } from "@/lib/openai-compatible";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type MistralConfig = { apiKey: string };

const _MISTRAL_MODELS_URL = "https://api.mistral.ai/v1/models";

/** Probe: list models via Mistral's OpenAI-compatible API. 403 is Restricted. */
const checkMistralKey = async ({ apiKey }: MistralConfig) =>
  handleErrorServerNoAuth({
    cb: async () => probeOpenAiCompatible({ service: "Mistral", modelsUrl: _MISTRAL_MODELS_URL, apiKey })
  });

export { checkMistralKey };
