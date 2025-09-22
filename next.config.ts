import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3030',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000', // Port par défaut de Next.js
        pathname: '/**', // Autorise tous les chemins, y compris /no-image.png
      },

    ],
  },
};

export default nextConfig;
