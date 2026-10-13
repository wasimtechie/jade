/** Lowercase slug / retreat id — hyphens only (URLs + Mongo keys). */
export function normalizeVillaSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatZodValidationError(details: unknown): string | null {
  if (!details || typeof details !== "object") return null;
  const d = details as {
    fieldErrors?: Record<string, string[] | undefined>;
    formErrors?: string[];
  };
  const parts: string[] = [];
  if (d.formErrors?.length) parts.push(...d.formErrors);
  if (d.fieldErrors) {
    for (const [field, msgs] of Object.entries(d.fieldErrors)) {
      if (msgs?.length) parts.push(`${field}: ${msgs.join(", ")}`);
    }
  }
  return parts.length ? parts.join(" · ") : null;
}
