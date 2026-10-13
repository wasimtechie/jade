import { scheduleScrollUpdate } from "@/lib/batchScrollUpdate";

export type LenisScrollPayload = {
  scroll: number;
  progress: number;
  velocity: number;
  direction: number;
};

type LenisScrollListener = (payload: LenisScrollPayload) => void;

const batchedListeners = new Set<LenisScrollListener>();
const immediateListeners = new Set<LenisScrollListener>();

/** Subscribe to Lenis scroll (rAF-batched). Returns unsubscribe. */
export function subscribeLenisScroll(listener: LenisScrollListener): () => void {
  batchedListeners.add(listener);
  return () => batchedListeners.delete(listener);
}

/** Same feed as {@link subscribeLenisScroll} but fires on every Lenis tick (navbar reflex). */
export function subscribeLenisScrollImmediate(
  listener: LenisScrollListener,
): () => void {
  immediateListeners.add(listener);
  return () => immediateListeners.delete(listener);
}

function emit(payload: LenisScrollPayload) {
  immediateListeners.forEach((fn) => fn(payload));
  scheduleScrollUpdate(() => {
    batchedListeners.forEach((fn) => fn(payload));
  });
}

type LenisEmitter = {
  on: (
    event: "scroll",
    callback: (lenis: {
      scroll: number;
      progress: number;
      velocity: number;
      direction: number;
    }) => void,
  ) => () => void;
};

/** Wire Lenis instance → scroll subscribers (chrome hide, analytics hooks). */
export function attachLenisScrollBridge(lenis: LenisEmitter): () => void {
  return lenis.on("scroll", (instance) => {
    emit({
      scroll: instance.scroll,
      progress: instance.progress,
      velocity: instance.velocity,
      direction: instance.direction,
    });
  });
}
