import type { NextConfig } from "next";

const basePath = process.env.ADMIN_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "standalone",
  ...(basePath ? { basePath } : {}),
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
