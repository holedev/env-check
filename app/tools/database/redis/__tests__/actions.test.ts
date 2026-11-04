/**
 * @jest-environment node
 */
import { createClient } from "redis";
import { assertPublicConnectionString } from "@/utils/network-guard";
import { checkRedisConnection } from "../actions";

jest.mock("redis", () => ({ createClient: jest.fn() }));
jest.mock("@/utils/network-guard", () => ({ assertPublicConnectionString: jest.fn() }));

const mockCreateClient = createClient as unknown as jest.Mock;
const guard = assertPublicConnectionString as jest.Mock;
const URL = "rediss://default:s3cr3t-pass@cache.example.com:6379";

const fakeClient = (overrides: Partial<Record<"connect" | "ping" | "info", jest.Mock>> = {}) => {
  const client = {
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    ping: jest.fn().mockResolvedValue("PONG"),
    info: jest.fn().mockResolvedValue("# Server\r\nredis_version:7.4.1\r\nredis_mode:standalone\r\n"),
    destroy: jest.fn(),
    ...overrides
  };
  mockCreateClient.mockReturnValue(client);
  return client;
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

describe("checkRedisConnection", () => {
  it("is valid and reports PING, server, version and mode", async () => {
    const client = fakeClient();

    const result = await checkRedisConnection({ connectionString: URL });

    expect(guard).toHaveBeenCalledWith(URL);
    expect(mockCreateClient).toHaveBeenCalledWith({
      url: URL,
      socket: { connectTimeout: 10_000, reconnectStrategy: false }
    });
    expect(client.on).toHaveBeenCalledWith("error", expect.any(Function));
    expect(result.data?.payload).toEqual({
      outcome: "valid",
      summary: [
        { key: "ping", value: "PONG" },
        { key: "server", value: "Redis" },
        { key: "version", value: "7.4.1" },
        { key: "mode", value: "standalone" }
      ]
    });
    expect(client.destroy).toHaveBeenCalled();
  });

  it("recognises Valkey", async () => {
    fakeClient({ info: jest.fn().mockResolvedValue("valkey_version:8.1.0\r\nserver_mode:cluster\r\n") });

    const result = await checkRedisConnection({ connectionString: URL });

    expect(result.data?.payload).toMatchObject({
      summary: [
        { key: "ping" },
        { key: "server", value: "Valkey" },
        { key: "version", value: "8.1.0" },
        { key: "mode", value: "cluster" }
      ]
    });
  });

  it("is restricted when an ACL user can't run INFO", async () => {
    fakeClient({
      info: jest.fn().mockRejectedValue(new Error("NOPERM User app has no permissions to run the 'info' command"))
    });

    const result = await checkRedisConnection({ connectionString: URL });

    expect(result.data?.payload).toEqual({
      outcome: "restricted",
      reason: "NOPERM User app has no permissions to run the 'info' command",
      summary: []
    });
  });

  it("is invalid on WRONGPASS, without leaking the password", async () => {
    const client = fakeClient({
      connect: jest.fn().mockRejectedValue(new Error(`WRONGPASS invalid username-password pair (${URL})`))
    });

    const result = await checkRedisConnection({ connectionString: URL });

    expect(result.data).toBeNull();
    expect(result.error?.message).toContain("WRONGPASS");
    expect(result.error?.message).not.toContain("s3cr3t-pass");
    expect(client.destroy).toHaveBeenCalled();
  });

  it("does not connect when the host is private", async () => {
    guard.mockRejectedValue(new Error("Connections to private or internal network addresses are blocked."));

    const result = await checkRedisConnection({ connectionString: "redis://127.0.0.1:6379" });

    expect(mockCreateClient).not.toHaveBeenCalled();
    expect(result.error?.message).toContain("private or internal network");
  });
});
