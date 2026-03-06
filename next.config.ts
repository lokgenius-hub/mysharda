import type { NextConfig } from "next";

const isStatic = process.env.NEXT_PUBLIC_MODE === "static";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages build
  output: isStatic ? "export" : undefined,
  // GitHub Pages serves under /repo-name — set this to your repo name
  basePath: isStatic ? (process.env.NEXT_PUBLIC_BASE_PATH || "") : "",
  // Disable image optimization for static export (not supported)
  images: isStatic
    ? { unoptimized: true }
    : {
        remotePatterns: [
          { protocol: "https", hostname: "*.supabase.co" },
          { protocol: "https", hostname: "*.supabase.in" },
          { protocol: "https", hostname: "images.unsplash.com" },
        ],
      },
};

export default nextConfig;
