"use server";

import { Client } from "pg";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";
import { assertPublicConnectionString } from "@/utils/network-guard";

type PostgreSqlConfig = {
  connectionString: string;
};

const checkPostgreSqlConnection = async (config: PostgreSqlConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      await assertPublicConnectionString(config.connectionString);
      const client = new Client({ connectionString: config.connectionString });

      try {
        await client.connect();
        const res = await client.query(
          "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
        );

        return {
          success: true,
          tables: res.rows.map((row) => row.table_name as string),
          tablesCount: res.rows.length
        };
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Failed to connect to PostgreSQL");
      } finally {
        await client.end();
      }
    }
  });

export { checkPostgreSqlConnection };
