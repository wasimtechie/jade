import JadeImage from "@/components/ui/JadeImage";

type VillaRetreatHeroLogoProps = {
  src: string;
  alt: string;
};

export default function VillaRetreatHeroLogo({ src, alt }: VillaRetreatHeroLogoProps) {
  return (
    <div className="relative z-10 w-full max-w-[min(100%,28rem)] mx-auto">
      <div className="relative w-full h-[clamp(3.5rem,11vw,7rem)]">
        <JadeImage
          src={src}
          alt={alt}
          fill
          priority
          sizes="(max-width: 768px) 75vw, 448px"
          className="object-contain object-center drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)]"
        />
      </div>
    </div>
  );
}
