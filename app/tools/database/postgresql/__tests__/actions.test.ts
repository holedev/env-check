/**
 * @jest-environment node
 */
import { Client } from "pg";
import { assertPublicConnectionString } from "@/utils/network-guard";
import { checkPostgreSqlConnection } from "../actions";

jest.mock("pg", () => ({ Client: jest.fn() }));
jest.mock("@/utils/network-guard", () => ({ assertPublicConnectionString: jest.fn() }));

const MockClient = Client as unknown as jest.Mock;
const guard = assertPublicConnectionString as jest.Mock;
const URI = "postgresql://app:p%40ssw0rd@db.example.com:5432/shop";

const fakeClient = ({ connect, query }: { connect?: jest.Mock; query?: jest.Mock } = {}) => {
  const client = {
    connect: connect ?? jest.fn().mockResolvedValue(undefined),
    query: query ?? jest.fn().mockResolvedValue({ rows: [{ table_name: "orders" }, { table_name: "users" }] }),
    end: jest.fn().mockResolvedValue(undefined)
  };
  MockClient.mockImplementation(() => client);
  return client;
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

describe("checkPostgreSqlConnection", () => {
  it("is valid and lists the public tables", async () => {
    const client = fakeClient();

    const result = await checkPostgreSqlConnection({ connectionString: URI });

    expect(guard).toHaveBeenCalledWith(URI);
    expect(MockClient).toHaveBeenCalledWith({ connectionString: URI, connectionTimeoutMillis: 10_000 });
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "tablesCount", value: 2 },
        { key: "tables", value: ["orders", "users"] }
      ]
    });
    expect(client.end).toHaveBeenCalled();
  });

  it("is invalid on bad credentials, without leaking the password", async () => {
    const client = fakeClient({
      connect: jest.fn().mockRejectedValue(new Error('password authentication failed for user "app" (p@ssw0rd)'))
    });

    const result = await checkPostgreSqlConnection({ connectionString: URI });

    expect(result.data).toBeNull();
    expect(result.error?.message).toBe('password authentication failed for user "app" (***)');
    expect(client.end).toHaveBeenCalled();
  });

  it("does not connect when the host is private", async () => {
    guard.mockRejectedValue(new Error("Connections to private or internal network addresses are blocked."));

    const result = await checkPostgreSqlConnection({ connectionString: "postgresql://u:p@127.0.0.1/db" });

    expect(MockClient).not.toHaveBeenCalled();
    expect(result.error?.message).toContain("private or internal network");
  });
});
