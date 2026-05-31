import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // For GitHub Pages project sites, we need the repository name as the base path
  basePath: '/StellarX-Workshop-PUP-May-2026',
  assetPrefix: '/StellarX-Workshop-PUP-May-2026/',
};

export default nextConfig;
