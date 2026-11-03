import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const isDev = process.env.NODE_ENV !== "production";

// Static CSP: Next.js and next-themes inject inline scripts, so script-src needs
// 'unsafe-inline'. The app renders no user-generated HTML, so the real value here
// is locking down framing, plugins, <base> and form targets. Server Actions post
// to 'self'; credentials only leave the server, never the browser.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.simpleicons.org",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'"
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }])
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  headers: async () => [{ source: "/:path*", headers: securityHeaders }],
  // "standalone" is for the Docker image (Dockerfile copies .next/standalone).
  // On Vercel it clashes with Vercel's own output tracing (next-server.js.nft.json
  // ENOENT on Next 16.3+), so let Vercel trace natively there.
  output: process.env.VERCEL ? undefined : "standalone",
  images: {
    remotePatterns: [new URL("https://cdn.simpleicons.org/**")],
    // simple icon return image/svg+xml
    dangerouslyAllowSVG: true
  }
};

const withNextIntl = createNextIntlPlugin({
  requestConfig: "./configs/i18n/request.ts"
});
export default withNextIntl(nextConfig);
