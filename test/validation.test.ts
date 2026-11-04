/**
 * @jest-environment node
 */
import { connectionSecrets, redact, requestService, restricted, summarize, valid } from "@/lib/validation";

describe("summarize", () => {
  it("drops facts the service did not return", () => {
    expect(summarize({ account: "acme", email: undefined, plan: null, team: "", scopes: [], count: 0 })).toEqual([
      { key: "account", value: "acme" },
      { key: "count", value: 0 }
    ]);
  });
});

describe("outcomes", () => {
  it("builds valid and restricted results", () => {
    expect(valid([{ key: "a", value: "b" }])).toEqual({ outcome: "valid", summary: [{ key: "a", value: "b" }] });
    expect(restricted("missing scope")).toEqual({ outcome: "restricted", reason: "missing scope", summary: [] });
  });
});

describe("redact", () => {
  it("removes every occurrence of each secret", () => {
    expect(redact("auth failed for s3cret at s3cret", ["s3cret", undefined])).toBe("auth failed for *** at ***");
  });

  it("ignores very short values to avoid shredding the message", () => {
    expect(redact("root denied", ["ro"])).toBe("root denied");
  });
});

describe("connectionSecrets", () => {
  it("returns the string plus raw and decoded password", () => {
    expect(connectionSecrets("redis://:p%40ss@cache.example.com:6379")).toEqual([
      "redis://:p%40ss@cache.example.com:6379",
      "p%40ss",
      "p@ss"
    ]);
  });

  it("falls back to the raw string when it isn't a URL", () => {
    expect(connectionSecrets("not a url")).toEqual(["not a url"]);
  });
});

describe("requestService", () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns status and parsed JSON", async () => {
    global.fetch = jest.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const res = await requestService("Example", "https://api.example.com");
    expect(res).toMatchObject({ status: 200, ok: true, body: { ok: true } });
  });

  it("tolerates a non-JSON body", async () => {
    global.fetch = jest.fn().mockResolvedValue(new Response("<html>", { status: 502 }));
    const res = await requestService("Example", "https://api.example.com");
    expect(res).toMatchObject({ status: 502, ok: false, body: null });
  });

  it("never puts the URL (which may hold the token) in a network error", async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError("fetch failed: https://api.telegram.org/bot123:SECRET"));
    await expect(requestService("Telegram", "https://api.telegram.org/bot123:SECRET/getMe")).rejects.toThrow(
      "Could not reach Telegram"
    );
  });
});
