import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import {
  buildStaticMediaTree,
  listPublicRootFolders,
  listStaticMediaUrls,
} from "@/lib/media/staticCatalog";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, "/dashboard/media", "read");
  if (!auth.ok) return auth.response;

  const folder = req.nextUrl.searchParams.get("folder") ?? undefined;
  const urls = listStaticMediaUrls(folder?.replace(/^\/+/, ""));
  const tree = buildStaticMediaTree(urls);
  const publicFolders = listPublicRootFolders();

  if (folder) {
    const findNode = (
      node: typeof tree,
      target: string,
    ): typeof tree | null => {
      if (node.path === target) return node;
      for (const child of node.children) {
        const found = findNode(child, target);
        if (found) return found;
      }
      return null;
    };
    const node = findNode(tree, folder.replace(/^\/+/, ""));
    return NextResponse.json({ node, totalUrls: urls.length, publicFolders });
  }

  return NextResponse.json({ tree, totalUrls: urls.length, publicFolders });
}
