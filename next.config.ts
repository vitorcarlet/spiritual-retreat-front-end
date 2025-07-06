import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["msw"],
  env: {
    NEXT_PUBLIC_API_MOCKING: process.env.NEXT_PUBLIC_API_MOCKING || "disabled",
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
