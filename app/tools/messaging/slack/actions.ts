"use server";

import { enumFact, redact, requestService, restricted, summarize, valid } from "@/lib/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type SlackConfig = { token: string };

type SlackAuthTest = {
  ok: boolean;
  error?: string;
  team?: string;
  url?: string;
  user?: string;
};

const _SLACK_AUTH_TEST_URL = "https://slack.com/api/auth.test";

const tokenType = (token: string) => {
  if (token.startsWith("xoxb-")) {
    return "bot";
  }
  if (token.startsWith("xoxp-")) {
    return "user";
  }
  if (token.startsWith("xapp-")) {
    return "appLevel";
  }
  return "other";
};

/**
 * Probe: auth.test (read-only identity check; Slack only accepts POST). Slack
 * answers 200 with ok:false on failure. not_allowed_token_type means the token
 * authenticated but can't call Web API methods (app-level tokens): Restricted.
 */
const checkSlackToken = async ({ token }: SlackConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const res = await requestService<SlackAuthTest>("Slack", _SLACK_AUTH_TEST_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const type = enumFact("tokenType", "tokenTypes", tokenType(token));

      if (res.body?.error === "not_allowed_token_type") {
        return restricted("not_allowed_token_type", [type]);
      }
      if (!(res.ok && res.body?.ok)) {
        throw new Error(redact(res.body?.error ?? `Slack returned HTTP ${res.status}`, [token]));
      }

      const scopes = (res.headers.get("x-oauth-scopes") ?? "")
        .split(",")
        .map((scope) => scope.trim())
        .filter(Boolean);
      return valid([
        ...summarize({ team: res.body.team, url: res.body.url, user: res.body.user }),
        type,
        ...summarize({ scopes })
      ]);
    }
  });

export { checkSlackToken };
