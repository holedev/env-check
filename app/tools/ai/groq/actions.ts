"use server";

import { probeOpenAiCompatible } from "@/lib/openai-compatible";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type GroqConfig = { apiKey: string };

const _GROQ_MODELS_URL = "https://api.groq.com/openai/v1/models";

/** Probe: list models via Groq's OpenAI-compatible API. 403 is Restricted. */
const checkGroqKey = async ({ apiKey }: GroqConfig) =>
  handleErrorServerNoAuth({
    cb: async () => probeOpenAiCompatible({ service: "Groq", modelsUrl: _GROQ_MODELS_URL, apiKey })
  });

export { checkGroqKey };
