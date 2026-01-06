import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone mode for optimized Docker builds
  output: 'standalone',

  /* config options here */
};

export default nextConfig;
