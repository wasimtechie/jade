import type { ReactNode } from "react";
import type { BlogPost, BlogSection } from "@/data/blogs";

/** True when post body is built from manual blocks (not a single HTML paste). */
export function isManualBlogPost(sections: BlogSection[]): boolean {
  return sections.length > 0 && !sections.some((s) => s.type === "html");
}

/** Show meta excerpt as lead when it is not duplicated by the opening text block. */
export function shouldShowProseLead(post: BlogPost): boolean {
  if (!isManualBlogPost(post.sections)) return false;
  const excerpt = post.excerpt?.trim();
  if (!excerpt) return false;
  const firstText = post.sections.find((s) => s.type === "text")?.content?.trim();
  if (!firstText) return true;
  const snippet = excerpt.slice(0, Math.min(80, excerpt.length));
  return !firstText.startsWith(snippet);
}

/** Split textarea content into paragraphs; supports **bold** markers. */
export function splitProseParagraphs(content: string): string[] {
  return content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function renderInlineFormatting(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="blog-prose-strong">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
