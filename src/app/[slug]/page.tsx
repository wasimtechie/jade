import { Metadata } from "next";
import { notFound } from "next/navigation";
import PostContent from "../blogs/[slug]/PostContent";
import "@/styles/blog-prose.css";
import JsonLd from "@/components/seo/JsonLd";
import {
  getMergedPostBySlug,
  getMergedPublishedPosts,
  getStaticBlogSlugs,
} from "@/lib/cms/blogStore";
import {
  defaultCanonicalUrl,
  resolvePostFaqs,
  resolvePostSchemas,
  SITE_ORIGIN,
} from "@/lib/cms/blogCmsMeta";
import type { BlogPost } from "@/data/blogs";

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getStaticBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getMergedPostBySlug(params.slug);

  if (!post) {
    // Resolve missing/draft articles before streaming starts so the HTTP status is 404.
    notFound();
  }

  const seo = post.seo;
  const title = seo?.metaTitle || post.title;
  const description =
    post.description ||
    post.sections.find((s) => s.type === "text")?.content?.slice(0, 160) ||
    "Read the latest from Jade Hospitainment Journal.";
  const canonical = seo?.canonicalUrl || defaultCanonicalUrl(post.slug);
  const ogTitle = seo?.ogTitle || title;
  const ogDescription = seo?.ogDescription || description;
  const ogImage = seo?.ogImage || post.image;
  const index = seo?.robotsIndex !== false;
  const follow = seo?.robotsFollow !== false;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: {
      index,
      follow,
      googleBot: { index, follow },
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: `${SITE_ORIGIN}/${post.slug}/`,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.dateModified || post.date,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
  };
}

function buildSchemas(post: BlogPost) {
  const flags = resolvePostSchemas(post);
  const pageUrl = `${SITE_ORIGIN}/${post.slug}/`;

  const articleSchema = flags.article
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.description,
        image: [post.image],
        datePublished: post.date,
        dateModified: post.dateModified || post.date,
        author: {
          "@type": "Organization",
          name: post.author || "Jade Hospitainment",
          url: SITE_ORIGIN,
        },
        publisher: {
          "@type": "Organization",
          name: "Jade Hospitainment",
          logo: {
            "@type": "ImageObject",
            url: `${SITE_ORIGIN}/logo.png`,
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": pageUrl,
        },
      }
    : null;

  const faqItems = resolvePostFaqs(post).filter(
    (f) => f.question.trim() && f.answer.trim(),
  );
  const faqSchema =
    flags.faq && faqItems.length
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  const listSteps = post.sections
    .filter((s) => s.type === "list" && s.items?.length)
    .flatMap((s) => s.items ?? []);
  const howToSchema =
    flags.howTo && listSteps.length
      ? {
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: post.title,
          description: post.description,
          step: listSteps.map((item, i) => ({
            "@type": "HowToStep",
            position: i + 1,
            name: item,
            text: item,
          })),
        }
      : null;

  const breadcrumbSchema = flags.breadcrumb
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_ORIGIN,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: `${SITE_ORIGIN}/blogs/`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: pageUrl,
          },
        ],
      }
    : null;

  return { articleSchema, faqSchema, howToSchema, breadcrumbSchema };
}

export default async function BlogPage({ params }: Props) {
  const post = await getMergedPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getMergedPublishedPosts();
  const relatedPosts = allPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  const { articleSchema, faqSchema, howToSchema, breadcrumbSchema } =
    buildSchemas(post);

  return (
    <>
      {articleSchema && <JsonLd schema={articleSchema} />}
      {breadcrumbSchema && <JsonLd schema={breadcrumbSchema} />}
      {faqSchema && <JsonLd schema={faqSchema} />}
      {howToSchema && <JsonLd schema={howToSchema} />}
      <PostContent post={post} relatedPosts={relatedPosts} />
    </>
  );
}
