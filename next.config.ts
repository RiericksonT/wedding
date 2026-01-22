import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["github.com", "images.unsplash.com"],
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            icon: false,
            svgo: false,
            throwIfNamespace: false,
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;
