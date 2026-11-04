"use server";

import { createClient } from "@supabase/supabase-js";
import { redact, restricted, summarize, valid } from "@/lib/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";
import { assertPublicHost } from "@/utils/network-guard";

type SupabaseConfig = { projectUrl: string; serviceRoleKey: string };

const parseProjectUrl = (projectUrl: string) => {
  try {
    const url = new URL(projectUrl);
    if (url.protocol === "https:" || url.protocol === "http:") {
      return url;
    }
  } catch {
    // fall through
  }
  throw new Error("Project URL must be an http(s) URL");
};

/**
 * Probe: auth.admin.listUsers({ perPage: 1 }), which only a service_role key may
 * call. An anon key authenticates but gets 403: Restricted. The project URL is
 * user-supplied (self-hosted Supabase), so it goes through the network guard.
 */
const checkSupabaseCredentials = async ({ projectUrl, serviceRoleKey }: SupabaseConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const url = parseProjectUrl(projectUrl);
      await assertPublicHost(url.hostname);
      const project = summarize({ project: url.host });

      const supabase = createClient(url.origin, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

      if (error) {
        const message = redact(error.message, [serviceRoleKey]);
        if (error.status === 403) {
          return restricted(message, [...project, { key: "adminAccess", value: false }]);
        }
        throw new Error(message);
      }

      return valid([...project, { key: "adminAccess", value: true }]);
    }
  });

export { checkSupabaseCredentials };
