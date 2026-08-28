"use server";

import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type GoogleAnalyticsConfig = {
  apiSecret: string;
  measurementId: string;
};

const _GA_DEBUG_COLLECT_URL = "https://www.google-analytics.com/debug/mp/collect";

type ValidationMessage = { description?: string; validationCode?: string };

const checkGoogleAnalyticsCredentials = async (config: GoogleAnalyticsConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      try {
        const url = `${_GA_DEBUG_COLLECT_URL}?measurement_id=${encodeURIComponent(
          config.measurementId
        )}&api_secret=${encodeURIComponent(config.apiSecret)}`;

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: "env-check",
            events: [{ name: "env_check_test" }]
          })
        });

        if (!response.ok) {
          throw new Error(`Google Analytics API error: ${response.statusText}`);
        }

        const body = (await response.json()) as { validationMessages?: ValidationMessage[] };
        const messages = body.validationMessages ?? [];

        if (messages.length > 0) {
          throw new Error(
            messages
              .map((m) => m.description)
              .filter(Boolean)
              .join("; ") || "Invalid Measurement Protocol credentials"
          );
        }

        return { valid: true };
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Failed to connect to Google Analytics");
      }
    }
  });

export { checkGoogleAnalyticsCredentials };
