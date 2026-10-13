/** Brief lock so programmatic scroll-to-section does not fight scroll-spy. */

let lockedUntil = 0;

export function lockScrollSpy(ms: number): void {
  lockedUntil = Math.max(lockedUntil, Date.now() + ms);
}

export function isScrollSpyLocked(): boolean {
  return Date.now() < lockedUntil;
}
