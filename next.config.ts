import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  output: "standalone",
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
