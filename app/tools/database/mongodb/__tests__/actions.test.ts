/**
 * @jest-environment node
 */
import { MongoClient } from "mongodb";
import { assertPublicConnectionString } from "@/utils/network-guard";
import { checkMongoDbConnection } from "../actions";

jest.mock("mongodb", () => ({ MongoClient: jest.fn() }));
jest.mock("@/utils/network-guard", () => ({ assertPublicConnectionString: jest.fn() }));

const MockMongoClient = MongoClient as unknown as jest.Mock;
const guard = assertPublicConnectionString as jest.Mock;
const URI = "mongodb+srv://app:s3cr3t-pass@cluster0.example.net/shop";

const fakeClient = ({ connect, listDatabases }: { connect?: jest.Mock; listDatabases?: jest.Mock } = {}) => {
  const client = {
    connect: connect ?? jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    db: () => ({
      databaseName: "shop",
      listCollections: () => ({ toArray: jest.fn().mockResolvedValue([{ name: "orders" }, { name: "carts" }]) }),
      admin: () => ({
        listDatabases:
          listDatabases ?? jest.fn().mockResolvedValue({ databases: [{ name: "shop" }, { name: "admin" }] })
      })
    })
  };
  MockMongoClient.mockImplementation(() => client);
  return client;
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

describe("checkMongoDbConnection", () => {
  it("is valid and summarises the default database", async () => {
    const client = fakeClient();

    const result = await checkMongoDbConnection({ connectionString: URI });

    expect(guard).toHaveBeenCalledWith(URI);
    expect(MockMongoClient).toHaveBeenCalledWith(URI, { serverSelectionTimeoutMS: 10_000 });
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "database", value: "shop" },
        { key: "collectionsCount", value: 2 },
        { key: "collections", value: ["carts", "orders"] },
        { key: "databasesCount", value: 2 }
      ]
    });
    expect(client.close).toHaveBeenCalled();
  });

  it("is restricted when the user may not list databases", async () => {
    fakeClient({
      listDatabases: jest
        .fn()
        .mockRejectedValue(Object.assign(new Error("not authorized on admin to execute command"), { code: 13 }))
    });

    const result = await checkMongoDbConnection({ connectionString: URI });

    expect(result.data?.payload).toMatchObject({
      outcome: "restricted",
      reason: "not authorized on admin to execute command",
      summary: [{ key: "database", value: "shop" }, { key: "collectionsCount" }, { key: "collections" }]
    });
  });

  it("is invalid on bad auth, without leaking the password", async () => {
    fakeClient({ connect: jest.fn().mockRejectedValue(new Error(`bad auth : Authentication failed (${URI})`)) });

    const result = await checkMongoDbConnection({ connectionString: URI });

    expect(result.data).toBeNull();
    expect(result.error?.message).toContain("Authentication failed");
    expect(result.error?.message).not.toContain("s3cr3t-pass");
  });

  it("does not connect when the host is private", async () => {
    guard.mockRejectedValue(new Error("Connections to private or internal network addresses are blocked."));

    const result = await checkMongoDbConnection({ connectionString: "mongodb://127.0.0.1:27017" });

    expect(MockMongoClient).not.toHaveBeenCalled();
    expect(result.error?.message).toContain("private or internal network");
  });
});
