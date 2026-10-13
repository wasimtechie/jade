import { describe, expect, it } from "vitest";
import {
  isHiddenFromVillasDirectory,
  isVillaPubliclyHidden,
  isVillaRecordBookable,
  repairStaleDirectoryHideFlag,
  syncVillaVisibilityFlags,
} from "./villaVisibility";

describe("villaVisibility", () => {
  it("hides from directory when status is hidden", () => {
    expect(isHiddenFromVillasDirectory({ status: "hidden" })).toBe(true);
  });

  it("shows not-bookable villas on directory", () => {
    expect(
      isHiddenFromVillasDirectory({ status: "active", bookable: false }),
    ).toBe(false);
  });

  it("respects explicit hideFromVillasDirectory flag", () => {
    expect(
      isHiddenFromVillasDirectory({
        status: "active",
        content: { hideFromVillasDirectory: true },
      }),
    ).toBe(true);
  });

  it("404 public detail when hidden", () => {
    expect(isVillaPubliclyHidden({ status: "hidden" })).toBe(true);
    expect(isVillaPubliclyHidden({ status: "active" })).toBe(false);
  });

  it("bookable flag drives CTA", () => {
    expect(isVillaRecordBookable({ id: "x", bookable: true })).toBe(true);
    expect(isVillaRecordBookable({ id: "x", bookable: false })).toBe(false);
  });

  it("sync forces bookable off when hidden", () => {
    const villa = {
      status: "hidden",
      bookable: true,
      content: {} as Record<string, unknown>,
    };
    syncVillaVisibilityFlags(villa);
    expect(villa.bookable).toBe(false);
  });

  it("sync clears directory hide when publishing to active", () => {
    const villa = {
      status: "active",
      bookable: true,
      content: { hideFromVillasDirectory: true } as Record<string, unknown>,
    };
    syncVillaVisibilityFlags(villa);
    expect(villa.content?.hideFromVillasDirectory).toBe(false);
  });

  it("sync clears directory hide for maintenance", () => {
    const villa = {
      status: "maintenance",
      content: { hideFromVillasDirectory: true } as Record<string, unknown>,
    };
    syncVillaVisibilityFlags(villa);
    expect(villa.content?.hideFromVillasDirectory).toBe(false);
  });

  it("maintenance villas remain on directory", () => {
    expect(
      isHiddenFromVillasDirectory({ status: "maintenance", bookable: false }),
    ).toBe(false);
  });

  it("repairs stale hide flag without explicit opt-out", () => {
    const doc = {
      status: "active",
      content: { hideFromVillasDirectory: true } as Record<string, unknown>,
    };
    expect(repairStaleDirectoryHideFlag(doc)).toBe(true);
    expect(doc.content?.hideFromVillasDirectory).toBe(false);
  });

  it("keeps intentional directory opt-out", () => {
    const doc = {
      status: "active",
      content: {
        hideFromVillasDirectory: true,
        directoryListingOptOut: true,
      } as Record<string, unknown>,
    };
    expect(repairStaleDirectoryHideFlag(doc)).toBe(false);
  });
});
