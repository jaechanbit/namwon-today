import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1", "100.86.203.87"],
  ...(isGitHubPages
    ? {
        output: "export" as const,
        basePath: "/namwon-today",
        assetPrefix: "/namwon-today/",
        trailingSlash: true,
      }
    : {}),
};
export default nextConfig;
