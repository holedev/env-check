import { checkMongoDbConnection } from "../actions";

// Mock the mongodb MongoClient
jest.mock("mongodb", () => ({
  MongoClient: jest.fn()
}));

// Mock the error handler
jest.mock("@/utils/handle-error-server", () => ({
  handleErrorServerNoAuth: jest.fn()
}));

type Cb = { cb: () => Promise<object> };

const passThrough = async ({ cb }: Cb) => {
  const result = await cb();
  return { error: null, data: { payload: result } };
};

const catchError = async ({ cb }: Cb) => {
  try {
    await cb();
    return { error: null, data: { payload: {} } };
  } catch (error) {
    return { error: { message: error instanceof Error ? error.message : "Unknown error" }, data: null };
  }
};

const buildClient = ({
  connect = jest.fn().mockResolvedValue(undefined),
  close = jest.fn().mockResolvedValue(undefined),
  collections = [{ name: "users" }, { name: "posts" }],
  databases = [{ name: "admin" }, { name: "app" }]
}: {
  connect?: jest.Mock;
  close?: jest.Mock;
  collections?: { name: string }[];
  databases?: { name: string }[];
} = {}) => {
  const db = jest.fn(() => ({
    listCollections: () => ({ toArray: jest.fn().mockResolvedValue(collections) }),
    admin: () => ({ listDatabases: jest.fn().mockResolvedValue({ databases }) })
  }));
  return { connect, close, db };
};

describe("MongoDB Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkMongoDbConnection", () => {
    it("should return collections and databases when the connection is valid", async () => {
      const client = buildClient();
      const { MongoClient } = require("mongodb");
      MongoClient.mockImplementation(() => client);

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(passThrough);

      const result = await checkMongoDbConnection({ connectionString: "mongodb+srv://user:pass@host/db" });

      expect(result.error).toBeNull();
      expect(result.data?.payload).toMatchObject({
        success: true,
        collections: ["users", "posts"],
        databases: ["admin", "app"],
        collectionsCount: 2,
        databasesCount: 2
      });
      expect(client.close).toHaveBeenCalled();
    });

    it("should return an error when the connection fails", async () => {
      const client = buildClient({ connect: jest.fn().mockRejectedValue(new Error("Authentication failed")) });
      const { MongoClient } = require("mongodb");
      MongoClient.mockImplementation(() => client);

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(catchError);

      const result = await checkMongoDbConnection({ connectionString: "mongodb+srv://user:wrong@host/db" });

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe("Authentication failed");
      expect(client.close).toHaveBeenCalled();
    });

    it("should return an error on network failure", async () => {
      const client = buildClient({
        connect: jest.fn().mockRejectedValue(new Error("getaddrinfo ENOTFOUND unknown-host"))
      });
      const { MongoClient } = require("mongodb");
      MongoClient.mockImplementation(() => client);

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(catchError);

      const result = await checkMongoDbConnection({ connectionString: "mongodb+srv://user:pass@unknown-host/db" });

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe("getaddrinfo ENOTFOUND unknown-host");
    });

    it("should instantiate MongoClient with the provided connection string", async () => {
      const client = buildClient();
      const { MongoClient } = require("mongodb");
      MongoClient.mockImplementation(() => client);

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(passThrough);

      const connectionString = "mongodb+srv://admin:secret@cluster.example.com/mydb";
      await checkMongoDbConnection({ connectionString });

      expect(MongoClient).toHaveBeenCalledWith(connectionString);
    });
  });
});
