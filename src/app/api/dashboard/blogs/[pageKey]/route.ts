import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import {
  applyWorkflow,
  scheduleBlogPost,
  updateBlogSlug,
} from "@/lib/cms/blogAdmin";
import type { WorkflowAction } from "@/lib/cms/blogWorkflow";
import { z } from "zod";

export const dynamic = "force-dynamic";

type RouteCtx = { params: { pageKey: string } };

function decodeKey(pageKey: string) {
  return decodeURIComponent(pageKey);
}

const patchSchema = z.object({
  action: z
    .enum([
      "submit_review",
      "approve",
      "reject",
      "request_changes",
      "publish",
      "unpublish",
      "schedule",
      "archive",
      "restore",
      "trash",
      "restore_trash",
    ])
    .optional(),
  note: z.string().max(2000).optional(),
  scheduledPublishAt: z.string().max(40).optional(),
  slug: z.string().max(120).optional(),
  internalNotes: z.string().max(5000).optional(),
  isFeatured: z.boolean().optional(),
  isPinned: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const auth = await requireRole(req, "/dashboard/seo", "write");
  if (!auth.ok) return auth.response;

  const pageKey = decodeKey(ctx.params.pageKey);
  try {
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const body = parsed.data;

    if (body.slug) {
      const page = await updateBlogSlug(pageKey, body.slug, auth.userId);
      return NextResponse.json({
        page,
        redirectSuggestion: `/${body.slug.trim().toLowerCase()}/`,
      });
    }

    if (body.scheduledPublishAt) {
      const page = await scheduleBlogPost(
        pageKey,
        body.scheduledPublishAt,
        auth.userId,
      );
      return NextResponse.json({ page });
    }

    if (body.action) {
      const page = await applyWorkflow(
        pageKey,
        body.action as WorkflowAction,
        auth.userId,
        body.note,
      );
      return NextResponse.json({ page });
    }

    const updates: Record<string, unknown> = { updatedBy: auth.userId };
    if (body.internalNotes !== undefined) {
      updates.internalNotes = body.internalNotes;
    }
    if (body.isFeatured !== undefined) {
      updates["meta.isFeatured"] = body.isFeatured;
    }
    if (body.isPinned !== undefined) {
      updates["meta.isPinned"] = body.isPinned;
    }

    const { ContentPageModel } = await import("@/models/ContentPage");
    const page = await ContentPageModel.findOneAndUpdate(
      { pageKey },
      updates,
      { new: true },
    );
    if (!page) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ page });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    console.error("[PATCH /api/dashboard/blogs/[pageKey]]", e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  const auth = await requireRole(req, "/dashboard/seo", "write");
  if (!auth.ok) return auth.response;

  const pageKey = decodeKey(ctx.params.pageKey);
  const permanent = req.nextUrl.searchParams.get("permanent") === "1";

  try {
    if (permanent) {
      await applyWorkflow(pageKey, "delete_permanent", auth.userId);
      return NextResponse.json({ ok: true });
    }
    const page = await applyWorkflow(pageKey, "trash", auth.userId);
    return NextResponse.json({ page });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
