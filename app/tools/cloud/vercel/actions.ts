"use server";

import { redact, requestService, restricted, summarize, valid } from "@/lib/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type VercelConfig = { token: string };

type VercelUser = {
  user?: { username?: string; name?: string | null; billing?: { plan?: string } | null };
  error?: { code?: string; message?: string; invalidToken?: boolean };
};

const _VERCEL_USER_URL = "https://api.vercel.com/v2/user";

/** Probe: read the token's user. Vercel flags bad tokens with `invalidToken`; any other 403 is Restricted. */
const checkVercelToken = async ({ token }: VercelConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const res = await requestService<VercelUser>("Vercel", _VERCEL_USER_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const message = redact(res.body?.error?.message ?? `Vercel returned HTTP ${res.status}`, [token]);

      if (res.status === 403 && !res.body?.error?.invalidToken) {
        return restricted(message);
      }
      if (!(res.ok && res.body?.user)) {
        throw new Error(message);
      }

      const { user } = res.body;
      return valid(summarize({ username: user.username, name: user.name, plan: user.billing?.plan }));
    }
  });

export { checkVercelToken };
