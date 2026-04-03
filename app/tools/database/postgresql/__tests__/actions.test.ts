import { checkPostgreSqlConnection } from "../actions";

// Mock the pg Client
jest.mock("pg", () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      connect: jest.fn(),
      query: jest.fn(),
      end: jest.fn()
    }))
  };
});

// Mock the error handler
jest.mock("@/utils/handle-error-server", () => ({
  handleErrorServerNoAuth: jest.fn()
}));

describe("PostgreSQL Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkPostgreSqlConnection", () => {
    it("should return success with tables when connection is valid", async () => {
      const mockConnect = jest.fn().mockResolvedValue(undefined);
      const mockQuery = jest.fn().mockResolvedValue({
        rows: [{ table_name: "users" }, { table_name: "posts" }]
      });
      const mockEnd = jest.fn().mockResolvedValue(undefined);

      const { Client } = require("pg");
      Client.mockImplementation(() => ({
        connect: mockConnect,
        query: mockQuery,
        end: mockEnd
      }));

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(async ({ cb }: { cb: () => Promise<object> }) => {
        const result = await cb();
        return { error: null, data: { payload: result } };
      });

      const result = await checkPostgreSqlConnection({ connectionString: "postgresql://user:pass@host:5432/db" });

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.payload).toMatchObject({
        success: true,
        tables: ["users", "posts"],
        tablesCount: 2
      });
      expect(mockEnd).toHaveBeenCalled();
    });

    it("should return error when connection fails", async () => {
      const mockConnect = jest.fn().mockRejectedValue(new Error("connection refused"));
      const mockEnd = jest.fn().mockResolvedValue(undefined);

      const { Client } = require("pg");
      Client.mockImplementation(() => ({
        connect: mockConnect,
        query: jest.fn(),
        end: mockEnd
      }));

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(async ({ cb }: { cb: () => Promise<object> }) => {
        try {
          await cb();
        } catch (error) {
          return { error: { message: error instanceof Error ? error.message : "Unknown error" }, data: null };
        }
      });

      const result = await checkPostgreSqlConnection({ connectionString: "postgresql://user:wrong@host:5432/db" });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("connection refused");
      expect(result.data).toBeNull();
      expect(mockEnd).toHaveBeenCalled();
    });

    it("should return error on network failure", async () => {
      const mockConnect = jest.fn().mockRejectedValue(new Error("getaddrinfo ENOTFOUND unknown-host"));
      const mockEnd = jest.fn().mockResolvedValue(undefined);

      const { Client } = require("pg");
      Client.mockImplementation(() => ({
        connect: mockConnect,
        query: jest.fn(),
        end: mockEnd
      }));

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(async ({ cb }: { cb: () => Promise<object> }) => {
        try {
          await cb();
        } catch (error) {
          return { error: { message: error instanceof Error ? error.message : "Unknown error" }, data: null };
        }
      });

      const result = await checkPostgreSqlConnection({
        connectionString: "postgresql://user:pass@unknown-host:5432/db"
      });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("getaddrinfo ENOTFOUND unknown-host");
      expect(result.data).toBeNull();
    });

    it("should instantiate Client with the provided connection string", async () => {
      const mockConnect = jest.fn().mockResolvedValue(undefined);
      const mockQuery = jest.fn().mockResolvedValue({ rows: [] });
      const mockEnd = jest.fn().mockResolvedValue(undefined);

      const { Client } = require("pg");
      Client.mockImplementation(() => ({
        connect: mockConnect,
        query: mockQuery,
        end: mockEnd
      }));

      const { handleErrorServerNoAuth } = require("@/utils/handle-error-server");
      handleErrorServerNoAuth.mockImplementation(async ({ cb }: { cb: () => Promise<object> }) => {
        const result = await cb();
        return { error: null, data: { payload: result } };
      });

      const connectionString = "postgresql://admin:secret@db.example.com:5432/mydb";
      await checkPostgreSqlConnection({ connectionString });

      expect(Client).toHaveBeenCalledWith({ connectionString });
    });
  });
});
