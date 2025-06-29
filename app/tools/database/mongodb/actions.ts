"use server";

import { handleErrorServerNoAuth } from "@/utils/handleErrorServer";
import { MongoClient } from "mongodb";

interface MongoDbConfig {
  connectionString: string;
}

const checkMongoDbConnection = async (config: MongoDbConfig) =>
  handleErrorServerNoAuth({
    cb: async () => {
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
