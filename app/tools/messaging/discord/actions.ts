"use server";

import { redact, requestService, summarize, valid } from "@/lib/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type DiscordConfig = { token: string };

type DiscordUser = {
  id?: string;
  username?: string;
  bot?: boolean;
  public_flags?: number;
  message?: string;
};

const _DISCORD_ME_URL = "https://discord.com/api/v10/users/@me";
/** public_flags bit 16 (VERIFIED_BOT). */
const _VERIFIED_BOT_FLAG = 65_536;

const hasFlag = (flags: number, flag: number) => Math.floor(flags / flag) % 2 === 1;

/** Probe: the bot's own user (GET /users/@me with `Bot` auth). */
const checkDiscordConnection = async ({ token }: DiscordConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const res = await requestService<DiscordUser>("Discord", _DISCORD_ME_URL, {
        headers: { Authorization: `Bot ${token}` }
      });

      if (!(res.ok && res.body?.id)) {
        throw new Error(redact(res.body?.message ?? `Discord returned HTTP ${res.status}`, [token]));
      }

      const { id, username, public_flags: flags = 0 } = res.body;
      return valid(summarize({ username, id, verified: hasFlag(flags, _VERIFIED_BOT_FLAG) }));
    }
  });

export { checkDiscordConnection };
