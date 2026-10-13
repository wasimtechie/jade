"use client";

import Image, { type ImageProps } from "next/image";
import { getBlurDataURL } from "@/lib/imageBlur";
import { normalizeImageSrc } from "@/lib/normalizeImageSrc";

export type JadeImageProps = Omit<ImageProps, "src" | "quality"> & {
  src: string;
  /** Default 75 — compression only, not layout */
  quality?: number;
  /** Skip Next optimizer only as a last resort for a broken path */
  unoptimized?: boolean;
  /** Use manifest blur when true (default). Set false to disable placeholder */
  withBlur?: boolean;
};

export default function JadeImage({
  src,
  quality = 75,
  unoptimized,
  withBlur = true,
  placeholder,
  blurDataURL,
  alt = "",
  ...rest
}: JadeImageProps) {
  const normalized = normalizeImageSrc(src);
  const resolvedBlur = blurDataURL ?? (withBlur ? getBlurDataURL(normalized) : undefined);
  const useBlur =
    withBlur &&
    placeholder !== "empty" &&
    resolvedBlur &&
    !unoptimized;

  return (
    <Image
      src={normalized}
      alt={alt}
      quality={quality}
      unoptimized={unoptimized}
      placeholder={useBlur ? "blur" : placeholder}
      blurDataURL={useBlur ? resolvedBlur : blurDataURL}
      {...rest}
    />
  );
}
