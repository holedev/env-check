"use server";

import { enumFact, redact, requestService, summarize, valid } from "@/lib/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type SentryConfig = { token: string; region: string };

type SentryRoot = {
  auth?: { scopes?: string[] } | null;
  user?: { username?: string; name?: string } | null;
  detail?: string;
};

/** Fixed list on purpose: no user-supplied URL, so no SSRF. Self-hosted Sentry is out of scope. */
const _SENTRY_REGIONS: Record<string, string> = {
  us: "https://sentry.io",
  eu: "https://de.sentry.io"
};

const tokenType = (token: string) => {
  if (token.startsWith("sntrys_")) {
    return "organization";
  }
  if (token.startsWith("sntryu_")) {
    return "user";
  }
  return "legacy";
};

/** Probe: the API root, which echoes the token's scopes. `auth: null` means the token was ignored. */
const checkSentryToken = async ({ token, region }: SentryConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const baseUrl = Object.hasOwn(_SENTRY_REGIONS, region) ? _SENTRY_REGIONS[region] : undefined;
      if (!baseUrl) {
        throw new Error("Unknown Sentry region");
      }

      const res = await requestService<SentryRoot>("Sentry", `${baseUrl}/api/0/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!(res.ok && res.body?.auth)) {
        throw new Error(redact(res.body?.detail ?? `Sentry returned HTTP ${res.status}`, [token]));
      }

      return valid([
        enumFact("tokenType", "tokenTypes", tokenType(token)),
        ...summarize({
          user: res.body.user?.username ?? res.body.user?.name,
          scopes: res.body.auth.scopes ?? []
        })
      ]);
    }
  });

export { checkSentryToken };
