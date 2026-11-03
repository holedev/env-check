import type { MetadataRoute } from "next";
import { _SITE_URL } from "@/constants/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${_SITE_URL}/sitemap.xml`
  };
}
