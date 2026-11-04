"use server";

import { Octokit } from "@octokit/rest";
import { enumFact, redact, restricted, summarize, valid } from "@/lib/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type GithubToken = { token: string };

const tokenType = (token: string) => {
  if (token.startsWith("ghp_")) {
    return "classic";
  }
  if (token.startsWith("github_pat_")) {
    return "fineGrained";
  }
  if (token.startsWith("gho_")) {
    return "oauth";
  }
  return "other";
};

const statusOf = (error: unknown) =>
  typeof error === "object" && error !== null && "status" in error ? Number(error.status) : undefined;

/** Probe: GET /user. Classic tokens report their scopes in x-oauth-scopes. The email is not shown. */
const checkGithubToken = async ({ token }: GithubToken) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const type = enumFact("tokenType", "tokenTypes", tokenType(token));
      try {
        const { data, headers } = await new Octokit({ auth: token }).rest.users.getAuthenticated();
        const scopes = String(headers["x-oauth-scopes"] ?? "")
          .split(",")
          .map((scope) => scope.trim())
          .filter(Boolean);

        return valid([...summarize({ login: data.login, name: data.name }), type, ...summarize({ scopes })]);
      } catch (error) {
        const message = redact(error instanceof Error ? error.message : "Failed to reach GitHub", [token]);
        if (statusOf(error) === 403) {
          return restricted(message, [type]);
        }
        throw new Error(message);
      }
    }
  });

export { checkGithubToken };
