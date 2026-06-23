import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2_592_000,
    deviceSizes: [360, 640, 768, 1024, 1280, 1536],
    imageSizes: [96, 160, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      // Discord CDN — some project thumbnails are hosted here. NOTE: these URLs are
      // SIGNED and EXPIRE (ex/is/hm params), so they break after ~24h. Prefer
      // re-hosting covers on Supabase storage for anything permanent.
      { protocol: "https", hostname: "media.discordapp.net" },
      { protocol: "https", hostname: "cdn.discordapp.com" }
    ]
  }
};

export default nextConfig;
