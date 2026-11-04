"use server";

import { createClient } from "redis";
import { connectionSecrets, redact, restricted, summarize, valid } from "@/lib/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";
import { assertPublicConnectionString } from "@/utils/network-guard";

type RedisConfig = { connectionString: string };

const _CONNECT_TIMEOUT_MS = 10_000;
const _INFO_LINE = /^(\w+):(.*)$/;
const _NEWLINE = /\r?\n/;

/** Parses the `key:value` lines of an INFO reply. */
const parseInfo = (info: string): Record<string, string> =>
  Object.fromEntries(
    info
      .split(_NEWLINE)
      .map((line) => line.match(_INFO_LINE))
      .filter((match): match is RegExpMatchArray => match !== null)
      .map(([, key, value]) => [key, value.trim()])
  );

/**
 * Probe: connect (AUTH happens here), PING, then INFO server for the version.
 * A NOPERM after a successful connect means an ACL user without INFO: Restricted.
 */
const checkRedisConnection = async ({ connectionString }: RedisConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      await assertPublicConnectionString(connectionString);
      const secrets = connectionSecrets(connectionString);
      const client = createClient({
        url: connectionString,
        socket: { connectTimeout: _CONNECT_TIMEOUT_MS, reconnectStrategy: false }
      });
      // Without a listener, socket errors are thrown as unhandled 'error' events.
      client.on("error", () => undefined);

      let connected = false;
      try {
        await client.connect();
        connected = true;
        const ping = await client.ping();
        const info = parseInfo(await client.info("server"));
        const isValkey = "valkey_version" in info;

        return valid(
          summarize({
            ping,
            server: isValkey ? "Valkey" : "Redis",
            version: info.valkey_version ?? info.redis_version,
            mode: info.redis_mode ?? info.server_mode
          })
        );
      } catch (error) {
        const message = redact(error instanceof Error ? error.message : "Failed to connect to Redis", secrets);
        if (connected && message.startsWith("NOPERM")) {
          return restricted(message);
        }
        throw new Error(message);
      } finally {
        client.destroy();
      }
    }
  });

export { checkRedisConnection };
