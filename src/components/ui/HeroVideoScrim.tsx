/** Slight dark wash so hero copy stays readable over bright video frames. */
export default function HeroVideoScrim() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2] bg-black/20"
      aria-hidden
    />
  );
}
