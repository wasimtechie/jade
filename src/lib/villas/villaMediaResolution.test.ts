import { describe, expect, it } from "vitest";
import {
  isDashboardAuthoredVilla,
  resolveVillaMedia,
} from "./villaMediaResolution";

describe("villaMediaResolution", () => {
  it("custom villa with single GridFS thumbnail returns one hero image", () => {
    const media = resolveVillaMedia({
      id: "saad-banglore-v1",
      portfolioSource: "custom",
      thumbnail: "/api/cms/media/abc123",
      images: [],
    });

    expect(media.hero).toEqual(["/api/cms/media/abc123"]);
    expect(media.dashboardAuthored).toBe(true);
  });

  it("custom villa with Villa_Retreats path in thumbnail does not bleed manifest", () => {
    const media = resolveVillaMedia({
      id: "saad",
      portfolioSource: "custom",
      thumbnail: "/Villa_Retreats/Diamond/Hero/Hero 1.webp",
      images: [],
    });

    expect(media.hero).toEqual(["/Villa_Retreats/Diamond/Hero/Hero 1.webp"]);
    expect(media.hero.length).toBe(1);
  });

  it("portfolio wonderland villa still gets manifest heroes when no explicit gallery", () => {
    const media = resolveVillaMedia({
      id: "wonderland",
      name: "Wonderland",
      image: "/Villa_Retreats/Wonderland/Hero/hero.webp",
      portfolioSource: "canonical",
    });

    expect(media.hero.length).toBeGreaterThan(1);
    expect(media.dashboardAuthored).toBe(false);
  });

  it("portfolio villa with explicit content.images overrides manifest hero", () => {
    const explicit = ["/Villa_Retreats/Diamond/Hero/Hero 1.webp"];
    const media = resolveVillaMedia({
      id: "diamond",
      name: "Diamond Pavilion",
      image: "/Villa_Retreats/Diamond/Hero/Hero 1.webp",
      images: explicit,
      portfolioSource: "canonical",
    });

    expect(media.hero).toEqual(explicit);
  });

  it("detects dashboard-authored when no static retreat exists", () => {
    expect(isDashboardAuthoredVilla({ id: "saad-test-villa" })).toBe(true);
    expect(
      isDashboardAuthoredVilla({ id: "diamond", portfolioSource: "canonical" }),
    ).toBe(false);
  });
});
