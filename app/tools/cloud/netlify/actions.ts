"use server";

import { redact, requestService, summarize, valid } from "@/lib/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type NetlifyConfig = { token: string };

type NetlifyUser = {
  id?: string;
  full_name?: string | null;
  site_count?: number;
  message?: string;
};

const _NETLIFY_USER_URL = "https://api.netlify.com/api/v1/user";

/** Probe: read the token's user (GET /api/v1/user). The account email is not shown. */
const checkNetlifyToken = async ({ token }: NetlifyConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const res = await requestService<NetlifyUser>("Netlify", _NETLIFY_USER_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!(res.ok && res.body?.id)) {
        throw new Error(redact(res.body?.message ?? `Netlify returned HTTP ${res.status}`, [token]));
      }

      return valid(summarize({ name: res.body.full_name, siteCount: res.body.site_count }));
    }
  });

export { checkNetlifyToken };
