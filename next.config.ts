import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Performance optimizations */

  // Experimental features for performance
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Headers for performance and security
  // async headers() {
  //   return [
  //     {
  //       source: "/(.*)",
  //       headers: [
  //         {
  //           key: "X-DNS-Prefetch-Control",
  //           value: "on",
  //         },
  //         {
  //           key: "X-XSS-Protection",
  //           value: "1; mode=block",
  //         },
  //         {
  //           key: "X-Frame-Options",
  //           value: "SAMEORIGIN",
  //         },
  //         {
  //           key: "X-Content-Type-Options",
  //           value: "nosniff",
  //         },
  //         {
  //           key: "Referrer-Policy",
  //           value: "origin-when-cross-origin",
  //         },
  //       ],
  //     },
  //     {
  //       source: "/api/(.*)",
  //       headers: [
  //         {
  //           key: "Cache-Control",
  //           value: "public, max-age=3600, s-maxage=3600",
  //         },
  //       ],
  //     },
  //     {
  //       source: "/_next/static/(.*)",
  //       headers: [
  //         {
  //           key: "Cache-Control",
  //           value: "public, max-age=31536000, immutable",
  //         },
  //       ],
  //     },
  //   ];
  // },

  // Enable gzip compression
  compress: true,

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Bundle analyzer setup
    if (process.env.ANALYZE === "true") {
      const withBundleAnalyzer = require("@next/bundle-analyzer")({
        enabled: true,
      });
      return withBundleAnalyzer(config);
    }

    // Production optimizations can be added here if needed

    // Optimize bundle splitting (simplified for compatibility)
    // if (
    //   config.optimization?.splitChunks &&
    //   typeof config.optimization.splitChunks !== "boolean"
    // ) {
    //   config.optimization.splitChunks.cacheGroups = {
    //     ...config.optimization.splitChunks.cacheGroups,
    //     // Bundle common UI components together
    //     ui: {
    //       name: "ui",
    //       chunks: "all",
    //       test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
    //       priority: 20,
    //     },
    //   };
    // }

    return config;
  },

  // Performance budgets (warnings only)
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Production source maps (disabled for better performance)
  productionBrowserSourceMaps: false,

  // Optimize CSS
  // modularizeImports: {
  //   "lucide-react": {
  //     transform: "lucide-react/dist/esm/icons/{{kebabCase member}}",
  //     preventFullImport: true,
  //   },
  // },
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
