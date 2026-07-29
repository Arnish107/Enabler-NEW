import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Prevent parent package-lock from confusing the workspace root
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
