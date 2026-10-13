// ─── Blog Section types ───────────────────────────────────────────────────────
export interface BlogSection {
  type:
    | "text"
    | "image"
    | "quote"
    | "list"
    | "table"
    | "faq"
    | "heading"
    | "cta"
    | "html"
    | "gallery"
    | "button"
    | "video"
    | "callout"
    | "divider";
  content?: string;
  image?: string;
  caption?: string;
  items?: string[];
  level?: 2 | 3 | 4 | 5 | 6 | 1;
  rawHtml?: string;
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  faqs?: {
    question: string;
    answer: string;
  }[];
  ctas?: {
    label: string;
    link: string;
    variant: "primary" | "outline" | "secondary";
  }[];
  settings?: {
    alt?: string;
    alignment?: "left" | "center" | "right";
    width?: "full" | "large" | "medium";
    rounded?: boolean;
    layout?: "grid" | "carousel";
    galleryImages?: { url: string; alt?: string; caption?: string }[];
    listStyle?: "bullet" | "ordered" | "checklist";
    checklistItems?: { text: string; checked: boolean }[];
    buttonVariant?: "primary" | "secondary" | "outline";
    openInNewTab?: boolean;
    ctaTitle?: string;
    ctaDescription?: string;
    videoUrl?: string;
    calloutType?: "info" | "warning" | "success" | "note" | "tip";
  };
}

// ─── BlogPost interface ───────────────────────────────────────────────────────
export interface BlogPost {
  id: number;
  slug: string; // URL-safe, lowercase, hyphenated
  title: string;
  excerpt: string; // Short teaser shown on blog listing cards
  description: string; // 120–160 chars — used as meta description & OG description
  image: string;
  link: string;
  date: string; // ISO 8601: "2024-03-20" — used in Article datePublished
  dateModified?: string; // ISO 8601 — used in Article dateModified schema
  category: string;
  readTime: string;
  author: string; // Author name for Article schema
  tags: string[]; // For filtering & schema keywords
  isFeatured?: boolean;
  isPublished: boolean; // false = draft, excluded from listing and sitemap
  thumbnail?: string;
  faqs?: { question: string; answer: string }[];
  schemas?: {
    article: boolean;
    faq: boolean;
    howTo: boolean;
    breadcrumb: boolean;
  };
  seo?: {
    metaTitle?: string;
    focusKeyword?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    robotsIndex?: boolean;
    robotsFollow?: boolean;
  };
  advancedSchema?: {
    type: "none" | "faq" | "howto" | "article";
    faqs?: { question: string; answer: string }[];
  };
  sections: BlogSection[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns only published posts — use this everywhere instead of raw BLOG_POSTS */
export function getPublishedPosts(): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.isPublished);
}

/** Find a single published post by its slug */
export function getPostBySlug(slug: string): BlogPost | undefined {
  const decoded = decodeURIComponent(slug).toLowerCase();
  return BLOG_POSTS.find(
    (p) => p.isPublished && p.slug.toLowerCase() === decoded,
  );
}

// ─── Build-time duplicate slug guard ─────────────────────────────────────────
// Throws during `next build` if any two posts share a slug
function assertUniqueSlugs(posts: BlogPost[]) {
  const seen = new Set<string>();
  for (const post of posts) {
    if (seen.has(post.slug)) {
      throw new Error(`[blogs.ts] Duplicate slug detected: "${post.slug}"`);
    }
    seen.add(post.slug);
  }
}

// ─── Blog Posts ───────────────────────────────────────────────────────────────
export const BLOG_POSTS: BlogPost[] = [
  {
    id: 99,
    slug: "corporate-team-outing-bangalore-guide",
    title:
      "Elevate Your Corporate Team Outing in Bangalore: Exclusive Luxury Villas & Private Retreats",
    excerpt:
      "Planning a company offsite? Step away from generic hotels and discover why a private luxury villa buyout is the ultimate canvas for team bonding and productivity.",
    description:
      "Discover why Jade Hospitainment's private Luxury Villas near Bangalore are the ultimate venue for corporate team outings, offsites, and workcations. Exclusive buyouts, bespoke catering, and inspiring spaces.",
    image: "/Villa_Retreats/Jade%20735/Hero/Hero 1.webp",
    link: "/corporate-team-outing-bangalore-guide/",
    date: "2024-03-20",
    dateModified: "2024-03-20",
    category: "CORPORATE",
    readTime: "20 min read",
    author: "Jade Hospitainment",
    tags: [
      "corporate retreat",
      "team outing",
      "luxury villa",
      "Bangalore",
      "offsite",
    ],
    isFeatured: true,
    isPublished: true,
    sections: [
      {
        type: "text",
        content:
          "Planning a corporate team outing in Bangalore requires more than just booking a generic hotel block; it demands a space that fosters genuine connection, unobstructed focus, and memorable team bonding. At Jade Hospitainment, we redefine the company offsite. Step away from crowded lobbies, shared buffets, and rigid conference rooms. Instead, imagine your team stepping into a sprawling, private luxury villa located in the serene landscapes of Devanahalli or Kanakapura Road—where the entire estate belongs exclusively to your group.",
      },
      {
        type: "cta",
        ctas: [
          { label: "Plan Your Offsite", link: "/contact", variant: "primary" },
          { label: "Explore Retreats", link: "/retreats/", variant: "outline" },
        ],
      },
      {
        type: "heading",
        level: 2,
        content: "The Jade Difference: Private Villas vs. Shared Hotels",
      },
      {
        type: "text",
        content:
          "When searching for private corporate retreat locations, decision-makers frequently default to standard luxury hotels out of habit. However, standard hotels dilute the offsite experience through shared infrastructure and rigid operational hours. A private villa buyout shifts the paradigm, ensuring your team building Luxury Villas cater entirely to your schedule, your culture, and your objectives.",
      },
      {
        type: "table",
        tableData: {
          headers: ["Traditional Shared Resorts", "Jade Private Villas"],
          rows: [
            [
              "Shared Infrastructure: Navigating common areas, shared buffets, and lobbies with hundreds of other strangers.",
              "Absolute Exclusivity: The entire property—including expansive lawns and private pools—is a private buyout dedicated solely to your team.",
            ],
            [
              "Rigid F&B Policies: Mandatory use of in-house catering with inflexible menus and strict dining schedules.",
              "Bespoke & Flexible Catering: Total freedom. We allow outside catering for large events, ensuring your specific culinary preferences are perfectly met.",
            ],
            [
              "Siloed Accommodations: Employees scattered across different floors, reducing spontaneous interaction.",
              "Unified Living Spaces: Grand lounges and interconnected pavilions naturally encourage collaboration and organic team bonding.",
            ],
            [
              "Cookie-Cutter Conference Rooms: Windowless, uninspiring boardrooms that drain energy and stifle creative thinking.",
              "Inspiring Environments: Strategy sessions by a shimmering pool, brainstorms on emerald lawns, or sunlit dome workshops.",
            ],
          ],
        },
      },
      {
        type: "heading",
        level: 2,
        content: "Tailored Exclusivity: Designed for Groups & Corporates",
      },
      {
        type: "text",
        content:
          "We provide 'Private & Exclusive Spaces.' Unlike conventional hotels, we do not operate on a room-by-room basis for individual couples. Our estates are exclusively available for groups—startup offsites, corporate delegations, and large family gatherings—guaranteeing 100% privacy and an uninterrupted sanctuary for your team.",
      },
      {
        type: "heading",
        level: 2,
        content: "Signature Retreats for Your Next Company Offsite",
      },
      {
        type: "heading",
        level: 3,
        content: "Jade 735",
      },
      {
        type: "text",
        content:
          "Located in Devanahalli, Jade 735 is an architectural masterpiece just 15 minutes from the airport. Perfect for intimate high-stakes board meetings and C-suite escapes.",
      },
      {
        type: "heading",
        level: 3,
        content: "Magnolia by Jade",
      },
      {
        type: "text",
        content:
          "A colonial-inspired estate with vast manicured lawns ideal for expansive team-building exercises and outdoor workshops.",
      },
      {
        type: "heading",
        level: 3,
        content: "Dome Villas",
      },
      {
        type: "text",
        content:
          "Futuristic, eco-luxury aesthetic. The sweeping interior spaces foster a sense of unity and boundless creativity for hackathons and innovation sprints.",
      },
      {
        type: "image",
        image:
          "/Experiences/Corporate Retreats/1-Hero/xhero.webp",
        caption:
          "Jade 735: The pinnacle of boutique luxury with temperature-controlled pools.",
      },
      {
        type: "heading",
        level: 2,
        content: "Beyond the Boardroom: Mid-Week Workcations",
      },
      {
        type: "text",
        content:
          "While weekends are often sold out, we aggressively champion the 'Mid-Week Workcation' (Monday–Thursday). Relocating to a serene environment mid-week eliminates urban distractions, injecting fresh energy into ongoing projects without encroaching on personal weekend time.",
      },
      {
        type: "faq",
        faqs: [
          {
            question: "Can we bring outside catering for our corporate event?",
            answer:
              "Yes, absolutely. We are highly flexible. While we offer exceptional in-house culinary services, we allow outside catering for large group offsites.",
          },
          {
            question: "What is the alcohol policy at Jade retreats?",
            answer:
              "We strictly adhere to local Homestay Guidelines (2.3L per person). For larger events serving alcohol, we facilitate the procurement of a standard one-day liquor license.",
          },
          {
            question:
              "Is mid-week booking available at a discount for workcations?",
            answer:
              "Yes! We offer curated mid-week packages and favorable rates for corporate teams looking for a productive Mon-Thu escape.",
          },
        ],
      },
      {
        type: "heading",
        level: 2,
        content: "Ready to Transform Your Next Corporate Event?",
      },
      {
        type: "text",
        content:
          "Your team's potential is unlocked when you remove them from the mundane and place them in the extraordinary. Stop settling for shared spaces. Elevate your corporate outing with Jade.",
      },
      {
        type: "cta",
        ctas: [
          {
            label: "Connect With Our Corporate Concierge",
            link: "/contact",
            variant: "primary",
          },
        ],
      },
    ],
  },
  {
    id: 1,
    slug: "the-art-of-slow-living",
    title: "The Art of Slow Living: A Guide to Disconnecting",
    excerpt:
      "Welcome to Jade Hospitainment. Discover our unique approach to hosting and why taking time to disconnect is essential for modern wellbeing.",
    description:
      "Escape the always-on culture and embrace slow living at Jade Hospitainment's luxury Private Villas near Bangalore. A guide to intentional rest, digital detox, and the art of truly unwinding.",
    image: "/Villa_Retreats/Tranquil Woods/1-Hero/Hero 1.webp",
    link: "/the-art-of-slow-living/",
    date: "2024-03-15",
    dateModified: "2024-03-15",
    category: "WELLNESS",
    readTime: "8 min read",
    author: "Jade Hospitainment",
    tags: [
      "slow living",
      "wellness",
      "digital detox",
      "luxury stays",
      "Bangalore",
    ],
    isFeatured: false,
    isPublished: true,
    sections: [
      {
        type: "text",
        content:
          "In an era of relentless notifications and 'always-on' culture, the art of slow living has become a revolutionary act. At Jade, we design our VILLAS as sanctuaries where the digital world fades into the background. It's about reclaiming your time and refocusing your senses on the immediate environment.",
      },
      {
        type: "quote",
        content:
          "Solitude is where we find ourselves; Jade is where we find our peace.",
      },
      {
        type: "text",
        content:
          "From the tactile quality of our hand-picked finishes to the sound of wind through the trees in our garden retreats, every element is an invitation to pause. Slow living isn't about doing nothing; it's about doing everything with intention.",
      },
    ],
  },

  // ─── NEW ARTICLE TEMPLATE ─────────────────────────────────────────────────
  // Copy the block below for every new article you publish.
  // 1. Fill in all fields
  // 2. Set isPublished: true when ready to go live
  // 3. Place hero image in /public/blog/[slug]/hero.jpg (max 200KB)
  // 4. Run `next build` to verify no errors
  // 5. Submit URL in Google Search Console → Request Indexing
  // ─────────────────────────────────────────────────────────────────────────
  // {
  //   id: 2,                         // Increment from last post
  //   slug: "your-article-slug",     // lowercase, hyphenated, < 60 chars
  //   title: "Your Article Title",
  //   excerpt: "Short teaser shown on the blog listing card.",
  //   description: "120–160 char meta description for Google search snippet.",
  //   image: "/blog/your-article-slug/hero.jpg",
  //   link: "/your-article-slug/",
  //   date: "2026-03-27",            // ISO 8601 — original publish date
  //   dateModified: "2026-03-27",
  //   category: "WELLNESS",          // WELLNESS | CORPORATE | TRAVEL | EXPERIENCES
  //   readTime: "5 min read",
  //   author: "Jade Hospitainment",
  //   tags: ["tag1", "tag2", "tag3"],
  //   isFeatured: false,
  //   isPublished: false,            // ← Set to true to publish
  //   sections: [],
  // },
  {
    id: 3,
    slug: "ultimate-guide-private-VILLAS",
    title: "The Ultimate Guide to Booking Private Villas",
    excerpt: "Find out what makes a private villa the best choice for your next vacation or staycation.",
    description: "Discover the unparalleled privacy and luxury of booking a private villa for your next getaway.",
    image: "/Villa_Retreats/Magnolia/Hero/hero.webp",
    link: "/ultimate-guide-private-VILLAS/",
    date: "2024-04-10",
    dateModified: "2024-04-10",
    category: "TRAVEL",
    readTime: "6 min read",
    author: "Jade Hospitainment",
    tags: ["private villa", "travel", "vacation"],
    isFeatured: false,
    isPublished: true,
    sections: [
      {
        type: "text",
        content: "Choosing the right accommodation can make or break your vacation. While hotels offer convenience, Private Villas provide an unmatched level of privacy, space, and personalized service.",
      }
    ],
  },
  {
    id: 4,
    slug: "hosting-unforgettable-events-jade",
    title: "Hosting Unforgettable Events at Jade",
    excerpt: "From intimate gatherings to large celebrations, learn how to make your events truly memorable.",
    description: "Explore the endless possibilities of hosting your next big event, wedding, or party at our exclusive Jade properties.",
    image: "/Villa_Retreats/Diamond/Hero/Hero 1.webp",
    link: "/hosting-unforgettable-events-jade/",
    date: "2024-04-15",
    dateModified: "2024-04-15",
    category: "EXPERIENCES",
    readTime: "7 min read",
    author: "Jade Hospitainment",
    tags: ["events", "celebrations", "weddings"],
    isFeatured: false,
    isPublished: true,
    sections: [
      {
        type: "text",
        content: "Every milestone deserves a celebration that is as unique as the occasion itself. At Jade Hospitainment, we specialize in turning your vision into a reality, offering breathtaking venues that serve as the perfect backdrop for your unforgettable moments.",
      }
    ],
  },
];

// ─── Validate at build time ───────────────────────────────────────────────────
assertUniqueSlugs(BLOG_POSTS);
