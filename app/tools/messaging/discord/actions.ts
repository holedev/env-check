"use server";

import { handleErrorServerNoAuth } from "@/utils/handleErrorServer";

type DiscordConfig = {
  token: string;
};

const _DISCORD_API_BASE_URL = "https://discord.com/api/v10";

const checkDiscordConnection = async (config: DiscordConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      try {
        const response = await fetch(`${_DISCORD_API_BASE_URL}/users/@me`, {
          method: "GET",
          headers: {
            Authorization: `Bot ${config.token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(`Discord API error: ${response.statusText}`);
        }

        const userData = await response.json();

        return userData;
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Failed to connect to Discord");
      }
    }
  });

export { checkDiscordConnection };
