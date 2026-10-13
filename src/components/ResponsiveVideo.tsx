"use client";

import { useEffect, useRef } from "react";
import { videoSources, type VideoSlug } from "@/lib/videoSources";

export type { VideoSlug };

interface ResponsiveVideoProps {
  slug: VideoSlug;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  poster?: string;
}

function pickSrc(slug: VideoSlug): string {
  if (typeof window === "undefined") {
    return videoSources[slug].landscape;
  }
  const useMobile = window.matchMedia(
    "(max-width: 768px) and (orientation: portrait)",
  ).matches;
  return useMobile ? videoSources[slug].mobile : videoSources[slug].landscape;
}

function srcMatches(video: HTMLVideoElement, target: string): boolean {
  if (!target) return false;
  if (video.src === target) return true;
  try {
    return new URL(video.src).pathname.endsWith(new URL(target).pathname);
  } catch {
    return video.getAttribute("src") === target;
  }
}

function isActivelyPlaying(video: HTMLVideoElement): boolean {
  return !video.paused && !video.ended && video.readyState >= 2;
}

export default function ResponsiveVideo({
  slug,
  className = "",
  autoPlay = true,
  loop = true,
  muted = true,
  poster,
}: ResponsiveVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const triedFallback = useRef(false);
  const playInFlight = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    triedFallback.current = false;

    const markStarted = () => {
      if (isActivelyPlaying(video) || video.readyState >= 3) {
        video.removeAttribute("poster");
      }
    };

    const requestPlay = () => {
      if (!autoPlay || playInFlight.current) return;
      if (isActivelyPlaying(video)) {
        markStarted();
        return;
      }
      playInFlight.current = true;
      void video
        .play()
        .then(markStarted)
        .catch(() => {
          /* Autoplay policy — visibility handler retries */
        })
        .finally(() => {
          playInFlight.current = false;
        });
    };

    const applySrc = () => {
      const target = pickSrc(slug);
      if (!srcMatches(video, target)) {
        triedFallback.current = false;
        video.src = target;
        video.load();
      }
      requestPlay();
    };

    const onError = () => {
      if (triedFallback.current) return;
      triedFallback.current = true;
      const fallback = videoSources[slug].landscape;
      if (!srcMatches(video, fallback)) {
        video.src = fallback;
        video.load();
        requestPlay();
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") requestPlay();
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) requestPlay();
    };

    const mobileMq = window.matchMedia(
      "(max-width: 768px) and (orientation: portrait)",
    );
    const onLayoutChange = () => applySrc();

    video.addEventListener("playing", markStarted);
    video.addEventListener("canplay", requestPlay);
    video.addEventListener("error", onError);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onPageShow);
    mobileMq.addEventListener("change", onLayoutChange);
    window.addEventListener("orientationchange", onLayoutChange);

    applySrc();
    markStarted();

    return () => {
      video.removeEventListener("playing", markStarted);
      video.removeEventListener("canplay", requestPlay);
      video.removeEventListener("error", onError);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onPageShow);
      mobileMq.removeEventListener("change", onLayoutChange);
      window.removeEventListener("orientationchange", onLayoutChange);
    };
  }, [slug, autoPlay]);

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline
      preload="auto"
      poster={poster}
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden
    />
  );
}
