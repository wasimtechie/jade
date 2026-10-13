import { describe, expect, it } from "vitest";
import {
  listPublicRootFolders,
  listStaticMediaUrls,
} from "./staticCatalog";

describe("staticCatalog", () => {
  it("indexes Villa_Retreats images", () => {
    const folders = listPublicRootFolders();
    expect(folders.some((f) => f.path === "Villa_Retreats")).toBe(true);
    const urls = listStaticMediaUrls("Villa_Retreats");
    expect(urls.length).toBeGreaterThan(50);
    expect(urls.some((u) => u.includes("Wonderland/Hero/hero.webp"))).toBe(
      true,
    );
  });
});
