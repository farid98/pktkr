import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      { pathname: "/**", search: "" },
      {
        pathname: "/blog/august-2026-hubco0briefing/opengraph-image",
        search: "?v=4",
      },
    ],
  },
};

export default nextConfig;
