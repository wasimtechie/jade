import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

/** Keep Vercel serverless bundles under the 250 MB limit (media APIs must not trace public/). */
const mediaApiTraceExcludes = [
  "./public/**/*",
  "./node_modules/@img/sharp-libvips-darwin-x64/**/*",
  "./node_modules/@img/sharp-libvips-darwin-arm64/**/*",
  "./node_modules/@img/sharp-wasm32/**/*",
];

const nextConfig = {
  // Root WordPress article URLs keep their original trailing slash.
  skipTrailingSlashRedirect: true,
  /** Prevent mongoose/jsdom from being incorrectly bundled into serverless functions. */
  experimental: {
    serverComponentsExternalPackages: ["mongoose", "mongodb", "bson", "isomorphic-dompurify", "jsdom"],
    outputFileTracingExcludes: {
      "/api/dashboard/media": mediaApiTraceExcludes,
      "/api/dashboard/media/[id]": mediaApiTraceExcludes,
      "/api/dashboard/media/bulk": mediaApiTraceExcludes,
      "/api/dashboard/media/folders": mediaApiTraceExcludes,
      "/api/dashboard/media/static": mediaApiTraceExcludes,
      "/api/dashboard/media/upload": mediaApiTraceExcludes,
    },
  },
  // Remove X-Powered-By header for security
  poweredByHeader: false,

  // Do not ship source maps to browsers in production (reduces attack surface)
  productionBrowserSourceMaps: false,

  // Enable gzip/brotli compression
  compress: true,

  async headers() {
    const globalSecurity = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      {
        key: "Permissions-Policy",
        value:
          "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=()",
      },
      { key: "X-DNS-Prefetch-Control", value: "off" },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://www.googletagmanager.com",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https:",
          "media-src 'self' https://jadehospitainment.com blob:",
          "font-src 'self' data:",
          "connect-src 'self' https://api.razorpay.com https://*.sentry.io https://www.google-analytics.com",
          "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://www.youtube.com https://www.youtube-nocookie.com",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join("; "),
      },
      {
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin-allow-popups",
      },
    ];

    if (isProd) {
      globalSecurity.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }

    return [
      {
        source: "/:path*",
        headers: globalSecurity,
      },
      {
        source: "/_next/image(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  images: {
    // Prefer AVIF then WebP for smaller file sizes
    formats: ["image/avif", "image/webp"],
    // Responsive image breakpoints
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "i.pinimg.com" },
      { protocol: "https", hostname: "jadehospitainment.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },

  // 301 redirects for old blog URLs → new clean slugs
  // Add one entry per migrated old article to preserve Google rankings
  async redirects() {
    return [
      // Public property directory and detail URLs retain the WordPress structure.
      { source: "/villas", destination: "/retreats/", permanent: true },
      { source: "/villas/:path+", destination: "/retreat/:path+/", permanent: true },
      // Legacy policy shortcuts → canonical policy routes
      {
        source: "/privacy",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/terms",
        destination: "/terms-conditions",
        permanent: true,
      },
      {
        source: "/refund",
        destination: "/refund-policy",
        permanent: true,
      },

      // Common legacy blog path → current blog path
      {
        source: "/blog/:slug*",
        destination: "/blogs/:slug*",
        permanent: true,
      },

      // Legacy monolithic admin → dashboard PMS
      {
        source: "/admin",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/admin/:path*",
        destination: "/dashboard/:path*",
        permanent: false,
      },

      {
        source: "/dashboard/settings/staah",
        destination: "/dashboard/settings/axis-rooms",
        permanent: true,
      },
      {
        source: "/dashboard/settings/staah/:path*",
        destination: "/dashboard/settings/axis-rooms/:path*",
        permanent: true,
      },

      // Example pattern — update with actual old URLs when migrating
      // {
      //   source: "/blog/:slug",
      //   destination: "/blogs/:slug",
      //   permanent: true,
      // },
    ];
  },
};

const sentryEnabled = Boolean(
  process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
);

export default sentryEnabled
  ? withSentryConfig(nextConfig, { silent: true })
  : nextConfig;
