/** Fade panel copy when the carousel moves away — avoids mid-word clip inside overflow-hidden. */
export function experiencePanelTextOpacity(
  progress: number,
  panelIndex: number,
  totalSteps: number,
): number {
  const centered = progress * totalSteps;
  const dist = Math.abs(panelIndex - centered);
  if (dist < 0.35) return 1;
  if (dist > 0.5) return 0;
  return 1 - (dist - 0.35) / 0.15;
}
