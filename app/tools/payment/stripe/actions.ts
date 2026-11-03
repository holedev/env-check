"use server";

import { enumFact, redact, requestService, restricted, summarize, valid } from "@/lib/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type StripeConfig = { apiKey: string };

type StripeBalance = {
  livemode?: boolean;
  available?: { currency: string }[];
  error?: { message?: string };
};

const _STRIPE_BALANCE_URL = "https://api.stripe.com/v1/balance";

/** Probe: read the balance. 401 = bad key, 403 = restricted key without balance read. */
const checkStripeKey = async ({ apiKey }: StripeConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const res = await requestService<StripeBalance>("Stripe", _STRIPE_BALANCE_URL, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      const message = redact(res.body?.error?.message ?? `Stripe returned HTTP ${res.status}`, [apiKey]);
      const keyType = enumFact("keyType", "keyTypes", apiKey.startsWith("rk_") ? "restricted" : "secret");
      const modeFromKey = apiKey.includes("_live_") ? "live" : "test";

      if (res.status === 403) {
        return restricted(message, [enumFact("mode", "modes", modeFromKey), keyType]);
      }
      if (!res.ok) {
        throw new Error(message);
      }

      const livemode = res.body?.livemode ?? modeFromKey === "live";
      const mode = livemode ? "live" : "test";
      const currencies = [...new Set((res.body?.available ?? []).map((b) => b.currency.toUpperCase()))];
      return valid([enumFact("mode", "modes", mode), keyType, ...summarize({ currencies })]);
    }
  });

export { checkStripeKey };
