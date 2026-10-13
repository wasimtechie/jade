import clsx from "clsx";

type GoldAccentLineProps = {
  className?: string;
};

/** Thin gold gradient rule — matches the footer top edge accent. */
export default function GoldAccentLine({ className }: GoldAccentLineProps) {
  return (
    <div
      aria-hidden
      className={clsx(
        "pointer-events-none w-full h-[1px] shrink-0 bg-gradient-to-r from-transparent via-[#EFCD62]/40 to-transparent",
        className,
      )}
    />
  );
}
