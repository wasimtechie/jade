import type { CmsBlogSection } from "@/lib/cms/blogCms";
import type { BlogSection } from "@/data/blogs";

export type BlogBlockType = NonNullable<BlogSection["type"]>;

export type GalleryImage = {
  url: string;
  alt?: string;
  caption?: string;
};

export type BlogBlockSettings = {
  alt?: string;
  alignment?: "left" | "center" | "right";
  width?: "full" | "large" | "medium";
  rounded?: boolean;
  layout?: "grid" | "carousel";
  galleryImages?: GalleryImage[];
  listStyle?: "bullet" | "ordered" | "checklist";
  checklistItems?: { text: string; checked: boolean }[];
  buttonVariant?: "primary" | "secondary" | "outline";
  openInNewTab?: boolean;
  ctaTitle?: string;
  ctaDescription?: string;
  videoUrl?: string;
  calloutType?: "info" | "warning" | "success" | "note" | "tip";
};

export type SlashCommand = {
  id: string;
  label: string;
  description: string;
  type: BlogBlockType;
  keywords: string[];
};

let blockCounter = 0;

export function nextBlockKey(): string {
  blockCounter += 1;
  return `block-${blockCounter}-${Date.now()}`;
}

export function createBlock(
  type: BlogBlockType,
  patch?: Partial<CmsBlogSection>,
): CmsBlogSection {
  const base: CmsBlogSection = {
    sectionKey: nextBlockKey(),
    type,
    settings: {},
  };

  switch (type) {
    case "text":
      return { ...base, content: "<p></p>", ...patch };
    case "heading":
      return { ...base, content: "", level: 2, ...patch };
    case "quote":
      return { ...base, content: "", ...patch };
    case "image":
      return {
        ...base,
        image: "",
        caption: "",
        settings: { alignment: "center", width: "large", rounded: false },
        ...patch,
      };
    case "gallery":
      return {
        ...base,
        settings: { layout: "grid", galleryImages: [] },
        ...patch,
      };
    case "list":
      return {
        ...base,
        items: [""],
        settings: { listStyle: "bullet" },
        ...patch,
      };
    case "table":
      return {
        ...base,
        tableData: {
          headers: ["Column 1", "Column 2"],
          rows: [["", ""]],
        },
        ...patch,
      };
    case "faq":
      return {
        ...base,
        faqs: [{ question: "", answer: "" }],
        ...patch,
      };
    case "cta":
      return {
        ...base,
        content: "",
        settings: { ctaTitle: "", ctaDescription: "" },
        ctas: [{ label: "Learn more", link: "/contact", variant: "primary" }],
        ...patch,
      };
    case "button":
      return {
        ...base,
        content: "Button label",
        settings: {
          buttonVariant: "primary",
          openInNewTab: false,
        },
        ctas: [{ label: "Button", link: "/", variant: "primary" }],
        ...patch,
      };
    case "video":
      return { ...base, settings: { videoUrl: "" }, ...patch };
    case "callout":
      return {
        ...base,
        content: "",
        settings: { calloutType: "info" },
        ...patch,
      };
    case "divider":
      return { ...base, ...patch };
    case "html":
      return { ...base, rawHtml: "", ...patch };
    default:
      return { ...base, ...patch };
  }
}

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: "paragraph",
    label: "Paragraph",
    description: "Plain rich text",
    type: "text",
    keywords: ["text", "p", "paragraph"],
  },
  {
    id: "heading",
    label: "Heading",
    description: "Section heading",
    type: "heading",
    keywords: ["h1", "h2", "h3", "title"],
  },
  {
    id: "image",
    label: "Image",
    description: "Single image with caption",
    type: "image",
    keywords: ["img", "photo", "picture"],
  },
  {
    id: "gallery",
    label: "Gallery",
    description: "Multiple images",
    type: "gallery",
    keywords: ["images", "carousel", "grid"],
  },
  {
    id: "button",
    label: "Button",
    description: "Call-to-action button",
    type: "button",
    keywords: ["btn", "link"],
  },
  {
    id: "cta",
    label: "CTA",
    description: "Title, description, and button",
    type: "cta",
    keywords: ["call to action", "banner"],
  },
  {
    id: "faq",
    label: "FAQ",
    description: "Question and answer block",
    type: "faq",
    keywords: ["questions", "accordion"],
  },
  {
    id: "quote",
    label: "Quote",
    description: "Pull quote",
    type: "quote",
    keywords: ["blockquote"],
  },
  {
    id: "divider",
    label: "Divider",
    description: "Horizontal line",
    type: "divider",
    keywords: ["hr", "line", "separator"],
  },
  {
    id: "video",
    label: "Video",
    description: "YouTube or Vimeo embed",
    type: "video",
    keywords: ["youtube", "vimeo", "embed"],
  },
  {
    id: "table",
    label: "Table",
    description: "Data table",
    type: "table",
    keywords: ["grid", "rows"],
  },
  {
    id: "callout",
    label: "Callout",
    description: "Info, warning, or tip box",
    type: "callout",
    keywords: ["alert", "note", "tip"],
  },
  {
    id: "html",
    label: "Custom HTML",
    description: "Embed or custom markup",
    type: "html",
    keywords: ["embed", "iframe", "code"],
  },
];

export function filterSlashCommands(query: string): SlashCommand[] {
  const q = query.trim().toLowerCase();
  if (!q) return SLASH_COMMANDS;
  return SLASH_COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.keywords.some((k) => k.includes(q)),
  );
}

export function isRichHtmlContent(content?: string): boolean {
  if (!content?.trim()) return false;
  return /<\/?[a-z][\s\S]*>/i.test(content);
}
