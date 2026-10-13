import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import SchemaMarkup from "@/components/SchemaMarkup";
import { resolvePublicVilla } from "@/lib/villas/resolvePublicVilla";
import type { Villa } from "@/lib/types";
import { SITE_ORIGIN, trimMetaDescription } from "@/lib/seo/meta";

type Props = { children: ReactNode; params: { id: string } };

export const dynamic = "force-dynamic";

function breadcrumbJsonLd(villa: Villa, canonical: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Retreats",
        item: `${SITE_ORIGIN}/retreats/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: villa.name,
        item: `${SITE_ORIGIN}/retreat/${villa.id}/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Spaces",
        item: canonical,
      },
    ],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const villa = await resolvePublicVilla(params.id);
  if (!villa) {
    return { title: "Spaces", robots: { index: false, follow: false } };
  }

  const canonical = `${SITE_ORIGIN}/retreat/${villa.id}/spaces/`;
  const title = `${villa.name} — Spaces, rooms & event areas`;
  const description = trimMetaDescription(
    `Photo tour of spaces at ${villa.name} (${villa.location}): layouts, lawns, pools, and event zones for stays and celebrations. ${villa.description}`,
  );
  const ogPath = villa.image;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: "en_IN",
      type: "website",
      siteName: "Jade Hospitainment",
      images: ogPath
        ? [
            {
              url: ogPath,
              width: 1200,
              height: 630,
              alt: `${villa.name} spaces gallery`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogPath ? [ogPath] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export default async function VillaSpacesLayout({ children, params }: Props) {
  const villa = await resolvePublicVilla(params.id);
  if (!villa) notFound();

  const canonical = `${SITE_ORIGIN}/retreat/${villa.id}/spaces/`;

  return (
    <>
      {children}
      <SchemaMarkup schema={breadcrumbJsonLd(villa, canonical)} />
    </>
  );
}
