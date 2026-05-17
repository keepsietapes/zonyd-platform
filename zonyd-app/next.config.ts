import type { NextConfig } from "next";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
