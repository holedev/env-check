"use server";

import { Client } from "pg";
import { connectionSecrets, redact, summarize, valid } from "@/lib/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";
import { assertPublicConnectionString } from "@/utils/network-guard";

type PostgreSqlConfig = { connectionString: string };

const _CONNECT_TIMEOUT_MS = 10_000;
const _TABLES_QUERY =
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name";

/** Probe: connect and list the tables in `public` (read-only). */
const checkPostgreSqlConnection = async ({ connectionString }: PostgreSqlConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      await assertPublicConnectionString(connectionString);
      const client = new Client({ connectionString, connectionTimeoutMillis: _CONNECT_TIMEOUT_MS });

      try {
        await client.connect();
        const res = await client.query<{ table_name: string }>(_TABLES_QUERY);
        const tables = res.rows.map((row) => row.table_name);
        return valid(summarize({ tablesCount: tables.length, tables }));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to connect to PostgreSQL";
        throw new Error(redact(message, connectionSecrets(connectionString)));
      } finally {
        await client.end().catch(() => undefined);
      }
    }
  });

export { checkPostgreSqlConnection };
