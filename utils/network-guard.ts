import { lookup, resolveSrv } from "node:dns/promises";
import { BlockList, isIP } from "node:net";

/**
 * Tools that connect to a user-supplied host (databases, SMTP, S3 endpoints)
 * would otherwise let anyone make this server probe its own network. Every such
 * host goes through assertPublicHost() first. Self-hosters who need to check a
 * database on their LAN can opt out with ALLOW_PRIVATE_NETWORK=true.
 *
 * Residual risk: the driver resolves the name again when it connects, so a DNS
 * record that flips between the two lookups (rebinding) is not covered.
 */

export const PRIVATE_NETWORK_ERROR =
  "Connections to private or internal network addresses are blocked. Self-hosting? Set ALLOW_PRIVATE_NETWORK=true.";

const _BLOCKED = new BlockList();
for (const [network, prefix] of [
  ["0.0.0.0", 8], // "this" network
  ["10.0.0.0", 8], // private
  ["100.64.0.0", 10], // carrier-grade NAT
  ["127.0.0.0", 8], // loopback
  ["169.254.0.0", 16], // link-local, cloud metadata
  ["172.16.0.0", 12], // private
  ["192.0.0.0", 24], // IETF protocol assignments
  ["192.168.0.0", 16], // private
  ["198.18.0.0", 15], // benchmarking
  ["224.0.0.0", 3] // multicast + reserved + broadcast
] as const) {
  _BLOCKED.addSubnet(network, prefix, "ipv4");
}
for (const [network, prefix] of [
  ["::", 128], // unspecified
  ["::1", 128], // loopback
  ["fc00::", 7], // unique local
  ["fe80::", 10], // link-local
  ["ff00::", 8] // multicast
] as const) {
  _BLOCKED.addSubnet(network, prefix, "ipv6");
}

const _IPV4_MAPPED = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i;
const _BRACKETED = /^\[(.*)\]$/;
const _SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;
const _SRV_SCHEME = /^[a-z]+\+srv:\/\//i;
const _AUTHORITY_END = /[/?#]/;
const _TRAILING_PORT = /:\d*$/;

export const isPrivateAddress = (address: string): boolean => {
  const mapped = address.match(_IPV4_MAPPED)?.[1];
  if (mapped) {
    return isPrivateAddress(mapped);
  }
  const family = isIP(address);
  if (family === 0) {
    return true; // not an IP at all: refuse rather than guess
  }
  return _BLOCKED.check(address, family === 4 ? "ipv4" : "ipv6");
};

const isGuardDisabled = () => process.env.ALLOW_PRIVATE_NETWORK === "true";

const stripBrackets = (host: string) => host.replace(_BRACKETED, "$1");

/** Throws PRIVATE_NETWORK_ERROR unless every address `host` resolves to is public. */
export const assertPublicHost = async (rawHost: string | undefined): Promise<void> => {
  if (isGuardDisabled()) {
    return;
  }
  const host = stripBrackets((rawHost ?? "").trim());
  // A missing host means the driver falls back to localhost or a unix socket.
  if (!host || host.startsWith("/")) {
    throw new Error(PRIVATE_NETWORK_ERROR);
  }

  const addresses = isIP(host) ? [host] : (await lookup(host, { all: true, verbatim: true })).map((a) => a.address);
  if (addresses.length === 0 || addresses.some(isPrivateAddress)) {
    throw new Error(PRIVATE_NETWORK_ERROR);
  }
};

/** Resolves a MongoDB `+srv` seed name to its real hosts, then checks each one. */
export const assertPublicSrvHost = async (host: string): Promise<void> => {
  if (isGuardDisabled()) {
    return;
  }
  const records = await resolveSrv(`_mongodb._tcp.${host}`);
  if (records.length === 0) {
    throw new Error(PRIVATE_NETWORK_ERROR);
  }
  await Promise.all(records.map((record) => assertPublicHost(record.name)));
};

/**
 * Host names from a database connection string, without credentials or ports.
 * Handles comma-separated host lists (MongoDB) and bracketed IPv6.
 */
export const hostsFromConnectionString = (connectionString: string): string[] => {
  const withoutScheme = connectionString.trim().replace(_SCHEME, "");
  const authority = withoutScheme.split(_AUTHORITY_END, 1)[0] ?? "";
  const hostList = authority.slice(authority.lastIndexOf("@") + 1);

  return hostList
    .split(",")
    .map((entry) => {
      const value = entry.trim();
      if (value.startsWith("[")) {
        return value.slice(1, value.indexOf("]"));
      }
      return value.replace(_TRAILING_PORT, "");
    })
    .map((value) => decodeURIComponent(value));
};

/** Checks every host in a connection string; `+srv` schemes are resolved via SRV first. */
export const assertPublicConnectionString = async (connectionString: string): Promise<void> => {
  if (isGuardDisabled()) {
    return;
  }
  const hosts = hostsFromConnectionString(connectionString);
  // libpq-style `?host=` overrides the authority host (pg honours it).
  const query = connectionString.split("?")[1];
  if (query) {
    hosts.push(...new URLSearchParams(query.split("#")[0]).getAll("host"));
  }
  const isSrv = _SRV_SCHEME.test(connectionString.trim());

  await Promise.all(hosts.map((host) => (isSrv ? assertPublicSrvHost(host) : assertPublicHost(host))));
};
