"use server";

import { enumFact, redact, requestService, summarize, valid } from "@/lib/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type CloudflareConfig = { apiToken: string };

type CloudflareVerify = {
  success?: boolean;
  result?: { status?: string; expires_on?: string; not_before?: string };
  errors?: { message?: string }[];
};

const _CLOUDFLARE_VERIFY_URL = "https://api.cloudflare.com/client/v4/user/tokens/verify";

/** Probe: the token-verify endpoint. Only an `active` token counts as valid. */
const checkCloudflareToken = async ({ apiToken }: CloudflareConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const res = await requestService<CloudflareVerify>("Cloudflare", _CLOUDFLARE_VERIFY_URL, {
        headers: { Authorization: `Bearer ${apiToken}` }
      });
      const body = res.body;

      if (!(res.ok && body?.success && body.result)) {
        throw new Error(redact(body?.errors?.[0]?.message ?? `Cloudflare returned HTTP ${res.status}`, [apiToken]));
      }
      if (body.result.status !== "active") {
        throw new Error(`Token is ${body.result.status ?? "not active"}`);
      }

      return valid([
        enumFact("status", "statuses", "active"),
        ...summarize({ expiresOn: body.result.expires_on, notBefore: body.result.not_before })
      ]);
    }
  });

export { checkCloudflareToken };
