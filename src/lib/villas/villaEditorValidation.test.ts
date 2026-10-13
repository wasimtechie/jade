import { describe, expect, it } from "vitest";
import { validateQuickEdit, validateWizardStep } from "./villaEditorValidation";

describe("villaEditorValidation", () => {
  it("validateWizardStep 0 requires slug and name", () => {
    const errors = validateWizardStep(0, {});
    expect(errors.slug).toBeDefined();
    expect(errors.name).toBeDefined();
  });

  it("validateQuickEdit rejects short name", () => {
    const errors = validateQuickEdit({
      name: "A",
      shortName: "ok",
    } as Parameters<typeof validateQuickEdit>[0]);
    expect(errors.name).toBeDefined();
  });
});
