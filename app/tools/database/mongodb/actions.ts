"use server";

import { MongoClient } from "mongodb";
import { handleErrorServerNoAuth } from "@/utils/handle-error-server";
import { assertPublicConnectionString } from "@/utils/network-guard";

type MongoDbConfig = {
  connectionString: string;
};

const checkMongoDbConnection = async (config: MongoDbConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
      await assertPublicConnectionString(config.connectionString);
      const client = new MongoClient(config.connectionString);

      try {
        await client.connect();
        const db = client.db();
        const collections = await db.listCollections().toArray();
        const databases = await client.db().admin().listDatabases();

        const result = {
          success: true,
          collections: collections.map((col) => col.name),
          databases: databases.databases.map((db) => db.name),
          collectionsCount: collections.length,
          databasesCount: databases.databases.length
        };

        return result;
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : "Failed to connect to MongoDB");
      } finally {
        await client.close();
      }
    }
  });

export { checkMongoDbConnection };
