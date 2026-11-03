import type { MetadataRoute } from "next";
import { _SITE_URL } from "@/constants/site";
import { _TOOL_GROUP_LIST } from "@/constants/tool";

export default function sitemap(): MetadataRoute.Sitemap {
  const groups = _TOOL_GROUP_LIST.filter((group) => group.tools.length > 0);

  return [
    { url: `${_SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${_SITE_URL}/tools`, changeFrequency: "weekly", priority: 0.9 },
    ...groups.map((group) => ({
      url: `${_SITE_URL}/tools/${group.path}`,
      changeFrequency: "weekly" as const,
      priority: 0.7
    })),
    ...groups.flatMap((group) =>
      group.tools.map((tool) => ({
        url: `${_SITE_URL}/tools/${group.path}/${tool}`,
        changeFrequency: "monthly" as const,
        priority: 0.6
      }))
    )
  ];
}
