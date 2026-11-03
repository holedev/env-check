import type { SummaryItem, ValidationResult } from "@/types/validation";

/** Builds a Validation summary, dropping facts the service didn't return. */
export const summarize = (items: Record<string, SummaryItem["value"] | null | undefined>): SummaryItem[] =>
  Object.entries(items).flatMap(([key, value]) =>
    value === null || value === undefined || value === "" ? [] : [{ key, value }]
  );

export const valid = (summary: SummaryItem[] = []): ValidationResult => ({ outcome: "valid", summary });

export const restricted = (reason: string, summary: SummaryItem[] = []): ValidationResult => ({
  outcome: "restricted",
  reason,
  summary
});

/** Replaces every occurrence of each secret in `message` so it can't reach the browser or the logs. */
export const redact = (message: string, secrets: (string | undefined)[]): string =>
  secrets
    .filter((secret): secret is string => typeof secret === "string" && secret.length >= 4)
    .reduce((text, secret) => text.split(secret).join("***"), message);

type ServiceResponse<T> = { status: number; ok: boolean; headers: Headers; body: T | null };

const _TIMEOUT_MS = 10_000;

/**
 * fetch() for a Validation probe: no caching, a timeout, a JSON body (or null),
 * and a network error that names the service but never the URL, since some
 * services (Telegram) put the credential in the path.
 */
export const requestService = async <T = unknown>(
  service: string,
  url: string,
  init: RequestInit = {}
): Promise<ServiceResponse<T>> => {
  let response: Response;
  try {
    response = await fetch(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(_TIMEOUT_MS) });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    throw new Error(timedOut ? `${service} did not respond in time` : `Could not reach ${service}`);
  }

  let body: T | null = null;
  try {
    body = (await response.json()) as T;
  } catch {
    body = null;
  }
  return { status: response.status, ok: response.ok, headers: response.headers, body };
};
