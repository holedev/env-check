"use server";

import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type CloudflareConfig = {
  apiToken: string;
};

const _CLOUDFLARE_VERIFY_URL = "https://api.cloudflare.com/client/v4/user/tokens/verify";

const checkCloudflareToken = async (config: CloudflareConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      try {
        const response = await fetch(_CLOUDFLARE_VERIFY_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${config.apiToken}`,
            "Content-Type": "application/json"
          }
        });

        const body = await response.json();

        if (!response.ok || body.success === false) {
          const message = body?.errors?.[0]?.message ?? `Cloudflare API error: ${response.statusText}`;
          throw new Error(message);
        }

        return body.result as { id: string; status: string };
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Failed to connect to Cloudflare");
      }
    }
  });

export { checkCloudflareToken };
