import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Pin Turbopack root to this app. If a lockfile exists in a parent directory
// (e.g. ~/package-lock.json), Next may infer the wrong root; resolution then
// runs from ~/Documents/Repos and breaks Tailwind / package.json loading.
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  images: {
    // In dev, your Supabase local stack serves images from 127.0.0.1.
    // Next's image optimizer blocks private IPs for SSRF safety, so we
    // disable optimization to let the browser fetch the image directly.
    unoptimized: process.env.NODE_ENV !== "production",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "54321",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
