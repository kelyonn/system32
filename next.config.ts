import type { NextConfig } from "next";

// Static export: the whole site is prebuilt HTML plus assets, so it can live on any static host.
// NEXT_PUBLIC_BASE_PATH is "/system32" on GitHub Pages project sites and empty on a custom domain.
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: base || undefined,
  images: { unoptimized: true },
};

export default nextConfig;
