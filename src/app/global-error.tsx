"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/** Catches runtime errors in the root layout — must ship its own `html` / `body`. */
export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="m-0 min-h-screen bg-[#0B2C23] px-6 py-12 font-sans text-white">
        <h1 className="mb-2.5 text-xl font-semibold">Application error</h1>
        <p className="mb-6 max-w-lg text-sm text-white/70">{error.message}</p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-sm bg-[#EFCD62] px-6 py-3 text-sm font-bold uppercase tracking-wide text-[#0B2C23]"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
