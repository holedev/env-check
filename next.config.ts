import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
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
