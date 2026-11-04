"use server";

import mysql, { type Connection, type RowDataPacket } from "mysql2/promise";
import { connectionSecrets, redact, summarize, valid } from "@/lib/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";
import { assertPublicConnectionString } from "@/utils/network-guard";

type MySqlConfig = { connectionString: string };

type ServerInfo = RowDataPacket & { version: string; database: string | null; user: string };

const _CONNECT_TIMEOUT_MS = 10_000;

/** Probe: connect and read server version, current database and user (read-only). */
const checkMySqlConnection = async ({ connectionString }: MySqlConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      await assertPublicConnectionString(connectionString);

      let connection: Connection | undefined;
      try {
        connection = await mysql.createConnection({ uri: connectionString, connectTimeout: _CONNECT_TIMEOUT_MS });
        const [rows] = await connection.query<ServerInfo[]>(
          "SELECT VERSION() AS version, DATABASE() AS `database`, CURRENT_USER() AS user"
        );
        const info = rows[0];
        return valid(summarize({ version: info?.version, database: info?.database, user: info?.user }));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to connect to MySQL";
        throw new Error(redact(message, connectionSecrets(connectionString)));
      } finally {
        await connection?.end().catch(() => undefined);
      }
    }
  });

export { checkMySqlConnection };
