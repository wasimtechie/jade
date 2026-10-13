import { describe, expect, it } from "vitest";
import {
  searchIcons,
  VILLA_ICON_REGISTRY,
} from "@/lib/villas/amenityIconOptions";
import { registryIconCoverage } from "@/lib/villaDetailIcons";
import * as LucideIcons from "lucide-react";

describe("amenityIconOptions", () => {
  it("has 70+ icons", () => {
    expect(VILLA_ICON_REGISTRY.length).toBeGreaterThanOrEqual(70);
  });

  it("every registry icon resolves in lucide-react", () => {
    const { missing } = registryIconCoverage();
    expect(missing).toEqual([]);
  });

  it("search finds keywords", () => {
    const results = searchIcons("pool");
    expect(results.some((r) => r.name === "Waves")).toBe(true);
  });
});

describe("lucide icon names", () => {
  it("registry names exist in lucide-react", () => {
    for (const { name } of VILLA_ICON_REGISTRY) {
      expect(
        (LucideIcons as Record<string, unknown>)[name],
        `missing lucide icon: ${name}`,
      ).toBeDefined();
    }
  });
});
