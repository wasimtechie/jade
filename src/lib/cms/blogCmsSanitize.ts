import DOMPurify from "isomorphic-dompurify";

const HTML_BODY_SANITIZE_OPTS = {
  USE_PROFILES: { html: true },
  ADD_TAGS: ["link"],
  ADD_ATTR: [
    "target",
    "rel",
    "class",
    "id",
    "style",
    "href",
    "src",
    "alt",
    "width",
    "height",
    "loading",
    "decoding",
  ],
};

/** Strip dangerous CSS while keeping layout rules from trusted CMS authors. */
function sanitizeStyleBlock(styleTag: string): string {
  return styleTag
    .replace(/expression\s*\(/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/@import\b/gi, "")
    .replace(/behavior\s*:/gi, "");
}

/**
 * DOMPurify drops leading `<style>` blocks even with ADD_TAGS — extract, sanitize
 * markup separately, then prepend styles so pasted blog HTML keeps buttons/headings.
 */
export function sanitizeHtmlSection(raw: string): string {
  const styleBlocks: string[] = [];
  const withoutStyles = raw.replace(
    /<style[^>]*>[\s\S]*?<\/style>/gi,
    (match) => {
      styleBlocks.push(sanitizeStyleBlock(match));
      return "";
    },
  );

  const body = DOMPurify.sanitize(withoutStyles, HTML_BODY_SANITIZE_OPTS);
  const styles = styleBlocks.join("\n");
  return styles ? `${styles}\n${body}` : body;
}

export function sanitizeRichTextHtml(raw: string): string {
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { html: true },
    ADD_TAGS: ["mark"],
    ADD_ATTR: ["target", "rel", "class", "href", "src", "alt"],
  });
}
