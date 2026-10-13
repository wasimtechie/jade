export const MAX_RESUME_BYTES = 4 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_EXT = /\.(pdf|jpe?g|png|webp|heic|heif|doc|docx)$/i;

export function isAllowedResumeMime(mime: string, filename: string): boolean {
  const m = mime.trim().toLowerCase();
  if (m && ALLOWED_MIME.has(m)) return true;
  return ALLOWED_EXT.test(filename);
}

export const CAREER_RESUME_REQUIRED_MSG =
  "Please upload your résumé to apply.";

export function validateCareerResumeRequired(
  file: File | null | undefined,
): string | null {
  if (!file || file.size === 0) return CAREER_RESUME_REQUIRED_MSG;
  return validateCareerResumeFile(file);
}

export function validateCareerResumeFile(file: File): string | null {
  if (!file || file.size === 0) {
    return CAREER_RESUME_REQUIRED_MSG;
  }
  if (file.size > MAX_RESUME_BYTES) {
    return `Résumé must be smaller than ${MAX_RESUME_BYTES / (1024 * 1024)} MB.`;
  }
  if (!isAllowedResumeMime(file.type, file.name)) {
    return "Résumé must be a PDF or image (JPEG, PNG, WebP, HEIC) under 4 MB.";
  }
  return null;
}
