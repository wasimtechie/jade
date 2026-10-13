"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { BlogSection } from "@/data/blogs";
import {
  isManualBlogPost,
  renderInlineFormatting,
  splitProseParagraphs,
} from "@/components/blog/blogProseUtils";
import { isRichHtmlContent } from "@/lib/cms/blogBlocks";
import { parseVideoEmbed } from "@/lib/cms/videoEmbed";
import { isUnoptimizedMediaUrl } from "@/lib/media/urls";

type BlogSectionRendererProps = {
  sections: BlogSection[];
  onEnquireClick?: () => void;
  className?: string;
};

function ProseText({ content }: { content: string }) {
  if (isRichHtmlContent(content)) {
    return (
      <div
        className="blog-prose-rich"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  const paragraphs = splitProseParagraphs(content);
  if (paragraphs.length <= 1) {
    return (
      <p className="blog-prose-p">
        {renderInlineFormatting(content.trim())}
      </p>
    );
  }
  return (
    <>
      {paragraphs.map((para, i) => (
        <p key={i} className="blog-prose-p">
          {renderInlineFormatting(para)}
        </p>
      ))}
    </>
  );
}

export function BlogSectionRenderer({
  sections,
  onEnquireClick,
  className,
}: BlogSectionRendererProps) {
  const manual = isManualBlogPost(sections);
  const rootClass = manual
    ? `blog-manual-prose ${className ?? ""}`.trim()
    : className ?? "space-y-10";

  return (
    <div className={rootClass}>
      {sections.map((section, idx) => {
        const blockClass = manual ? "blog-prose-block" : undefined;

        switch (section.type) {
          case "html":
            return (
              <div
                key={idx}
                className="blog-html-section"
                dangerouslySetInnerHTML={{
                  __html: section.rawHtml ?? "",
                }}
              />
            );
          case "text":
            return (
              <div key={idx} className={blockClass}>
                <ProseText content={section.content ?? ""} />
              </div>
            );
          case "quote":
            return (
              <blockquote key={idx} className={`blog-prose-quote ${blockClass ?? ""}`}>
                <span className="blog-prose-quote-mark" aria-hidden>
                  &ldquo;
                </span>
                <p className="blog-prose-quote-text">{section.content}</p>
              </blockquote>
            );
          case "image": {
            const align = section.settings?.alignment ?? "center";
            const width = section.settings?.width ?? "large";
            const rounded = section.settings?.rounded;
            return (
              <figure
                key={idx}
                className={`blog-prose-image blog-prose-image--${align} blog-prose-image--${width} ${rounded ? "blog-prose-image--rounded" : ""} ${blockClass ?? ""}`}
              >
                <div className="blog-prose-image-frame">
                  <Image
                    src={section.image || ""}
                    alt={section.settings?.alt || section.caption || "Content image"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 65vw"
                    unoptimized={isUnoptimizedMediaUrl(section.image ?? "")}
                  />
                </div>
                {section.caption && (
                  <figcaption className="blog-prose-image-caption">
                    {section.caption}
                  </figcaption>
                )}
              </figure>
            );
          }
          case "table":
            return (
              <div
                key={idx}
                className={`blog-prose-table-wrap ${blockClass ?? ""}`}
              >
                <table className="blog-prose-table">
                  <thead>
                    <tr>
                      {section.tableData?.headers.map((header, i) => (
                        <th key={i}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.tableData?.rows.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "faq":
            return (
              <div key={idx} className={`blog-prose-faq ${blockClass ?? ""}`}>
                <h3 className="blog-prose-faq-title">Frequently Asked Questions</h3>
                {section.faqs?.map((faq, i) => (
                  <details key={i} className="blog-prose-faq-item">
                    <summary>
                      <span>{faq.question}</span>
                      <ChevronRight
                        className="blog-prose-faq-chevron"
                        aria-hidden
                      />
                    </summary>
                    <div className="blog-prose-faq-answer">{faq.answer}</div>
                  </details>
                ))}
              </div>
            );
          case "heading": {
            const lvl = section.level ?? 2;
            const Tag = (`h${Math.min(6, Math.max(1, lvl))}` as "h1");
            const classMap: Record<number, string> = {
              1: "blog-prose-h1",
              2: "blog-prose-h2",
              3: "blog-prose-h3",
              4: "blog-prose-h4",
              5: "blog-prose-h5",
              6: "blog-prose-h6",
            };
            return (
              <Tag key={idx} className={`${classMap[lvl] ?? "blog-prose-h2"} ${blockClass ?? ""}`}>
                {section.content}
              </Tag>
            );
          }
          case "gallery": {
            const images = section.settings?.galleryImages?.filter((g) => g.url) ?? [];
            const layout = section.settings?.layout ?? "grid";
            if (!images.length) return null;
            return (
              <figure key={idx} className={`blog-prose-gallery blog-prose-gallery--${layout} ${blockClass ?? ""}`}>
                <div className={layout === "carousel" ? "blog-prose-gallery-track" : "blog-prose-gallery-grid"}>
                  {images.map((img, i) => (
                    <div key={i} className="blog-prose-gallery-item">
                      <Image
                        src={img.url}
                        alt={img.alt || ""}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                        unoptimized={isUnoptimizedMediaUrl(img.url)}
                      />
                      {img.caption && (
                        <figcaption className="blog-prose-image-caption">{img.caption}</figcaption>
                      )}
                    </div>
                  ))}
                </div>
              </figure>
            );
          }
          case "button": {
            const cta = section.ctas?.[0];
            const variant = section.settings?.buttonVariant ?? "primary";
            const className =
              variant === "outline"
                ? "blog-prose-cta blog-prose-cta--outline"
                : variant === "secondary"
                  ? "blog-prose-cta blog-prose-cta--outline"
                  : "blog-prose-cta blog-prose-cta--primary";
            if (!cta?.link) return null;
            return (
              <div key={idx} className={`blog-prose-cta-group ${blockClass ?? ""}`}>
                <Link
                  href={cta.link}
                  className={className}
                  target={section.settings?.openInNewTab ? "_blank" : undefined}
                  rel={section.settings?.openInNewTab ? "noopener noreferrer" : undefined}
                >
                  {cta.label}
                </Link>
              </div>
            );
          }
          case "video": {
            const embed = parseVideoEmbed(section.settings?.videoUrl ?? "");
            if (!embed.embedUrl) return null;
            return (
              <div key={idx} className={`blog-prose-video ${blockClass ?? ""}`}>
                <iframe
                  src={embed.embedUrl}
                  title="Embedded video"
                  allowFullScreen
                  className="blog-prose-video-frame"
                />
              </div>
            );
          }
          case "callout":
            return (
              <div
                key={idx}
                className={`blog-prose-callout blog-prose-callout--${section.settings?.calloutType ?? "info"} ${blockClass ?? ""}`}
              >
                {section.content}
              </div>
            );
          case "divider":
            return <hr key={idx} className={`blog-prose-divider ${blockClass ?? ""}`} />;
          case "list": {
            const style = section.settings?.listStyle ?? "bullet";
            if (style === "ordered") {
              return (
                <ol key={idx} className={`blog-prose-ol ${blockClass ?? ""}`}>
                  {section.items?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ol>
              );
            }
            return (
              <ul key={idx} className={`blog-prose-list ${blockClass ?? ""}`}>
                {section.items?.map((item, i) => (
                  <li key={i} className="blog-prose-list-item">
                    <span className={`blog-prose-list-bullet ${style === "checklist" ? "blog-prose-list-check" : ""}`} aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
          }
          case "cta":
            return (
              <div key={idx} className={`blog-prose-cta-banner ${blockClass ?? ""}`}>
                {section.settings?.ctaTitle && (
                  <h3 className="blog-prose-cta-banner-title">{section.settings.ctaTitle}</h3>
                )}
                {section.settings?.ctaDescription && (
                  <p className="blog-prose-cta-banner-desc">{section.settings.ctaDescription}</p>
                )}
                <div className="blog-prose-cta-group">
                  {section.ctas?.map((cta, i) => {
                    const isEnquire = cta.link === "/contact";
                    const isPrimary = cta.variant === "primary";
                    const btnClass = `blog-prose-cta ${
                      isPrimary ? "blog-prose-cta--primary" : "blog-prose-cta--outline"
                    }`;
                    if (isEnquire && onEnquireClick) {
                      return (
                        <button key={i} type="button" className={btnClass} onClick={onEnquireClick}>
                          {cta.label}
                        </button>
                      );
                    }
                    return (
                      <Link key={i} href={cta.link} className={btnClass}>
                        {cta.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
