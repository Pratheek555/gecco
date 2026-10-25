import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 90 keeps dashboard screenshot text crisp in the hero.
    qualities: [75, 90],
  },
};

export default nextConfig;
