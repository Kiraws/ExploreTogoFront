import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // ✅ Images locales servies par ton backend (dev)
      {
        protocol: "http",
        hostname: "localhost",
        port: "3030",
        pathname: "/uploads/**",
      },

      // ✅ Images Cloudinary (prod + dev)
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
