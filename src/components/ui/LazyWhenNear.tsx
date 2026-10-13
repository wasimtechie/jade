"use client";

import {
  useEffect,
  useRef,
  useState,
  startTransition,
  type ReactNode,
} from "react";

type LazyWhenNearProps = {
  children: ReactNode;
  minHeight?: string;
  /** Wrapper classes — use `bg-jade-green` when defer shell must match section bg. */
  className?: string;
  approachMargin?: string;
  mountMargin?: string;
  shell?: ReactNode;
  onApproach?: () => void;
  /** Extra delay after intersect before mounting heavy children (ms). */
  mountDeferMs?: number;
};

/**
 * Staged viewport mount — approach (prefetch) then full children.
 * Uses startTransition so scroll stays responsive during heavy mounts.
 */
export default function LazyWhenNear({
  children,
  minHeight = "70vh",
  className = "",
  approachMargin = "600px 0px",
  mountMargin = "100px 0px",
  shell,
  onApproach,
  mountDeferMs = 0,
}: LazyWhenNearProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [approached, setApproached] = useState(false);
  const [mounted, setMounted] = useState(false);
  const approachedRef = useRef(false);
  const mountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ioApproach = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || approachedRef.current) return;
        approachedRef.current = true;
        setApproached(true);
        onApproach?.();
      },
      { rootMargin: approachMargin },
    );

    const ioMount = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;

        const mount = () => {
          startTransition(() => setMounted(true));
          ioMount.disconnect();
        };

        if (mountDeferMs > 0) {
          mountTimerRef.current = setTimeout(mount, mountDeferMs);
        } else if ("requestIdleCallback" in window) {
          (
            window as Window & {
              requestIdleCallback: (
                cb: () => void,
                opts?: { timeout: number },
              ) => number;
              cancelIdleCallback: (id: number) => void;
            }
          ).requestIdleCallback(mount, { timeout: 400 });
        } else {
          requestAnimationFrame(() => requestAnimationFrame(mount));
        }
      },
      { rootMargin: mountMargin },
    );

    ioApproach.observe(el);
    ioMount.observe(el);

    return () => {
      ioApproach.disconnect();
      ioMount.disconnect();
      if (mountTimerRef.current) clearTimeout(mountTimerRef.current);
    };
  }, [approachMargin, mountMargin, onApproach, mountDeferMs]);

  return (
    <div
      ref={ref}
      className={`jade-defer-paint ${className}`.trim()}
      style={{ minHeight, containIntrinsicSize: minHeight }}
    >
      {mounted ? children : approached && shell ? shell : null}
    </div>
  );
}
