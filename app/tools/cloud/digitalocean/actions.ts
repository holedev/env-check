"use server";

import { enumFact, redact, requestService, restricted, summarize, valid } from "@/lib/validation";
import type { SummaryItem } from "@/types/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type DigitalOceanConfig = { token: string };

type DigitalOceanAccount = {
  account?: {
    droplet_limit?: number;
    email_verified?: boolean;
    status?: string;
    team?: { name?: string } | null;
  };
  id?: string;
  message?: string;
};

const _DO_ACCOUNT_URL = "https://api.digitalocean.com/v2/account";
const _STATUSES = new Set(["active", "warning", "locked"]);

/** Probe: read the account (GET /v2/account). 403 = scoped token without account:read. Email not shown. */
const checkDigitalOceanToken = async ({ token }: DigitalOceanConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const res = await requestService<DigitalOceanAccount>("DigitalOcean", _DO_ACCOUNT_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const message = redact(res.body?.message ?? `DigitalOcean returned HTTP ${res.status}`, [token]);

      if (res.status === 403) {
        return restricted(message);
      }
      if (!(res.ok && res.body?.account)) {
        throw new Error(message);
      }

      const { account } = res.body;
      const status: SummaryItem[] =
        account.status && _STATUSES.has(account.status) ? [enumFact("status", "statuses", account.status)] : [];

      return valid([
        ...summarize({ team: account.team?.name }),
        ...status,
        ...summarize({ dropletLimit: account.droplet_limit, emailVerified: account.email_verified })
      ]);
    }
  });

export { checkDigitalOceanToken };
