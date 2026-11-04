"use server";

import { enumFact, redact, requestService, summarize, valid } from "@/lib/validation";
import type { SummaryItem } from "@/types/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type HuggingFaceConfig = { token: string };

type WhoAmI = {
  name?: string;
  orgs?: { name: string }[];
  auth?: { accessToken?: { displayName?: string; role?: string } };
  error?: string;
};

const _HF_WHOAMI_URL = "https://huggingface.co/api/whoami-v2";
const _ROLES = new Set(["read", "write", "fineGrained"]);

/** Probe: whoami-v2, which names the user, the token and its permission. The email is not shown. */
const checkHuggingFaceToken = async ({ token }: HuggingFaceConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const res = await requestService<WhoAmI>("Hugging Face", _HF_WHOAMI_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!(res.ok && res.body?.name)) {
        throw new Error(redact(res.body?.error ?? `Hugging Face returned HTTP ${res.status}`, [token]));
      }

      const { name, orgs = [], auth } = res.body;
      const role = auth?.accessToken?.role;
      const roleFact: SummaryItem[] = role && _ROLES.has(role) ? [enumFact("role", "roles", role)] : [];

      return valid([
        ...summarize({ user: name, tokenName: auth?.accessToken?.displayName }),
        ...roleFact,
        ...summarize({ orgs: orgs.map((org) => org.name) })
      ]);
    }
  });

export { checkHuggingFaceToken };
