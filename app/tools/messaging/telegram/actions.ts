"use server";

import { redact, requestService, summarize, valid } from "@/lib/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";

type TelegramConfig = { token: string };

type TelegramGetMe = {
  ok: boolean;
  description?: string;
  result?: {
    id: number;
    first_name?: string;
    username?: string;
    can_join_groups?: boolean;
    can_read_all_group_messages?: boolean;
    supports_inline_queries?: boolean;
  };
};

/**
 * Probe: getMe. The token is part of the URL path, so neither the URL nor the
 * token may appear in an error: requestService() omits the URL and the
 * service's description is redacted.
 */
const checkTelegramToken = async ({ token }: TelegramConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      const res = await requestService<TelegramGetMe>(
        "Telegram",
        `https://api.telegram.org/bot${encodeURIComponent(token)}/getMe`
      );

      if (!(res.ok && res.body?.ok && res.body.result)) {
        throw new Error(redact(res.body?.description ?? `Telegram returned HTTP ${res.status}`, [token]));
      }

      const bot = res.body.result;
      return valid(
        summarize({
          username: bot.username ? `@${bot.username}` : undefined,
          name: bot.first_name,
          id: String(bot.id),
          canJoinGroups: bot.can_join_groups,
          canReadAllGroupMessages: bot.can_read_all_group_messages,
          supportsInlineQueries: bot.supports_inline_queries
        })
      );
    }
  });

export { checkTelegramToken };
