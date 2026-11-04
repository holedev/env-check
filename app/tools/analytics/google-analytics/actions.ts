"use server";

import { redact, requestService, summarize, valid } from "@/lib/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type GoogleAnalyticsConfig = { apiSecret: string; measurementId: string };

type DebugResponse = { validationMessages?: { description?: string }[] };

const _GA_DEBUG_COLLECT_URL = "https://www.google-analytics.com/debug/mp/collect";
const _MEASUREMENT_ID = /^G-[A-Z0-9]+$/;

/**
 * Probe: the Measurement Protocol *debug* endpoint, which validates the request
 * but records nothing. Google's validation server does not verify the API
 * secret itself, which the tool's copy says plainly.
 */
const checkGoogleAnalyticsCredentials = async ({ apiSecret, measurementId }: GoogleAnalyticsConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      if (!_MEASUREMENT_ID.test(measurementId)) {
        throw new Error("Measurement ID must look like G-XXXXXXXXXX");
      }

      const params = new URLSearchParams({ measurement_id: measurementId, api_secret: apiSecret });
      const res = await requestService<DebugResponse>("Google Analytics", `${_GA_DEBUG_COLLECT_URL}?${params}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: "env-check", events: [{ name: "env_check_probe" }] })
      });

      if (!res.ok) {
        throw new Error(`Google Analytics returned HTTP ${res.status}`);
      }
      const problems = (res.body?.validationMessages ?? []).map((m) => m.description).filter(Boolean);
      if (problems.length > 0) {
        throw new Error(redact(problems.join("; "), [apiSecret]));
      }

      return valid(summarize({ measurementId }));
    }
  });

export { checkGoogleAnalyticsCredentials };
