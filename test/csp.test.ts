/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { buildContentSecurityPolicy, createNonce } from "@/utils/csp";

const NONCE_PATTERN = /'nonce-([^']+)'/;
const INLINE_SCRIPT_PATTERN = /script-src[^;]*'unsafe-inline'/;

describe("buildContentSecurityPolicy", () => {
  it("allows only nonce-stamped scripts in production", () => {
    const csp = buildContentSecurityPolicy({ nonce: "abc", isDev: false });

    expect(csp).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toMatch(INLINE_SCRIPT_PATTERN);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });

  it("relaxes eval and websockets only in development", () => {
    const csp = buildContentSecurityPolicy({ nonce: "abc", isDev: true });

    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain("connect-src 'self' ws: wss:");
  });
});

describe("createNonce", () => {
  it("is unique per call", () => {
    expect(createNonce()).not.toBe(createNonce());
  });
});

describe("proxy", () => {
  it("sends a fresh nonce CSP on every response and forwards it to rendering", () => {
    const first = proxy(new NextRequest("http://localhost/tools"));
    const second = proxy(new NextRequest("http://localhost/tools"));

    const firstCsp = first.headers.get("Content-Security-Policy") ?? "";
    const nonce = firstCsp.match(NONCE_PATTERN)?.[1];

    expect(nonce).toBeTruthy();
    expect(second.headers.get("Content-Security-Policy")).not.toBe(firstCsp);
    // NextResponse.next({ request: { headers } }) exposes overridden request headers this way.
    expect(first.headers.get("x-middleware-request-x-nonce")).toBe(nonce);
  });
});
