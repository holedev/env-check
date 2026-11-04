"use server";

import { MongoClient } from "mongodb";
import { connectionSecrets, redact, restricted, summarize, valid } from "@/lib/validation";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";
import { assertPublicConnectionString } from "@/utils/network-guard";

type MongoDbConfig = { connectionString: string };

const _SERVER_SELECTION_TIMEOUT_MS = 10_000;
const _UNAUTHORIZED = 13;

const codeOf = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error ? Number(error.code) : undefined;

/**
 * Probe: connect, list the default database's collections, then list databases.
 * A user that may read its database but not list databases (code 13) is Restricted.
 */
const checkMongoDbConnection = async ({ connectionString }: MongoDbConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      await assertPublicConnectionString(connectionString);
      const secrets = connectionSecrets(connectionString);
      const client = new MongoClient(connectionString, { serverSelectionTimeoutMS: _SERVER_SELECTION_TIMEOUT_MS });

      try {
        await client.connect();
        const db = client.db();
        const collections = (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name).sort();
        const facts = summarize({ database: db.databaseName, collectionsCount: collections.length, collections });

        try {
          const { databases } = await db.admin().listDatabases({ nameOnly: true });
          return valid([...facts, ...summarize({ databasesCount: databases.length })]);
        } catch (error) {
          if (codeOf(error) === _UNAUTHORIZED) {
            return restricted(redact(error instanceof Error ? error.message : "Not authorized", secrets), facts);
          }
          throw error;
        }
      } catch (error) {
        throw new Error(redact(error instanceof Error ? error.message : "Failed to connect to MongoDB", secrets));
      } finally {
        await client.close().catch(() => undefined);
      }
    }
  });

export { checkMongoDbConnection };
