"use server";

import { probeOpenAiCompatible } from "@/lib/openai-compatible";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type GeminiConfig = { apiKey: string };

const _GEMINI_MODELS_URL = "https://generativelanguage.googleapis.com/v1beta/openai/models";

/** Probe: list models via Gemini's OpenAI-compatible API. 403 is Restricted. */
const checkGeminiKey = async ({ apiKey }: GeminiConfig) =>
  handleErrorServerNoAuth({
    cb: async () => probeOpenAiCompatible({ service: "Gemini", modelsUrl: _GEMINI_MODELS_URL, apiKey })
  });

export { checkGeminiKey };
