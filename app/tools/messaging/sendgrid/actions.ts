"use server";

import { redact, requestService, restricted, summarize, valid } from "@/lib/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type SendGridConfig = { apiKey: string; region: string };

type SendGridScopes = {
  scopes?: string[];
  errors?: { message?: string }[];
};

/** Fixed list on purpose: no user-supplied URL. */
const _SENDGRID_REGIONS: Record<string, string> = {
  global: "https://api.sendgrid.com",
  eu: "https://api.eu.sendgrid.com"
};

/** Probe: the key's own scopes (GET /v3/scopes). 403 is Restricted. */
const checkSendGridKey = async ({ apiKey, region }: SendGridConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const baseUrl = Object.hasOwn(_SENDGRID_REGIONS, region) ? _SENDGRID_REGIONS[region] : undefined;
      if (!baseUrl) {
        throw new Error("Unknown SendGrid region");
      }

      const res = await requestService<SendGridScopes>("SendGrid", `${baseUrl}/v3/scopes`, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      const message = redact(res.body?.errors?.[0]?.message ?? `SendGrid returned HTTP ${res.status}`, [apiKey]);

      if (res.status === 403) {
        return restricted(message);
      }
      if (!res.ok) {
        throw new Error(message);
      }

      const scopes = [...(res.body?.scopes ?? [])].sort();
      return valid(summarize({ canSendMail: scopes.includes("mail.send"), scopesCount: scopes.length, scopes }));
    }
  });

export { checkSendGridKey };
