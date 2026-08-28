"use server";

import { createClient } from "@supabase/supabase-js";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type SupabaseConfig = {
  projectUrl: string;
  serviceRoleKey: string;
};

const checkSupabaseCredentials = async (config: SupabaseConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      try {
        const supabase = createClient(config.projectUrl, config.serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false }
        });

        const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

        if (error) {
          throw new Error(error.message);
        }

        return {
          success: true,
          userCount: data.users.length
        };
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Failed to connect to Supabase");
      }
    }
  });

export { checkSupabaseCredentials };
