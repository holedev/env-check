import { redact, requestService, restricted, summarize, valid } from "@/lib/validation";
import type { SummaryItem, ValidationResult } from "@/types/validation";

type ModelsResponse = {
  data?: { id: string }[];
  error?: { message?: string } | string;
  message?: string;
  detail?: string;
};

type ProbeOptions = {
  /** Service name for errors, e.g. "Groq". */
  service: string;
  /** The provider's OpenAI-style `GET /models` endpoint. */
  modelsUrl: string;
  apiKey: string;
  /** Facts known before the call (e.g. key type), shown for every outcome. */
  facts?: SummaryItem[];
};

const _MODELS_PREFIX = /^models\//;

const errorMessage = (raw: ModelsResponse | ModelsResponse[] | null): string | undefined => {
  // Google's OpenAI-compatible endpoint wraps errors in an array.
  const body = Array.isArray(raw) ? raw[0] : raw;
  if (typeof body?.error === "string") {
    return body.error;
  }
  return body?.error?.message ?? body?.message ?? body?.detail;
};

/**
 * Validation probe shared by providers with an OpenAI-compatible API (OpenAI,
 * Gemini, Groq, DeepSeek, Mistral): list models with a Bearer key. 403 is Restricted,
 * any other failure throws (invalid). Each provider stays its own Tool.
 */
export const probeOpenAiCompatible = async ({
  service,
  modelsUrl,
  apiKey,
  facts = []
}: ProbeOptions): Promise<ValidationResult> => {
  const res = await requestService<ModelsResponse & ModelsResponse[]>(service, modelsUrl, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  const message = redact(errorMessage(res.body) ?? `${service} returned HTTP ${res.status}`, [apiKey]);

  if (res.status === 403) {
    return restricted(message, facts);
  }
  if (!res.ok) {
    throw new Error(message);
  }

  const models = (res.body?.data ?? []).map((model) => model.id.replace(_MODELS_PREFIX, "")).sort();
  return valid([...facts, ...summarize({ modelsCount: models.length, models })]);
};
