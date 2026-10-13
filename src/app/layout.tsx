import type { Metadata, Viewport } from "next";
import { Philosopher, Manrope } from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import Providers from "./providers";
import SchemaMarkup from "@/components/SchemaMarkup";
import { VIDEO_CDN_ORIGIN } from "@/lib/videoSources";

const philosopher = Philosopher({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-philosopher",
  display: "swap", // Prevent FOIT — show fallback font until Philosopher loads
});

const manrope = Manrope({
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap", // Prevent FOIT — show fallback font until Manrope loads
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1A1C1E",
};

// ─── Base metadata — inherited & extended by every page ──────────────────────
export const metadata: Metadata = {
  // Enables relative paths in OG images (e.g. '/og-default.jpg')
  metadataBase: new URL("https://jadehospitainment.com"),

  // Every page gets " | Jade Hospitainment" appended automatically
  title: {
    default: "Jade Hospitainment — Luxury Villas, Weddings & Experiences",
    template: "%s | Jade Hospitainment",
  },

  description:
    "Discover curated Luxury Villas, bespoke destination weddings, caravans, corporate retreats, and immersive experiences near Bangalore with Jade Hospitainment.",

  keywords: [
    "Luxury Villas Bangalore",
    "destination weddings",
    "corporate retreats Bangalore",
    "weekend getaways",
    "private villa stays",
    "Jade Hospitainment",
  ],

  authors: [
    { name: "Jade Hospitainment", url: "https://jadehospitainment.com" },
  ],

  alternates: { canonical: "https://jadehospitainment.com" },

  openGraph: {
    type: "website",
    siteName: "Jade Hospitainment",
    locale: "en_IN",
    url: "https://jadehospitainment.com",
    title: "Jade Hospitainment — Luxury Villas, Weddings & Experiences",
    description:
      "Discover curated Luxury Villas, bespoke destination weddings, caravans, corporate retreats, and immersive experiences near Bangalore.",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Jade Hospitainment — Luxury Private Villa Stays",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Jade Hospitainment — Luxury Villas, Weddings & Experiences",
    description:
      "Discover curated Luxury Villas, bespoke destination weddings, and immersive experiences near Bangalore.",
    images: ["/og-default.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },

  manifest: "/site.webmanifest",

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://jadehospitainment.com/#organization",
  name: "Jade Hospitainment",
  url: "https://jadehospitainment.com",
  logo: "https://jadehospitainment.com/assets/Golden_Logo.png",
  description:
    "Discover curated Luxury Villas, bespoke destination weddings, caravans, corporate retreats, and immersive experiences near Bangalore.",
  sameAs: [
    "https://www.instagram.com/jadehospitainment",
    "https://www.facebook.com/jadehospitainment",
  ],
  knowsAbout: [
    "Luxury villa stays",
    "Destination weddings",
    "Corporate retreats",
    "Weekend getaways Bangalore",
    "Party Villas Karnataka",
  ],
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "@id": "https://jadehospitainment.com/#localbusiness",
  name: "Jade Hospitainment",
  image: "https://jadehospitainment.com/assets/Golden_Logo.png",
  url: "https://jadehospitainment.com",
  parentOrganization: { "@id": "https://jadehospitainment.com/#organization" },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bangalore",
    addressRegion: "Karnataka",
    addressCountry: "IN",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://jadehospitainment.com/#website",
  url: "https://jadehospitainment.com",
  name: "Jade Hospitainment",
  inLanguage: "en-IN",
  description:
    "Discover curated Luxury Villas, bespoke destination weddings, caravans, corporate retreats, and immersive experiences near Bangalore.",
  publisher: { "@id": "https://jadehospitainment.com/#organization" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href={VIDEO_CDN_ORIGIN} crossOrigin="" />
        <link rel="dns-prefetch" href={VIDEO_CDN_ORIGIN} />
      </head>
      <body
        suppressHydrationWarning
        className={clsx(
          philosopher.variable,
          manrope.variable,
          "font-manrope antialiased overflow-x-hidden",
        )}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if('scrollRestoration' in history)history.scrollRestoration='manual';window.scrollTo(0,0);if(location.hash)history.replaceState(history.state,'',location.pathname+location.search);})();`,
          }}
        />
        <Providers>{children}</Providers>
        <SchemaMarkup schema={organizationSchema} />
        <SchemaMarkup schema={websiteSchema} />
        <SchemaMarkup schema={localBusinessSchema} />
      </body>
    </html>
  );
}
