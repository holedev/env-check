/**
 * @jest-environment node
 */
import { lookup, resolveSrv } from "node:dns/promises";
import {
  assertPublicConnectionString,
  assertPublicHost,
  hostsFromConnectionString,
  isPrivateAddress,
  PRIVATE_NETWORK_ERROR
} from "@/utils/network-guard";

jest.mock("node:dns/promises", () => ({ lookup: jest.fn(), resolveSrv: jest.fn() }));

const mockLookup = lookup as unknown as jest.Mock;
const mockResolveSrv = resolveSrv as unknown as jest.Mock;

const resolvesTo = (...addresses: string[]) =>
  mockLookup.mockResolvedValueOnce(addresses.map((address) => ({ address, family: address.includes(":") ? 6 : 4 })));

beforeEach(() => {
  jest.resetAllMocks();
  delete process.env.ALLOW_PRIVATE_NETWORK;
});

describe("isPrivateAddress", () => {
  it.each([
    "127.0.0.1",
    "10.1.2.3",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.1.10",
    "169.254.169.254",
    "100.64.0.1",
    "0.0.0.0",
    "::1",
    "fd00::1",
    "fe80::1",
    "::ffff:127.0.0.1",
    "::ffff:10.0.0.1"
  ])("blocks %s", (address) => {
    expect(isPrivateAddress(address)).toBe(true);
  });

  it.each(["8.8.8.8", "172.32.0.1", "52.1.2.3", "2606:4700::1111", "::ffff:8.8.8.8"])("allows %s", (address) => {
    expect(isPrivateAddress(address)).toBe(false);
  });
});

describe("assertPublicHost", () => {
  it("allows a name that resolves only to public addresses", async () => {
    resolvesTo("93.184.216.34", "2606:2800::1");
    await expect(assertPublicHost("db.example.com")).resolves.toBeUndefined();
  });

  it("blocks a name if any resolved address is private", async () => {
    resolvesTo("93.184.216.34", "10.0.0.5");
    await expect(assertPublicHost("db.example.com")).rejects.toThrow(PRIVATE_NETWORK_ERROR);
  });

  it("blocks IP literals and bracketed IPv6 without a DNS lookup", async () => {
    await expect(assertPublicHost("127.0.0.1")).rejects.toThrow(PRIVATE_NETWORK_ERROR);
    await expect(assertPublicHost("[::1]")).rejects.toThrow(PRIVATE_NETWORK_ERROR);
    expect(mockLookup).not.toHaveBeenCalled();
  });

  it("blocks a missing host and unix sockets", async () => {
    await expect(assertPublicHost("")).rejects.toThrow(PRIVATE_NETWORK_ERROR);
    await expect(assertPublicHost("/var/run/postgresql")).rejects.toThrow(PRIVATE_NETWORK_ERROR);
  });

  it("is disabled by ALLOW_PRIVATE_NETWORK=true", async () => {
    process.env.ALLOW_PRIVATE_NETWORK = "true";
    await expect(assertPublicHost("127.0.0.1")).resolves.toBeUndefined();
  });
});

describe("hostsFromConnectionString", () => {
  it.each([
    ["postgresql://user:p%40ss@db.example.com:5432/app", ["db.example.com"]],
    ["mysql://root@[2001:db8::1]:3306", ["2001:db8::1"]],
    ["mongodb://a.example.com:27017,b.example.com/db?replicaSet=rs", ["a.example.com", "b.example.com"]],
    ["redis://:secret@cache.example.com:6379/0", ["cache.example.com"]],
    ["postgres:///app", [""]]
  ])("%s", (connectionString, hosts) => {
    expect(hostsFromConnectionString(connectionString)).toEqual(hosts);
  });
});

describe("assertPublicConnectionString", () => {
  it("checks every host and the libpq ?host= override", async () => {
    resolvesTo("93.184.216.34");
    await expect(
      assertPublicConnectionString("postgresql://u:p@db.example.com/app?host=/var/run/postgresql")
    ).rejects.toThrow(PRIVATE_NETWORK_ERROR);
  });

  it("resolves +srv seeds through SRV records", async () => {
    mockResolveSrv.mockResolvedValueOnce([{ name: "shard-0.example.net", port: 27_017 }]);
    resolvesTo("10.0.0.7");
    await expect(assertPublicConnectionString("mongodb+srv://u:p@cluster.example.net/db")).rejects.toThrow(
      PRIVATE_NETWORK_ERROR
    );
    expect(mockResolveSrv).toHaveBeenCalledWith("_mongodb._tcp.cluster.example.net");
  });
});
