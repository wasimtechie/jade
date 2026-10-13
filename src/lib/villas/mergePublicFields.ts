/** Prefer dashboard text when non-empty; otherwise keep coded portfolio copy. */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function mergePublicText(
  mongoValue: string | undefined,
  staticValue: string | undefined,
): string {
  return isNonEmptyString(mongoValue)
    ? mongoValue.trim()
    : (staticValue ?? "");
}
