import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // avatars Google
    ],
  },
  experimental: {
    staleTimes: {
      dynamic: 30,  // cachea páginas dinámicas 30 segundos
      static: 180,
    },
  },
};

export default nextConfig;