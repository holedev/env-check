"use server";

import { redact, requestService, restricted, summarize, valid } from "@/lib/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type ResendConfig = { apiKey: string };

type ResendDomains = {
  data?: { name: string; status: string }[];
  name?: string;
  message?: string;
};

const _RESEND_DOMAINS_URL = "https://api.resend.com/domains";

/** Probe: list domains. A sending-only key answers `restricted_api_key`: Restricted. */
const checkResendKey = async ({ apiKey }: ResendConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const res = await requestService<ResendDomains>("Resend", _RESEND_DOMAINS_URL, {
        headers: { Authorization: `Bearer ${apiKey}`, "User-Agent": "env-check" }
      });
      const message = redact(res.body?.message ?? `Resend returned HTTP ${res.status}`, [apiKey]);

      if (res.body?.name === "restricted_api_key") {
        return restricted(message);
      }
      if (!res.ok) {
        throw new Error(message);
      }

      const domains = (res.body?.data ?? []).map((domain) => `${domain.name} (${domain.status})`);
      return valid(summarize({ domainsCount: domains.length, domains }));
    }
  });

export { checkResendKey };
