import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  webpack(config) {
    // Import GLSL files as plain strings.
    config.module.rules.push({ test: /\.(frag|vert|glsl)$/, type: "asset/source" });
    return config;
  },
};

export default nextConfig;
