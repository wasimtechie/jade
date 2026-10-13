// Server component — safely renders JSON-LD structured data in <head>
// Usage: <JsonLd schema={{ "@context": "https://schema.org", "@type": "..." }} />
import React from "react";

interface JsonLdProps {
  schema: Record<string, unknown>;
}

export default function JsonLd({ schema }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
