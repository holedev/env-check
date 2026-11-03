/** Public origin of the deployed app. Override with NEXT_PUBLIC_SITE_URL when self-hosting. */
export const _SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://envcheck.vercel.app").replace(/\/+$/, "");

export const _REPO_URL = "https://github.com/holedev/env-check";
