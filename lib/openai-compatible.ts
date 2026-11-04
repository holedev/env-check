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

const errorMessage = (body: ModelsResponse | null): string | undefined => {
  if (typeof body?.error === "string") {
    return body.error;
  }
  return body?.error?.message ?? body?.message ?? body?.detail;
};

/**
 * Validation probe shared by providers with an OpenAI-compatible API (OpenAI,
 * Groq, DeepSeek, Mistral): list models with a Bearer key. 403 is Restricted,
 * any other failure throws (invalid). Each provider stays its own Tool.
 */
export const probeOpenAiCompatible = async ({
  service,
  modelsUrl,
  apiKey,
  facts = []
}: ProbeOptions): Promise<ValidationResult> => {
  const res = await requestService<ModelsResponse>(service, modelsUrl, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  const message = redact(errorMessage(res.body) ?? `${service} returned HTTP ${res.status}`, [apiKey]);

  if (res.status === 403) {
    return restricted(message, facts);
  }
  if (!res.ok) {
    throw new Error(message);
  }

  const models = (res.body?.data ?? []).map((model) => model.id).sort();
  return valid([...facts, ...summarize({ modelsCount: models.length, models })]);
};
