import { describe, expect, it } from "vitest";
import {
  validateCareerResumeFile,
  validateCareerResumeRequired,
} from "@/lib/careerResumeValidation";

describe("validateCareerResumeRequired", () => {
  it("requires a file", () => {
    expect(validateCareerResumeRequired(null)).toMatch(/upload your résumé/i);
  });
});

describe("validateCareerResumeFile", () => {
  it("accepts PDF with empty MIME when extension is .pdf", () => {
    const f = new File([new Uint8Array(10)], "cv.pdf", { type: "" });
    expect(validateCareerResumeFile(f)).toBeNull();
  });

  it("rejects oversize files", () => {
    const big = new File([new Uint8Array(5 * 1024 * 1024)], "cv.pdf", {
      type: "application/pdf",
    });
    expect(validateCareerResumeFile(big)).toMatch(/smaller than/);
  });

  it("rejects unknown extension", () => {
    const f = new File([new Uint8Array(10)], "malware.exe", {
      type: "application/octet-stream",
    });
    expect(validateCareerResumeFile(f)).toMatch(/PDF or image/);
  });
});
