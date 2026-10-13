import { connectDB } from "@/lib/db";
import { ContentPageModel } from "@/models/ContentPage";
import { VillaModel } from "@/models/Villa";

export type MediaUsageRef = {
  entityType: string;
  entityId: string;
  label: string;
  fieldPath: string;
};

function pushIfMatch(
  refs: MediaUsageRef[],
  haystack: unknown,
  entityType: string,
  entityId: string,
  label: string,
  fieldPath: string,
  needles: string[],
) {
  const text = JSON.stringify(haystack ?? "");
  for (const needle of needles) {
    if (needle && text.includes(needle)) {
      refs.push({ entityType, entityId, label, fieldPath });
      return;
    }
  }
}

/** Find CMS references to a media URL or asset id. */
export async function findMediaUsage(
  publicUrl: string,
  gridFsId?: string,
): Promise<MediaUsageRef[]> {
  const refs: MediaUsageRef[] = [];
  const needles = [
    publicUrl,
    gridFsId ? `/api/media/${gridFsId}` : "",
    gridFsId ? `/api/cms/media/${gridFsId}` : "",
  ].filter(Boolean);

  await connectDB();

  const villas = await VillaModel.find({ status: { $ne: "deleted" } })
    .select("slug name thumbnail content")
    .lean();
  for (const v of villas) {
    const villa = v as {
      slug?: string;
      name?: string;
      thumbnail?: string;
      content?: unknown;
    };
    pushIfMatch(
      refs,
      { thumbnail: villa.thumbnail, content: villa.content },
      "villa",
      villa.slug ?? "",
      villa.name ?? villa.slug ?? "Villa",
      "thumbnail / content",
      needles,
    );
  }

  const pages = await ContentPageModel.find({ status: { $ne: "deleted" } })
    .select("pageKey meta sections")
    .lean();
  for (const p of pages) {
    const page = p as {
      pageKey?: string;
      meta?: { title?: string; image?: string; thumbnailImage?: string };
      sections?: unknown[];
    };
    const title =
      page.meta?.title ?? page.pageKey?.replace(/^blog\//, "") ?? page.pageKey;
    pushIfMatch(
      refs,
      { meta: page.meta, sections: page.sections },
      page.pageKey?.startsWith("blog/") ? "blog" : "content_page",
      page.pageKey ?? "",
      title ?? "Content",
      "meta / sections",
      needles,
    );
  }

  return refs;
}

export async function isMediaInUse(
  publicUrl: string,
  gridFsId?: string,
): Promise<boolean> {
  const refs = await findMediaUsage(publicUrl, gridFsId);
  return refs.length > 0;
}
