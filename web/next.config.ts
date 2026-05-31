import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // If you are deploying to https://<username>.github.io/<repository>/
  // uncomment the lines below and replace <repository> with your repo name
  // basePath: '/<repository>',
};

export default nextConfig;
