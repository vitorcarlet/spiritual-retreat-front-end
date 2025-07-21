import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@mui/material", "@mui/icons-material"],
  },
  transpilePackages: ["msw"],
  env: {
    NEXT_PUBLIC_API_MOCKING: process.env.NEXT_PUBLIC_API_MOCKING || "disabled",
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "log"] }
        : false,
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
