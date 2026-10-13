import type { LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Info } from "lucide-react";
import {
  Bath,
  Bell,
  ChefHat,
  Coffee,
  HandPlatter,
  Heart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { VILLA_ICON_REGISTRY } from "@/lib/villas/amenityIconOptions";

const ICONS: Record<string, LucideIcon> = {};

for (const { name } of VILLA_ICON_REGISTRY) {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon | undefined>)[
    name
  ];
  if (Icon) ICONS[name] = Icon;
}

/** Wifi maps to Wind in legacy data */
ICONS.Wifi = LucideIcons.Wifi ?? LucideIcons.Wind;

export function getVillaDetailIcon(iconName?: string, title?: string) {
  const name = iconName?.toLowerCase() || "";
  const t = title?.toLowerCase() || "";

  if (iconName && ICONS[iconName]) return ICONS[iconName];

  if (name.includes("chef") || t.includes("chef") || t.includes("cooking"))
    return ChefHat;
  if (name.includes("butler") || t.includes("butler") || t.includes("service"))
    return HandPlatter;
  if (
    name.includes("housekeeping") ||
    t.includes("housekeeping") ||
    t.includes("cleaning")
  )
    return Sparkles;
  if (
    name.includes("concierge") ||
    t.includes("concierge") ||
    t.includes("help") ||
    t.includes("phone")
  )
    return Bell;
  if (name.includes("security") || t.includes("security")) return ShieldCheck;
  if (name.includes("wellness") || t.includes("wellness") || t.includes("spa"))
    return Heart;
  if (
    name.includes("breakfast") ||
    t.includes("breakfast") ||
    t.includes("coffee")
  )
    return Coffee;

  return Info;
}

export function splitAmenityLabel(label: string) {
  const words = label.trim().split(/\s+/);
  if (words.length <= 1) return { line1: label, line2: "" };
  const mid = Math.ceil(words.length / 2);
  return {
    line1: words.slice(0, mid).join(" "),
    line2: words.slice(mid).join(" "),
  };
}

/** Test helper — every registry name should resolve */
export function registryIconCoverage(): { missing: string[] } {
  const missing = VILLA_ICON_REGISTRY.filter((i) => !ICONS[i.name]).map(
    (i) => i.name,
  );
  return { missing };
}
