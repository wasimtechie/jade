export type HtmlSnippet = {
  label: string;
  category: string;
  html: string;
};

export const HTML_SNIPPETS: HtmlSnippet[] = [
  {
    label: "2-column grid",
    category: "Advanced",
    html: `<section class="grid gap-6 md:grid-cols-2">
  <div class="border border-white/10 p-6">
    <h3 class="text-xl font-semibold text-[#EFCD62]">Column one</h3>
    <p class="mt-2 text-white/70">Edit this column content.</p>
  </div>
  <div class="border border-white/10 p-6">
    <h3 class="text-xl font-semibold text-[#EFCD62]">Column two</h3>
    <p class="mt-2 text-white/70">Edit this column content.</p>
  </div>
</section>`,
  },
  {
    label: "FAQ accordion (native details)",
    category: "Advanced",
    html: `<section class="space-y-3">
  <details class="border border-white/10 p-4">
    <summary class="cursor-pointer font-semibold text-white">Question one?</summary>
    <p class="mt-2 text-white/70">Answer one.</p>
  </details>
  <details class="border border-white/10 p-4">
    <summary class="cursor-pointer font-semibold text-white">Question two?</summary>
    <p class="mt-2 text-white/70">Answer two.</p>
  </details>
</section>`,
  },
  {
    label: "Image with caption card",
    category: "Advanced",
    html: `<figure class="border border-white/10 overflow-hidden">
  <img src="/blogs/placeholder.jpg" alt="Describe the image" class="w-full object-cover" />
  <figcaption class="p-4 text-sm text-white/50 italic">Caption text</figcaption>
</figure>`,
  },
  {
    label: "CTA banner",
    category: "Advanced",
    html: `<section class="border border-[#EFCD62]/40 bg-[#EFCD62]/10 p-8 text-center">
  <h2 class="text-2xl font-semibold text-white">Ready to plan your retreat?</h2>
  <p class="mt-2 text-white/70">Speak with our concierge team.</p>
  <a href="/contact" class="mt-4 inline-block bg-[#EFCD62] px-6 py-3 font-bold text-[#1A1C1E]">Enquire now</a>
</section>`,
  },
  {
    label: "Comparison table",
    category: "Advanced",
    html: `<table class="w-full border-collapse border border-white/10 text-left">
  <thead>
    <tr class="bg-white/5">
      <th class="p-4 text-[#EFCD62]">Feature</th>
      <th class="p-4 text-[#EFCD62]">Option A</th>
      <th class="p-4 text-[#EFCD62]">Option B</th>
    </tr>
  </thead>
  <tbody>
    <tr class="border-t border-white/10">
      <td class="p-4">Capacity</td>
      <td class="p-4">12 guests</td>
      <td class="p-4">20 guests</td>
    </tr>
  </tbody>
</table>`,
  },
  {
    label: "Section wrapper",
    category: "Structure",
    html: `<section class="py-8">
  <h2 class="text-2xl text-white">Section heading</h2>
  <p class="mt-4 text-white/70">Section body copy.</p>
</section>`,
  },
  {
    label: "Paragraph",
    category: "Text",
    html: `<p class="text-lg text-white/80 leading-relaxed">Your paragraph text here.</p>`,
  },
  {
    label: "Heading H2",
    category: "Text",
    html: `<h2 class="text-3xl font-semibold text-white border-b border-white/10 pb-3">Heading</h2>`,
  },
];

export const HTML_ELEMENT_GROUPS: { category: string; tags: string[] }[] = [
  {
    category: "Structure",
    tags: ["div", "section", "article", "header", "footer", "aside"],
  },
  {
    category: "Text",
    tags: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "blockquote"],
  },
  {
    category: "Lists",
    tags: ["ul", "ol", "li"],
  },
  {
    category: "Media",
    tags: ["img", "figure", "figcaption", "video", "iframe"],
  },
  {
    category: "Interactive",
    tags: ["a", "button", "details", "summary"],
  },
];

export function wrapTag(tag: string): string {
  const voidTags = new Set(["img", "iframe"]);
  if (voidTags.has(tag)) {
    if (tag === "img") {
      return `<img src="" alt="" class="" />`;
    }
    return `<${tag} src="" class=""></${tag}>`;
  }
  if (tag === "a") {
    return `<a href="#" class="">Link text</a>`;
  }
  if (tag === "details") {
    return `<details class=""><summary>Summary</summary><p>Details content</p></details>`;
  }
  return `<${tag} class="">Content</${tag}>`;
}
