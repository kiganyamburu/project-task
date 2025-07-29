import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features
  experimental: {
    // Other experimental features can go here
  },

  // Turbopack configuration (now stable)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  // Optimize images
  images: {
    domains: ["github.com", "avatars.githubusercontent.com"],
    formats: ["image/webp", "image/avif"],
  },

  // Enable strict mode for better development experience
  reactStrictMode: true,

  // Optimize for production
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
