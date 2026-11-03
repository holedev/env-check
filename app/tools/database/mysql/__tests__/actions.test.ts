/**
 * @jest-environment node
 */
import mysql from "mysql2/promise";
import { assertPublicConnectionString } from "@/utils/network-guard";
import { checkMySqlConnection } from "../actions";

jest.mock("mysql2/promise", () => ({ __esModule: true, default: { createConnection: jest.fn() } }));
jest.mock("@/utils/network-guard", () => ({ assertPublicConnectionString: jest.fn() }));

const createConnection = mysql.createConnection as unknown as jest.Mock;
const guard = assertPublicConnectionString as jest.Mock;
const URI = "mysql://app:p%40ss-word!@db.example.com:3306/shop";

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

describe("checkMySqlConnection", () => {
  it("is valid and reports version, database and user", async () => {
    const end = jest.fn().mockResolvedValue(undefined);
    createConnection.mockResolvedValue({
      query: jest.fn().mockResolvedValue([[{ version: "8.4.3", database: "shop", user: "app@%" }]]),
      end
    });

    const result = await checkMySqlConnection({ connectionString: URI });

    expect(guard).toHaveBeenCalledWith(URI);
    expect(createConnection).toHaveBeenCalledWith({ uri: URI, connectTimeout: 10_000 });
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "version", value: "8.4.3" },
        { key: "database", value: "shop" },
        { key: "user", value: "app@%" }
      ]
    });
    expect(end).toHaveBeenCalled();
  });

  it("is invalid on access denied, without leaking the password", async () => {
    createConnection.mockRejectedValue(
      new Error(`Access denied for user 'app'@'1.2.3.4' (using password: YES) uri=${URI} pass=p@ss-word!`)
    );

    const result = await checkMySqlConnection({ connectionString: URI });

    expect(result.data).toBeNull();
    expect(result.error?.message).toContain("Access denied for user 'app'");
    expect(result.error?.message).not.toContain("p@ss-word!");
    expect(result.error?.message).not.toContain("p%40ss-word!");
  });

  it("does not connect when the host is private", async () => {
    guard.mockRejectedValue(new Error("Connections to private or internal network addresses are blocked."));

    const result = await checkMySqlConnection({ connectionString: "mysql://root@127.0.0.1/mysql" });

    expect(createConnection).not.toHaveBeenCalled();
    expect(result.error?.message).toContain("private or internal network");
  });
});
