import { describe, expect, it } from "vitest";
import { buildCareersApplyContext } from "@/lib/careersApplyContext";

describe("buildCareersApplyContext", () => {
  it("indexes job-card applications by role", () => {
    const ctx = buildCareersApplyContext({
      jobId: "sales",
      clientPath: "/careers",
      entryPoint: "job-card",
    });
    expect(ctx.jobId).toBe("sales");
    expect(ctx.jobTitle).toBe("SALES EXECUTIVES");
    expect(ctx.applyContext).toBe("careers:role:sales");
    expect(ctx.sourcePage).toBe("/careers");
  });

  it("indexes open CV applications separately", () => {
    const ctx = buildCareersApplyContext({
      jobId: "sales",
      clientPath: "/careers",
      entryPoint: "send-cv",
    });
    expect(ctx.jobId).toBe("open-application");
    expect(ctx.applyContext).toBe("careers:open-application");
  });
});
