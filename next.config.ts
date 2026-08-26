import type { NextConfig } from "next";

const isApkBuild = process.env.BUILD_TARGET === "apk";

const nextConfig: NextConfig = {
  output: isApkBuild ? "export" : "standalone",

  images: {
    unoptimized: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  reactStrictMode: false,
};

export default nextConfig;
