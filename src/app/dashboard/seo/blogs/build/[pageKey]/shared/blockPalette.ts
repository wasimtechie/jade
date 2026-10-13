import type { CmsBlogSection } from "@/lib/cms/blogCms";
import {
  AlignLeft,
  Heading,
  ImageIcon,
  HelpCircle,
  List,
  MessageSquareQuote,
  MousePointerClick,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type BlockPaletteItem = {
  type: NonNullable<CmsBlogSection["type"]>;
  label: string;
  icon: LucideIcon;
  defaultSection: () => CmsBlogSection;
};

let blockCounter = 0;

function nextKey(): string {
  blockCounter += 1;
  return `block-${blockCounter}-${Date.now()}`;
}

export const BLOCK_PALETTE: BlockPaletteItem[] = [
  {
    type: "text",
    label: "Text",
    icon: AlignLeft,
    defaultSection: () => ({
      sectionKey: nextKey(),
      type: "text",
      content: "",
    }),
  },
  {
    type: "heading",
    label: "Heading",
    icon: Heading,
    defaultSection: () => ({
      sectionKey: nextKey(),
      type: "heading",
      content: "",
      level: 2,
    }),
  },
  {
    type: "image",
    label: "Image",
    icon: ImageIcon,
    defaultSection: () => ({
      sectionKey: nextKey(),
      type: "image",
      image: "",
      caption: "",
    }),
  },
  {
    type: "quote",
    label: "Quote",
    icon: MessageSquareQuote,
    defaultSection: () => ({
      sectionKey: nextKey(),
      type: "quote",
      content: "",
    }),
  },
  {
    type: "list",
    label: "List",
    icon: List,
    defaultSection: () => ({
      sectionKey: nextKey(),
      type: "list",
      items: [""],
    }),
  },
  {
    type: "faq",
    label: "FAQ",
    icon: HelpCircle,
    defaultSection: () => ({
      sectionKey: nextKey(),
      type: "faq",
      faqs: [{ question: "", answer: "" }],
    }),
  },
  {
    type: "cta",
    label: "CTA",
    icon: MousePointerClick,
    defaultSection: () => ({
      sectionKey: nextKey(),
      type: "cta",
      ctas: [{ label: "Enquire", link: "/contact", variant: "primary" }],
    }),
  },
];
